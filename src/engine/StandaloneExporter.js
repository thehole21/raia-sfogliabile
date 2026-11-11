import flipSource from 'page-flip/dist/js/page-flip.browser.js?raw';
import engineSource from './FlipBookEngine.js?raw';
import soundSource from './SoundSynthesizer.js?raw';
import pdfSource from './PDFBuilder.js?raw';
import renderSource from './renderPage.js?raw';
const plain = source => source.replace(/^import .*;\r?\n/gm, '').replace(/export (class|async function)/g, '$1');
export class StandaloneExporter {
  static async export(data, css) {
    const appearance = { ...data.appearance };
    const logo = appearance.logo || '/raia-logo.png';
    if (!logo.startsWith('data:')) {
      const response = await fetch(logo); if (!response.ok) throw new Error('Logo non disponibile');
      const blob = await response.blob();
      appearance.logo = await new Promise((resolve,reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(blob); });
    }
    const json = JSON.stringify({ ...data, appearance }).replaceAll('<', '\\u003c');
    const code = `${flipSource}\nconst PageFlip = St.PageFlip;\n${plain(soundSource)}\n${plain(engineSource)}\n${plain(renderSource)}\n${plain(pdfSource)}`;
    const template = `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Catalogo Raia</title><style>${css.replaceAll('</style', '<\\/style')}
      body{margin:0;font-family:Arial,sans-serif}.standalone-reader{height:100dvh;display:flex;flex-direction:column}.standalone-reader .fliphtml5-wrapper{flex:1;min-height:0}.standalone-reader button{cursor:pointer}.offline-message{font-size:12px;padding:8px;color:#555}
      </style><body><div class="standalone-reader"><div class="fliphtml5-wrapper"><div class="fliphtml5-topbar"><div class="fliphtml5-top-brand"><img id="logo" class="reader-logo" alt="Raia"><span id="title" class="fliphtml5-top-title"></span></div><div class="fliphtml5-top-actions"><button class="fliphtml5-top-btn" id="link">Copia link</button><button class="fliphtml5-top-btn" id="pdf">Scarica PDF</button></div></div><div class="fliphtml5-stage-area"><button class="fliphtml5-side-nav fliphtml5-side-prev" id="prev" aria-label="Pagina precedente">❮</button><div id="viewer-container"><div class="flipbook-mount" id="mount"></div></div><button class="fliphtml5-side-nav fliphtml5-side-next" id="next" aria-label="Pagina successiva">❯</button></div><div class="reader-hint" id="message">Trascina gli angoli o usa le frecce per sfogliare</div><div class="fliphtml5-bottom-bar"><div class="fh5-bar-container"><div class="fh5-group"><button class="fh5-btn" id="thumbs" title="Miniature">▦</button><button class="fh5-btn" id="first" title="Prima pagina">|❮</button><button class="fh5-btn" id="back" title="Precedente">❮</button><form id="jump"><input class="fh5-page-input" id="page" value="1" aria-label="Numero pagina"><span id="total"></span></form><button class="fh5-btn" id="forward" title="Successiva">❯</button><button class="fh5-btn" id="last" title="Ultima pagina">❯|</button></div><div class="fh5-group"><button class="fh5-btn" id="sound" title="Suono carta">♪</button><button class="fh5-btn" id="zoomIn" title="Ingrandisci">＋</button><button class="fh5-btn" id="zoomOut" title="Riduci">−</button><button class="fh5-btn" id="full" title="Schermo intero">⛶</button></div></div></div><div class="fliphtml5-thumbnails-bar" id="ribbon"><div class="fh5-thumb-ribbon" id="images"></div></div></div></div><script>${code.replaceAll('</script', '<\\/script')}
      const data = ${json};
      const $ = id => document.getElementById(id);
      const a = data.appearance;
      document.title = data.title || 'Catalogo Raia'; $('title').textContent = data.title; $('logo').src = a.logo;
      const wrapper = document.querySelector('.fliphtml5-wrapper');
      wrapper.style.background = a.backgroundImage ? 'url("' + a.backgroundImage + '") center / cover' : a.background || '#c8c9cc';
      wrapper.style.setProperty('--raia-red', a.accent || '#852233'); wrapper.style.setProperty('--reader-toolbar', a.toolbar || '#292a2d');
      if(a.showArrows === false) { $('prev').hidden = true; $('next').hidden = true; }
      if(a.showDownload === false) $('pdf').hidden = true;
      if(a.showThumbnails === false) $('thumbs').hidden = true;
      const book = new FlipBookEngine($('mount'), { appearance:a, soundProfile:data.soundProfile, soundEnabled:data.soundEnabled, onPageChange(info) { $('page').value = info.pageIndex + 1; $('prev').disabled = info.pageIndex === 0; $('next').disabled = info.atEnd; }});
      book.loadPages(data.pages); $('total').textContent = ' / ' + data.pages.length;
      ['next','forward'].forEach(id => $(id).onclick = () => book.next()); ['prev','back'].forEach(id => $(id).onclick = () => book.prev());
      $('first').onclick = () => book.first(); $('last').onclick = () => book.last();
      $('jump').onsubmit = e => { e.preventDefault(); book.goToPage($('page').value); };
      let sound = data.soundEnabled !== false; $('sound').onclick = () => { sound = !sound; book.setSoundEnabled(sound); $('sound').style.opacity = sound ? 1 : .35; };
      $('zoomIn').onclick = () => book.setZoom(Math.min(2, book.zoomLevel + .25)); $('zoomOut').onclick = () => book.setZoom(Math.max(1,book.zoomLevel - .25));
      $('full').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      $('link').onclick = async () => { if(location.protocol === 'file:') { $('message').textContent = 'Per ottenere un link pubblico, carica questo file HTML sul tuo sito.'; return; } try { await navigator.clipboard.writeText(location.href); $('message').textContent = 'Link copiato'; } catch { $('message').textContent = location.href; } };
      $('pdf').onclick = async () => { $('pdf').disabled = true; $('pdf').textContent = 'Preparazione…'; try { const blob = await PDFBuilder.generate(data.pages); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'catalogo-raia.pdf'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url),1000); } catch { $('message').textContent = 'Download PDF non riuscito. Riprova.'; } finally { $('pdf').disabled = false; $('pdf').textContent = 'Scarica PDF'; } };
      $('thumbs').onclick = () => $('ribbon').classList.toggle('open');
      data.pages.forEach((p,i) => { const button = document.createElement('button'); button.className = 'fh5-ribbon-item'; button.style.border = '0'; button.style.background = 'transparent'; const img = document.createElement('img'); img.src = p.blank ? '' : p.src; img.style.cssText = 'width:60px;height:80px;object-fit:contain;background:white'; const label = document.createElement('span'); label.textContent = i + 1; button.append(img,label); button.onclick = () => { book.goToPage(i+1); $('ribbon').classList.remove('open'); }; $('images').append(button); });
      </script></body></html>`;
    return new Blob([template], { type: 'text/html;charset=utf-8' });
  }
}
