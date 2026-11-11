// Raia FlipHTML5 Standalone Single-File Exporter
// Compiles full FlipHTML5 experience into 1 portable HTML file with zero server dependencies

export class StandaloneExporter {
  static async export(catalogData, cssRules) {
    const title = catalogData.title || 'Catalogo Esclusivo';
    const subtitle = catalogData.subtitle || 'Design, Stampa e Comunicazione';
    const pagesJson = JSON.stringify(catalogData.pages);
    const soundProfile = catalogData.soundProfile || 'luxury';

    const template = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title} | Raia FlipHTML5</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${cssRules}
    /* Standalone resets */
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #0d0f15;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #f1f3f7;
      user-select: none;
      -webkit-user-select: none;
    }
  </style>
</head>
<body class="theme-raia">

  <!-- FlipHTML5 Topbar -->
  <div class="fliphtml5-topbar">
    <div class="fliphtml5-top-brand">
      <span style="font-weight: 800; color: #852233; font-size: 16px;">RAIA</span>
      <span class="fliphtml5-top-title">${title}</span>
    </div>
    <div class="fliphtml5-top-actions">
      <button class="fliphtml5-top-btn" id="btn-top-print">Stampa</button>
      <button class="fliphtml5-top-btn" id="btn-top-fs">Schermo Intero</button>
    </div>
  </div>

  <!-- Central Stage with Side Chevrons -->
  <div class="fliphtml5-stage-area">
    <button class="fliphtml5-side-nav fliphtml5-side-prev" id="side-prev">❮</button>
    <div id="viewer-container">
      <div id="flipbook-mount"></div>
    </div>
    <button class="fliphtml5-side-nav fliphtml5-side-next" id="side-next">❯</button>
  </div>

  <!-- FlipHTML5 Bottom Dock Bar -->
  <div class="fliphtml5-bottom-bar">
    <div class="fh5-bar-container">
      <div class="fh5-group">
        <button class="fh5-btn" id="btn-toc" title="Sommario">📑</button>
        <button class="fh5-btn" id="btn-thumbs" title="Miniature">🗂️</button>
      </div>

      <div class="fh5-separator"></div>

      <div class="fh5-group fh5-nav-group">
        <button class="fh5-btn" id="btn-first" title="Prima Pagina">|◀</button>
        <button class="fh5-btn" id="btn-prev" title="Precedente">◀</button>
        <div class="fh5-page-jump-box">
          <input type="text" id="page-jump-input" class="fh5-page-input" value="1" />
          <span class="fh5-page-total" id="tot-pages-label">/ 1</span>
        </div>
        <button class="fh5-btn" id="btn-next" title="Successiva">▶</button>
        <button class="fh5-btn" id="btn-last" title="Ultima Pagina">▶|</button>
      </div>

      <div class="fh5-separator"></div>

      <div class="fh5-group">
        <button class="fh5-btn" id="btn-play" title="Presentazione">▶</button>
        <button class="fh5-btn" id="btn-sound" title="Audio">🔊</button>
        <button class="fh5-btn" id="btn-zoom-in" title="Zoom +">🔍+</button>
        <button class="fh5-btn" id="btn-zoom-out" title="Zoom -">🔍-</button>
        <button class="fh5-btn" id="btn-fs" title="Schermo Intero">⛶</button>
      </div>
    </div>
  </div>

  <!-- Left Drawer: Table of Contents -->
  <div class="fliphtml5-side-drawer" id="side-drawer">
    <div class="fh5-drawer-header">
      <div class="fh5-drawer-title">Sommario</div>
      <button class="fh5-drawer-close" id="close-drawer">&times;</button>
    </div>
    <div class="fh5-toc-list" id="toc-list"></div>
  </div>

  <!-- Bottom Drawer: Thumbnails Ribbon -->
  <div class="fliphtml5-thumbnails-bar" id="thumbs-bar">
    <div class="fh5-thumb-bar-header">
      <span>Miniature Pagine</span>
      <button class="fh5-drawer-close" id="close-thumbs">&times;</button>
    </div>
    <div class="fh5-thumb-ribbon" id="thumbs-ribbon"></div>
  </div>

  <script>
    class SoundSynthesizer {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.75;
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
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.volume, now);
        gain.connect(this.ctx.destination);
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
        env.connect(gain);
        src.start(now);
      }
    }

    class FlipBookEngine {
      constructor(container) {
        this.container = container;
        this.pages = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.sound = new SoundSynthesizer();
        this.zoom = 1.0;
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
            <div class="fb-edges fb-edges-left"></div>
            <div class="fb-edges fb-edges-right"></div>
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
        } else if (this.currentIndex >= total - 1 && !spread.right) {
          this.book.classList.remove('fb-state-closed-start');
          this.book.classList.add('fb-state-closed-end');
          this.leftContent.innerHTML = this.renderHTML(spread.left, true);
          this.rightContent.innerHTML = '';
        } else {
          this.book.classList.remove('fb-state-closed-start');
          this.book.classList.remove('fb-state-closed-end');
          this.leftContent.innerHTML = this.renderHTML(spread.left, true);
          this.rightContent.innerHTML = this.renderHTML(spread.right, false);
        }
        this.turner.style.display = 'none';

        const input = document.getElementById('page-jump-input');
        if (input) {
          if (this.currentIndex === 0) input.value = '1';
          else {
            const l = this.currentIndex * 2;
            const r = Math.min(this.pages.length, l + 1);
            input.value = l === r ? l : l + '-' + r;
          }
        }
      }
      first() { this.goTo(0); }
      last() { this.goTo(this.getTotalSpreads() - 1); }
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
      setZoom(z) {
        this.zoom = z;
        this.book.style.transform = 'scale(' + z + ')';
      }
    }

    const pages = ${pagesJson};
    document.addEventListener('DOMContentLoaded', () => {
      const mount = document.getElementById('flipbook-mount');
      const book = new FlipBookEngine(mount);
      book.loadPages(pages);

      document.getElementById('tot-pages-label').textContent = '/ ' + pages.length;

      // Nav buttons
      document.getElementById('btn-next').addEventListener('click', () => book.next());
      document.getElementById('btn-prev').addEventListener('click', () => book.prev());
      document.getElementById('side-next').addEventListener('click', () => book.next());
      document.getElementById('side-prev').addEventListener('click', () => book.prev());
      document.getElementById('btn-first').addEventListener('click', () => book.first());
      document.getElementById('btn-last').addEventListener('click', () => book.last());

      // Zoom
      document.getElementById('btn-zoom-in').addEventListener('click', () => book.setZoom(Math.min(2.5, book.zoom + 0.25)));
      document.getElementById('btn-zoom-out').addEventListener('click', () => book.setZoom(Math.max(0.8, book.zoom - 0.25)));

      // Audio toggle
      let soundOn = true;
      document.getElementById('btn-sound').addEventListener('click', () => {
        soundOn = !soundOn;
        book.sound.enabled = soundOn;
        document.getElementById('btn-sound').textContent = soundOn ? '🔊' : '🔇';
      });

      // Presentation
      let playInterval = null;
      document.getElementById('btn-play').addEventListener('click', () => {
        if (playInterval) {
          clearInterval(playInterval);
          playInterval = null;
          document.getElementById('btn-play').textContent = '▶';
        } else {
          document.getElementById('btn-play').textContent = '⏸';
          playInterval = setInterval(() => {
            if (book.currentIndex >= book.getTotalSpreads() - 1) book.goTo(0);
            else book.next();
          }, 4200);
        }
      });

      // Print
      document.getElementById('btn-top-print').addEventListener('click', () => window.print());

      // Fullscreen
      const toggleFs = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      };
      document.getElementById('btn-fs').addEventListener('click', toggleFs);
      document.getElementById('btn-top-fs').addEventListener('click', toggleFs);

      // TOC
      const tocList = document.getElementById('toc-list');
      const sideDrawer = document.getElementById('side-drawer');
      pages.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'fh5-toc-item';
        item.innerHTML = '<span class="fh5-toc-num">' + (i === 0 ? 'Cop.' : 'P.' + (i + 1)) + '</span><span class="fh5-toc-text">' + (p.title || 'Pagina ' + (i + 1)) + '</span>';
        item.addEventListener('click', () => {
          book.goTo(i === 0 ? 0 : Math.ceil(i / 2));
          sideDrawer.classList.remove('open');
        });
        tocList.appendChild(item);
      });
      document.getElementById('btn-toc').addEventListener('click', () => sideDrawer.classList.toggle('open'));
      document.getElementById('close-drawer').addEventListener('click', () => sideDrawer.classList.remove('open'));

      // Thumbnails ribbon
      const thumbsBar = document.getElementById('thumbs-bar');
      const ribbon = document.getElementById('thumbs-ribbon');
      pages.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'fh5-ribbon-item';
        item.innerHTML = '<div class="fh5-thumb-img-wrap"><img src="' + p.src + '" /></div><span class="fh5-ribbon-label">' + (i === 0 ? 'Cop.' : 'P.' + i) + '</span>';
        item.addEventListener('click', () => book.goTo(i === 0 ? 0 : Math.ceil(i / 2)));
        ribbon.appendChild(item);
      });
      document.getElementById('btn-thumbs').addEventListener('click', () => thumbsBar.classList.toggle('open'));
      document.getElementById('close-thumbs').addEventListener('click', () => thumbsBar.classList.remove('open'));
    });
  </script>
</body>
</html>`;

    return new Blob([template], { type: 'text/html;charset=utf-8' });
  }
}
