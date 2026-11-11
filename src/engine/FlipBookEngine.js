import { createPageNode } from './pageModel.js';
import { PageFlip } from 'page-flip';
import { SoundSynthesizer } from './SoundSynthesizer.js';

export class FlipBookEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.appearance = options.appearance || {};
    this.pages = [];
    this.currentIndex = 0;
    this.zoomLevel = 1;
    this.sound = new SoundSynthesizer();
    this.sound.setEnabled(options.soundEnabled !== false);
    this.sound.setProfile(options.soundProfile || 'luxury');
    this.onKeyDown = (e) => {
      if (e.target.closest('input, textarea, select, button, [contenteditable]')) return;
      const actions = { ArrowRight: () => this.next(), PageDown: () => this.next(), ' ': () => this.next(), ArrowLeft: () => this.prev(), PageUp: () => this.prev(), Home: () => this.first(), End: () => this.last() };
      if (actions[e.key]) { e.preventDefault(); actions[e.key](); }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }
  loadPages(pages) {
    this.flip?.destroy();
    this.pages = pages;
    this.currentIndex = 0;
    this.root = document.createElement('div');
    this.root.className = 'raia-pageflip';
    this.container.replaceChildren(this.root);
    const elements = pages.map(createPageNode);
    this.root.append(...elements);
    this.flip = new PageFlip(this.root, {
      startPage: this.options.initialPage || 0, width: 480, height: 640, size: 'stretch', minWidth: 220, maxWidth: 720,
      minHeight: 290, maxHeight: 1200, showCover: this.appearance.hardCover !== false, usePortrait: true,
      flippingTime: this.appearance.duration || 420, maxShadowOpacity: this.appearance.shadow ?? .45, drawShadow: true,
      mobileScrollSupport: false, showPageCorners: true, swipeDistance: 25,
      autoSize: false, clickEventForward: false
    });
    this.flip.on('init', () => this.notify());
    this.flip.on('flip', () => this.notify());
    this.flip.on('changeOrientation', () => this.notify());
    this.flip.on('changeState', (event) => {
      if ((event.data === 'flipping' || event.data === 'user_fold') && !this.turnSoundPlayed) {
        this.turnSoundPlayed = true;
        this.sound.playPageTurn(1.15);
      }
      if (event.data === 'read') {
        this.turnSoundPlayed = false;
        if (this.queuedDirection) {
          const direction = this.queuedDirection;
          this.queuedDirection = 0;
          requestAnimationFrame(() => direction > 0 ? this.next() : this.prev());
        }
      }
    });
    this.flip.loadFromHTML(elements);
    this.configure(this.appearance);
  }
  notify() {
    const index = this.flip.getCurrentPageIndex();
    this.currentIndex = index === 0 ? 0 : Math.ceil(index / 2);
    this.applyLayout();
    const portrait = this.flip.getOrientation() === 'portrait';
    this.options.onPageChange?.({ currentSpread: this.currentIndex, totalSpreads: this.getTotalSpreads(), pageIndex: index, portrait, atEnd: index >= this.pages.length - (portrait || this.pages.length % 2 === 0 ? 1 : 2) });
  }
  configure(appearance = {}) {
    this.appearance = appearance;
    this.sound.setVolume(appearance.volume ?? .65);
    this.root?.classList.toggle("realistic-book", appearance.realistic !== false);
    this.root?.style.setProperty("--book-paper", appearance.paperColor || "#fffdf8");
    if (this.flip) { this.flip.getSettings().flippingTime = Number(appearance.duration) || 420; this.flip.getSettings().maxShadowOpacity = appearance.shadow ?? .45; }
  }
  getTotalSpreads() { return Math.ceil((this.pages.length + 1) / 2); }
  turn(direction) {
    if (!this.flip) return;
    this.sound.init();
    if (this.flip.getState() !== 'read') { this.queuedDirection = direction; return; }
    direction > 0 ? this.flip.flipNext('bottom') : this.flip.flipPrev('bottom');
  }
  next() { this.turn(1); }
  prev() { this.turn(-1); }
  first() { this.goToPage(1); }
  last() { this.goToPage(this.pages.length); }
  goToPage(number) {
    const index = Math.max(0, Math.min(this.pages.length - 1, Number(number) - 1));
    if (Number.isFinite(index)) this.flip?.flip(index, 'bottom');
  }
  goToSpread(index) { this.goToPage(index === 0 ? 1 : index * 2); }
  setSoundProfile(value) { this.sound.setProfile(value); }
  setSoundEnabled(value) { this.sound.setEnabled(value); }
  applyLayout() {
    if (!this.flip || !this.root) return;
    const index = this.flip.getCurrentPageIndex();
    const single = this.flip.getOrientation() !== 'portrait';
    const shift = single && index === 0 ? -25 : single && index === this.pages.length - 1 && this.pages.length % 2 === 0 ? 25 : 0;
    this.root.style.transform = 'translateX(' + shift + '%) scale(' + this.zoomLevel + ')';
  }
  setZoom(value) { this.zoomLevel = value; this.applyLayout(); }
  resetZoom() { this.setZoom(1); }
  destroy() { window.removeEventListener('keydown', this.onKeyDown); this.queuedDirection = 0; this.flip?.destroy(); this.sound.ctx?.close(); }
}
