// Raia 3D Physics FlipBook Engine
import { SoundSynthesizer } from './SoundSynthesizer.js';

export class FlipBookEngine {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.pages = [];
    this.currentIndex = 0;
    this.isAnimating = false;
    this.options = Object.assign({
      width: 960,
      height: 640,
      soundEnabled: true,
      soundProfile: 'luxury',
      onPageChange: null
    }, options);

    this.sound = new SoundSynthesizer();
    this.sound.setProfile(this.options.soundProfile);
    this.sound.setEnabled(this.options.soundEnabled);

    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;

    this.initDOM();
    this.bindEvents();
  }

  setSoundProfile(profile) {
    this.sound.setProfile(profile);
  }

  setSoundEnabled(enabled) {
    this.sound.setEnabled(enabled);
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="fb-stage">
        <div class="fb-viewport">
          <div class="fb-book">
            <div class="fb-spread fb-spread-left">
              <div class="fb-page-content" id="fb-left-content"></div>
              <div class="fb-gutter-shadow fb-gutter-left"></div>
            </div>
            <div class="fb-spread fb-spread-right">
              <div class="fb-page-content" id="fb-right-content"></div>
              <div class="fb-gutter-shadow fb-gutter-right"></div>
            </div>
            <!-- Turning Sheet -->
            <div class="fb-turning-sheet" id="fb-turner">
              <div class="fb-sheet-face fb-sheet-front" id="fb-front-face">
                <div class="fb-page-content" id="fb-front-content"></div>
                <div class="fb-page-lighting" id="fb-front-lighting"></div>
              </div>
              <div class="fb-sheet-face fb-sheet-back" id="fb-back-face">
                <div class="fb-page-content" id="fb-back-content"></div>
                <div class="fb-page-lighting" id="fb-back-lighting"></div>
              </div>
            </div>
            <!-- Realistic stacked edges -->
            <div class="fb-edges fb-edges-left" id="fb-edges-l"></div>
            <div class="fb-edges fb-edges-right" id="fb-edges-r"></div>
            <!-- Center spine line -->
            <div class="fb-spine"></div>
          </div>
        </div>
      </div>
    `;

    this.stage = this.container.querySelector('.fb-stage');
    this.viewport = this.container.querySelector('.fb-viewport');
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
  }

  loadPages(pagesData) {
    this.pages = pagesData || [];
    this.currentIndex = 0;
    this.updateView();
  }

  getTotalSpreads() {
    if (this.pages.length === 0) return 1;
    if (this.pages.length === 1) return 1;
    return Math.ceil((this.pages.length + 1) / 2);
  }

  getSpreadPages(spreadIdx) {
    if (this.pages.length === 0) return { left: null, right: null };
    if (spreadIdx === 0) {
      return { left: null, right: this.pages[0] };
    }
    const leftIdx = (spreadIdx * 2) - 1;
    const rightIdx = spreadIdx * 2;
    return {
      left: leftIdx < this.pages.length ? this.pages[leftIdx] : null,
      right: rightIdx < this.pages.length ? this.pages[rightIdx] : null
    };
  }

  renderPageHTML(page, isLeft = false) {
    if (!page) {
      return `<div class="fb-empty-page"></div>`;
    }

    const isCover = page.isCover || (page.type === 'cover');
    const isBack = page.isBack || (page.type === 'back');
    const pageNum = page.pageNumber !== undefined ? page.pageNumber : '';

    return `
      <div class="fb-page-inner ${isCover ? 'fb-page-cover' : ''} ${isBack ? 'fb-page-backcover' : ''}">
        <div class="fb-page-media" style="background-image: url('${page.src}')">
          <img src="${page.src}" alt="${page.title || ''}" class="fb-page-img" draggable="false" />
        </div>
        ${!isCover && !isBack && pageNum ? `
          <div class="fb-page-footer ${isLeft ? 'fb-footer-left' : 'fb-footer-right'}">
            <span class="fb-footer-title">${page.title || ''}</span>
            <span class="fb-page-num">${pageNum}</span>
          </div>
        ` : ''}
        ${isCover && page.title ? `
          <div class="fb-cover-overlay">
            <div class="fb-cover-badge">RAIA EDITIONS</div>
            <h2 class="fb-cover-title">${page.title}</h2>
            ${page.subtitle ? `<p class="fb-cover-subtitle">${page.subtitle}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  updateView() {
    const spread = this.getSpreadPages(this.currentIndex);
    const totalSpreads = this.getTotalSpreads();

    if (this.currentIndex === 0) {
      this.book.classList.add('fb-state-closed-start');
      this.book.classList.remove('fb-state-closed-end');
      this.leftContent.innerHTML = '';
      this.rightContent.innerHTML = this.renderPageHTML(spread.right, false);
      this.edgesLeft.style.display = 'none';
      this.edgesRight.style.display = 'block';
    } else if (this.currentIndex >= totalSpreads - 1 && spread.right === null) {
      this.book.classList.remove('fb-state-closed-start');
      this.book.classList.add('fb-state-closed-end');
      this.leftContent.innerHTML = this.renderPageHTML(spread.left, true);
      this.rightContent.innerHTML = '';
      this.edgesLeft.style.display = 'block';
      this.edgesRight.style.display = 'none';
    } else {
      this.book.classList.remove('fb-state-closed-start');
      this.book.classList.remove('fb-state-closed-end');
      this.leftContent.innerHTML = this.renderPageHTML(spread.left, true);
      this.rightContent.innerHTML = this.renderPageHTML(spread.right, false);
      this.edgesLeft.style.display = 'block';
      this.edgesRight.style.display = 'block';
    }

    this.turner.style.display = 'none';
    this.turner.style.transform = 'none';

    if (typeof this.options.onPageChange === 'function') {
      this.options.onPageChange({
        currentSpread: this.currentIndex,
        totalSpreads: totalSpreads,
        spreadPages: spread,
        pages: this.pages
      });
    }
  }

  next() {
    const totalSpreads = this.getTotalSpreads();
    if (this.currentIndex >= totalSpreads - 1 || this.isAnimating) return;
    this.flipSpread(this.currentIndex + 1, 1);
  }

  prev() {
    if (this.currentIndex <= 0 || this.isAnimating) return;
    this.flipSpread(this.currentIndex - 1, -1);
  }

  goToSpread(targetIndex) {
    if (this.isAnimating || targetIndex === this.currentIndex) return;
    const totalSpreads = this.getTotalSpreads();
    const validIndex = Math.max(0, Math.min(totalSpreads - 1, targetIndex));
    if (validIndex > this.currentIndex) {
      this.flipSpread(validIndex, 1);
    } else {
      this.flipSpread(validIndex, -1);
    }
  }

  flipSpread(newSpreadIdx, direction) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const currentSpread = this.getSpreadPages(this.currentIndex);
    const nextSpread = this.getSpreadPages(newSpreadIdx);

    this.sound.playPageTurn(1.0);

    this.turner.style.display = 'block';
    this.turner.classList.remove('fb-turner-left-origin', 'fb-turner-right-origin');

    if (direction === 1) {
      this.turner.classList.add('fb-turner-left-origin');
      this.frontContent.innerHTML = this.renderPageHTML(currentSpread.right, false);
      this.backContent.innerHTML = this.renderPageHTML(nextSpread.left, true);
      this.rightContent.innerHTML = this.renderPageHTML(nextSpread.right, false);

      this.animateTurn(0, -180, 720, () => {
        this.currentIndex = newSpreadIdx;
        this.isAnimating = false;
        this.updateView();
      });
    } else {
      this.turner.classList.add('fb-turner-right-origin');
      this.frontContent.innerHTML = this.renderPageHTML(currentSpread.left, true);
      this.backContent.innerHTML = this.renderPageHTML(nextSpread.right, false);
      this.leftContent.innerHTML = this.renderPageHTML(nextSpread.left, true);

      this.animateTurn(0, 180, 720, () => {
        this.currentIndex = newSpreadIdx;
        this.isAnimating = false;
        this.updateView();
      });
    }
  }

  animateTurn(fromAngle, toAngle, duration, onComplete) {
    const startTime = performance.now();
    const diff = toAngle - fromAngle;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentAngle = fromAngle + (diff * ease);
      this.turner.style.transform = `rotateY(${currentAngle}deg)`;

      const shadowIntensity = Math.sin(progress * Math.PI) * 0.45;
      const specularIntensity = Math.sin(progress * Math.PI) * 0.25;

      if (toAngle < 0) {
        if (progress < 0.5) {
          this.frontLighting.style.background = `linear-gradient(to right, rgba(0,0,0,${shadowIntensity}) 0%, rgba(255,255,255,${specularIntensity}) 40%, rgba(0,0,0,${shadowIntensity * 0.5}) 100%)`;
          this.backLighting.style.background = 'transparent';
        } else {
          this.frontLighting.style.background = 'transparent';
          this.backLighting.style.background = `linear-gradient(to left, rgba(0,0,0,${shadowIntensity}) 0%, rgba(255,255,255,${specularIntensity}) 40%, rgba(0,0,0,${shadowIntensity * 0.5}) 100%)`;
        }
      } else {
        if (progress < 0.5) {
          this.frontLighting.style.background = `linear-gradient(to left, rgba(0,0,0,${shadowIntensity}) 0%, rgba(255,255,255,${specularIntensity}) 40%, rgba(0,0,0,${shadowIntensity * 0.5}) 100%)`;
          this.backLighting.style.background = 'transparent';
        } else {
          this.frontLighting.style.background = 'transparent';
          this.backLighting.style.background = `linear-gradient(to right, rgba(0,0,0,${shadowIntensity}) 0%, rgba(255,255,255,${specularIntensity}) 40%, rgba(0,0,0,${shadowIntensity * 0.5}) 100%)`;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.frontLighting.style.background = 'transparent';
        this.backLighting.style.background = 'transparent';
        if (typeof onComplete === 'function') onComplete();
      }
    };

    requestAnimationFrame(step);
  }

  setZoom(val) {
    this.zoomLevel = Math.max(0.8, Math.min(2.5, val));
    if (this.zoomLevel === 1) {
      this.panX = 0;
      this.panY = 0;
    }
    this.applyTransform();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
  }

  applyTransform() {
    this.book.style.transform = `scale(${this.zoomLevel}) translate(${this.panX}px, ${this.panY}px)`;
  }

  bindEvents() {
    const rightSpread = this.container.querySelector('.fb-spread-right');
    const leftSpread = this.container.querySelector('.fb-spread-left');

    rightSpread.addEventListener('click', () => {
      if (this.zoomLevel > 1.1) return;
      this.next();
    });

    leftSpread.addEventListener('click', () => {
      if (this.zoomLevel > 1.1) return;
      this.prev();
    });

    this.onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.goToSpread(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        this.goToSpread(this.getTotalSpreads() - 1);
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    // Touch swipe
    let touchStartX = 0;
    let touchStartY = 0;

    this.stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.stage.addEventListener('touchend', (e) => {
      if (this.zoomLevel > 1.1) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) this.next();
        else this.prev();
      }
    });

    // Mouse Pan when zoomed
    this.stage.addEventListener('mousedown', (e) => {
      if (this.zoomLevel > 1.1) {
        this.isPanning = true;
        this.panStartX = e.clientX - this.panX;
        this.panStartY = e.clientY - this.panY;
        this.stage.style.cursor = 'grabbing';
      }
    });

    this.onMouseMove = (e) => {
      if (this.isPanning) {
        this.panX = e.clientX - this.panStartX;
        this.panY = e.clientY - this.panStartY;
        this.applyTransform();
      }
    };
    window.addEventListener('mousemove', this.onMouseMove);

    this.onMouseUp = () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.stage.style.cursor = '';
      }
    };
    window.addEventListener('mouseup', this.onMouseUp);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }
}
