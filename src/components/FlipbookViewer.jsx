import React, { useEffect, useRef, useState } from 'react';
import { FlipBookEngine } from '../engine/FlipBookEngine.js';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Grid,
  ZoomIn,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  X
} from 'lucide-react';

export function FlipbookViewer({ pages, soundProfile, theme, showToast }) {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const [currentSpread, setCurrentSpread] = useState(1);
  const [totalSpreads, setTotalSpreads] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const autoplayTimerRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || pages.length === 0) return;

    if (!engineRef.current) {
      engineRef.current = new FlipBookEngine(mountRef.current, {
        soundEnabled: soundEnabled,
        soundProfile: soundProfile,
        onPageChange: (info) => {
          setCurrentSpread(info.currentSpread + 1);
          setTotalSpreads(info.totalSpreads);
        }
      });
    }

    engineRef.current.setSoundProfile(soundProfile);
    engineRef.current.setSoundEnabled(soundEnabled);
    engineRef.current.loadPages(pages);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [pages, soundProfile]);

  const handleNext = () => engineRef.current?.next();
  const handlePrev = () => engineRef.current?.prev();

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    engineRef.current?.setSoundEnabled(next);
    showToast(next ? 'Suono carta attivato' : 'Suono disattivato');
  };

  const handleZoomIn = () => {
    const nextZoom = zoomLevel >= 1.8 ? 1.0 : zoomLevel + 0.35;
    setZoomLevel(nextZoom);
    engineRef.current?.setZoom(nextZoom);
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
    engineRef.current?.resetZoom();
  };

  const toggleAutoplay = () => {
    if (isPlaying) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
      setIsPlaying(false);
      showToast('Presentazione in pausa');
    } else {
      setIsPlaying(true);
      showToast('Presentazione automatica avviata');
      autoplayTimerRef.current = setInterval(() => {
        if (!engineRef.current) return;
        if (engineRef.current.currentIndex >= engineRef.current.getTotalSpreads() - 1) {
          engineRef.current.goToSpread(0);
        } else {
          engineRef.current.next();
        }
      }, 4200);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const goToPage = (index) => {
    const spreadIdx = index === 0 ? 0 : Math.ceil(index / 2);
    engineRef.current?.goToSpread(spreadIdx);
  };

  return (
    <div className={`viewer-wrapper theme-${theme}`}>
      <div id="viewer-container">
        {pages.length === 0 ? (
          <div className="viewer-empty-state">
            <h3>Nessuna pagina nel catalogo</h3>
            <p>Carica le tue immagini nello Studio o clicca "Carica Demo Raia" in alto.</p>
          </div>
        ) : (
          <div ref={mountRef} className="flipbook-mount" />
        )}
      </div>

      {pages.length > 0 && (
        <>
          {/* Floating Luxury Controls Bar */}
          <div className="viewer-controls">
            <button className="v-btn" onClick={handlePrev} title="Pagina Precedente (Freccia Sinistra)">
              <ChevronLeft size={20} />
            </button>

            <div className="v-indicator">
              <span>{currentSpread}</span> / <span>{totalSpreads}</span>
            </div>

            <button className="v-btn" onClick={handleNext} title="Pagina Successiva (Freccia Destra / Clic)">
              <ChevronRight size={20} />
            </button>

            <div className="v-divider" />

            <button className="v-btn" onClick={toggleSound} title="Suono Carta Realistico">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              className="v-btn"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              title="Miniature Pagine"
            >
              <Grid size={18} />
            </button>

            <button className="v-btn" onClick={handleZoomIn} title="Ingrandisci">
              <ZoomIn size={18} />
            </button>

            <button
              className="v-btn btn-zoom-label"
              onClick={handleZoomReset}
              title="Ripristina Zoom al 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            <button
              className={`v-btn ${isPlaying ? 'active' : ''}`}
              onClick={toggleAutoplay}
              title="Presentazione Automatica"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button className="v-btn" onClick={toggleFullscreen} title="Schermo Intero">
              <Maximize2 size={18} />
            </button>
          </div>

          {/* Thumbnails Drawer */}
          <div className={`thumbnails-drawer ${isDrawerOpen ? 'open' : ''}`}>
            <div className="thumbnails-header">
              <span>Indice Pagine Catalogo</span>
              <button className="t-close" onClick={() => setIsDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="thumbnails-scroll">
              {pages.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="thumb-item"
                  onClick={() => goToPage(idx)}
                >
                  <img src={p.src} alt={p.title || `Pagina ${idx + 1}`} />
                  <div className="thumb-label">
                    {idx === 0 ? 'Copertina' : (idx === pages.length - 1 ? 'Retro' : `Pag. ${idx}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
