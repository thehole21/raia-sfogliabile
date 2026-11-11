// Raia Standalone Single-File HTML Flipbook Exporter
// Embeds all images, styles, audio synthesizer, and 3D physics into one portable HTML file

export class StandaloneExporter {
  static async export(catalogData, cssRules) {
    const title = catalogData.title || 'Catalogo Esclusivo';
    const subtitle = catalogData.subtitle || 'Design, Stampa e Comunicazione';
    const client = catalogData.client || '';
    const pagesJson = JSON.stringify(catalogData.pages);
    const soundProfile = catalogData.soundProfile || 'luxury';

    const template = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title} | Raia Sfogliabile</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${cssRules}
    /* Brand specific standalone overrides */
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #0f1117;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #f1f3f7;
      user-select: none;
      -webkit-user-select: none;
    }
    .standalone-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: linear-gradient(180deg, rgba(15,17,23,0.94) 0%, rgba(15,17,23,0) 100%);
      z-index: 100;
      pointer-events: none;
    }
    .standalone-brand {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #852233;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 0 16px rgba(133, 34, 51, 0.4);
    }
    .standalone-brand h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #ffffff;
      line-height: 1.1;
    }
    .standalone-brand span {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #852233;
      font-weight: 700;
    }
  </style>
</head>
<body class="theme-raia">
  <div class="standalone-header">
    <div class="standalone-brand">
      <div class="brand-circle">R</div>
      <div>
        <h1>${title}</h1>
        <span>RAIA • DESIGN & STAMPA</span>
      </div>
    </div>
    <div style="pointer-events: auto; font-size: 12px; color: #cbd5e1; background: rgba(0,0,0,0.5); padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
      Frecce tastiera o trascina per sfogliare
    </div>
  </div>

  <div id="viewer-container">
    <div id="flipbook-mount"></div>
  </div>

  <div class="viewer-controls" id="viewer-controls">
    <button class="v-btn" id="btn-prev" title="Pagina Precedente">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <div class="v-indicator">
      <span id="cur-spread">1</span> / <span id="tot-spread">1</span>
    </div>
    <button class="v-btn" id="btn-next" title="Pagina Successiva">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <div class="v-divider"></div>
    <button class="v-btn" id="btn-sound" title="Suono Carta">
      <svg id="icon-sound-on" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      <svg id="icon-sound-off" style="display:none;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
    </button>
    <button class="v-btn" id="btn-thumbnails" title="Miniature">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
    </button>
    <button class="v-btn" id="btn-zoom-in" title="Zoom">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
    </button>
    <button class="v-btn" id="btn-fullscreen" title="Schermo Intero">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
    </button>
  </div>

  <div class="thumbnails-drawer" id="thumbnails-drawer">
    <div class="thumbnails-header">
      <span>Pagine Catalogo</span>
      <button class="t-close" id="btn-close-thumbnails">&times;</button>
    </div>
    <div class="thumbnails-scroll" id="thumbnails-list"></div>
  </div>

  <script>
    // Procedural sound synthesizer
    class SoundSynthesizer {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.75;
        this.profile = '${soundProfile}';
      }
      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
      playPageTurn() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const mainGain = this.ctx.createGain();
        mainGain.gain.setValueAtTime(this.volume, now);
        mainGain.connect(this.ctx.destination);
        const dur = 0.38;
        const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          const w = Math.random() * 2 - 1;
          data[i] = (last + 0.02 * w) / 1.02;
          last = data[i];
          data[i] *= 3.5;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2200, now);
        bp.frequency.exponentialRampToValueAtTime(1300, now + dur);
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.001, now);
        env.gain.linearRampToValueAtTime(0.55 * this.volume, now + 0.08);
        env.gain.exponentialRampToValueAtTime(0.001, now + dur);
        src.connect(bp);
        bp.connect(env);
        env.connect(mainGain);
        src.start(now);
      }
    }

    // 3D FlipBook Engine
    class FlipBookEngine {
      constructor(container) {
        this.container = container;
        this.pages = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.sound = new SoundSynthesizer();
        this.zoom = 1;
        this.init();
      }
      init() {
        this.container.innerHTML = \`
          <div class="fb-stage"><div class="fb-viewport"><div class="fb-book">
            <div class="fb-spread fb-spread-left"><div class="fb-page-content" id="fb-left-content"></div><div class="fb-gutter-shadow fb-gutter-left"></div></div>
            <div class="fb-spread fb-spread-right"><div class="fb-page-content" id="fb-right-content"></div><div class="fb-gutter-shadow fb-gutter-right"></div></div>
            <div class="fb-turning-sheet" id="fb-turner">
              <div class="fb-sheet-face fb-sheet-front" id="fb-front-face"><div class="fb-page-content" id="fb-front-content"></div><div class="fb-page-lighting" id="fb-front-lighting"></div></div>
              <div class="fb-sheet-face fb-sheet-back" id="fb-back-face"><div class="fb-page-content" id="fb-back-content"></div><div class="fb-page-lighting" id="fb-back-lighting"></div></div>
            </div>
            <div class="fb-edges fb-edges-left" id="fb-edges-l"></div>
            <div class="fb-edges fb-edges-right" id="fb-edges-r"></div>
            <div class="fb-spine"></div>
          </div></div></div>\`;
        this.book = this.container.querySelector('.fb-book');
        this.leftContent = this.container.querySelector('#fb-left-content');
        this.rightContent = this.container.querySelector('#fb-right-content');
        this.turner = this.container.querySelector('#fb-turner');
        this.frontContent = this.container.querySelector('#fb-front-content');
        this.backContent = this.container.querySelector('#fb-back-content');
        this.frontLighting = this.container.querySelector('#fb-front-lighting');
        this.backLighting = this.container.querySelector('#fb-back-lighting');
        this.edgesLeft = this.container.querySelector('#fb-edges-l');
        this.edgesRight = this.container.querySelector('#fb-edges-r');

        this.container.querySelector('.fb-spread-right').addEventListener('click', () => this.next());
        this.container.querySelector('.fb-spread-left').addEventListener('click', () => this.prev());
        window.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === ' ') this.next();
          if (e.key === 'ArrowLeft') this.prev();
        });
      }
      loadPages(p) {
        this.pages = p;
        this.currentIndex = 0;
        this.updateView();
      }
      getTotalSpreads() {
        if (!this.pages.length) return 1;
        return Math.ceil((this.pages.length + 1) / 2);
      }
      getSpreadPages(idx) {
        if (!this.pages.length) return { left: null, right: null };
        if (idx === 0) return { left: null, right: this.pages[0] };
        return {
          left: this.pages[(idx * 2) - 1] || null,
          right: this.pages[idx * 2] || null
        };
      }
      renderHTML(p, isLeft) {
        if (!p) return '<div class="fb-empty-page"></div>';
        return \`<div class="fb-page-inner \${p.isCover ? 'fb-page-cover' : ''}">
          <div class="fb-page-media" style="background-image: url('\${p.src}')"><img src="\${p.src}" class="fb-page-img" /></div>
          \${!p.isCover && p.pageNumber ? \`<div class="fb-page-footer \${isLeft ? 'fb-footer-left' : 'fb-footer-right'}"><span>\${p.title||''}</span><span>\${p.pageNumber}</span></div>\` : ''}
        </div>\`;
      }
      updateView() {
        const spread = this.getSpreadPages(this.currentIndex);
        const total = this.getTotalSpreads();
        if (this.currentIndex === 0) {
          this.book.classList.add('fb-state-closed-start');
          this.book.classList.remove('fb-state-closed-end');
          this.leftContent.innerHTML = '';
          this.rightContent.innerHTML = this.renderHTML(spread.right, false);
          this.edgesLeft.style.display = 'none';
          this.edgesRight.style.display = 'block';
        } else if (this.currentIndex >= total - 1 && !spread.right) {
          this.book.classList.remove('fb-state-closed-start');
          this.book.classList.add('fb-state-closed-end');
          this.leftContent.innerHTML = this.renderHTML(spread.left, true);
          this.rightContent.innerHTML = '';
          this.edgesLeft.style.display = 'block';
          this.edgesRight.style.display = 'none';
        } else {
          this.book.classList.remove('fb-state-closed-start');
          this.book.classList.remove('fb-state-closed-end');
          this.leftContent.innerHTML = this.renderHTML(spread.left, true);
          this.rightContent.innerHTML = this.renderHTML(spread.right, false);
          this.edgesLeft.style.display = 'block';
          this.edgesRight.style.display = 'block';
        }
        this.turner.style.display = 'none';
        document.getElementById('cur-spread').textContent = this.currentIndex + 1;
        document.getElementById('tot-spread').textContent = total;
      }
      next() {
        if (this.currentIndex >= this.getTotalSpreads() - 1 || this.isAnimating) return;
        this.flip(this.currentIndex + 1, 1);
      }
      prev() {
        if (this.currentIndex <= 0 || this.isAnimating) return;
        this.flip(this.currentIndex - 1, -1);
      }
      goTo(idx) {
        if (idx === this.currentIndex || this.isAnimating) return;
        this.flip(idx, idx > this.currentIndex ? 1 : -1);
      }
      flip(newIdx, dir) {
        this.isAnimating = true;
        this.sound.playPageTurn();
        const curSpread = this.getSpreadPages(this.currentIndex);
        const nextSpread = this.getSpreadPages(newIdx);
        this.turner.style.display = 'block';
        this.turner.classList.remove('fb-turner-left-origin', 'fb-turner-right-origin');
        if (dir === 1) {
          this.turner.classList.add('fb-turner-left-origin');
          this.frontContent.innerHTML = this.renderHTML(curSpread.right, false);
          this.backContent.innerHTML = this.renderHTML(nextSpread.left, true);
          this.rightContent.innerHTML = this.renderHTML(nextSpread.right, false);
          this.animate(-180, () => {
            this.currentIndex = newIdx;
            this.isAnimating = false;
            this.updateView();
          });
        } else {
          this.turner.classList.add('fb-turner-right-origin');
          this.frontContent.innerHTML = this.renderHTML(curSpread.left, true);
          this.backContent.innerHTML = this.renderHTML(nextSpread.right, false);
          this.leftContent.innerHTML = this.renderHTML(nextSpread.left, true);
          this.animate(180, () => {
            this.currentIndex = newIdx;
            this.isAnimating = false;
            this.updateView();
          });
        }
      }
      animate(targetAngle, cb) {
        const start = performance.now();
        const dur = 720;
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          this.turner.style.transform = 'rotateY(' + (targetAngle * ease) + 'deg)';
          if (p < 1) requestAnimationFrame(step);
          else cb();
        };
        requestAnimationFrame(step);
      }
    }

    const pages = ${pagesJson};
    document.addEventListener('DOMContentLoaded', () => {
      const mount = document.getElementById('flipbook-mount');
      const book = new FlipBookEngine(mount);
      book.loadPages(pages);

      document.getElementById('btn-next').addEventListener('click', () => book.next());
      document.getElementById('btn-prev').addEventListener('click', () => book.prev());

      const tList = document.getElementById('thumbnails-list');
      pages.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'thumb-item';
        item.innerHTML = '<img src="' + p.src + '" /><div class="thumb-label">' + (i === 0 ? 'Copertina' : 'Pag. ' + i) + '</div>';
        item.addEventListener('click', () => {
          book.goTo(i === 0 ? 0 : Math.ceil(i / 2));
        });
        tList.appendChild(item);
      });

      const drawer = document.getElementById('thumbnails-drawer');
      document.getElementById('btn-thumbnails').addEventListener('click', () => drawer.classList.toggle('open'));
      document.getElementById('btn-close-thumbnails').addEventListener('click', () => drawer.classList.remove('open'));
      document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      });
    });
  </script>
</body>
</html>`;

    return new Blob([template], { type: 'text/html;charset=utf-8' });
  }
}
