import React, { useEffect, useRef, useState } from 'react';
import { FlipBookEngine } from '../engine/FlipBookEngine.js';
import { ShareModal } from './ShareModal.jsx';
import { StandaloneExporter } from '../engine/StandaloneExporter.js';
import { PDFBuilder } from '../engine/PDFBuilder.js';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Volume2,
  VolumeX,
  Grid,
  List,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Download,
  Share2,
  Printer,
  RotateCcw,
  X,
  BookOpen
} from 'lucide-react';

export function FlipbookViewer({ pages, soundProfile, theme, catalogTitle, showToast, appearance = {}, initialPage = 0 }) {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const [pdfResult, setPdfResult] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [actualPage, setActualPage] = useState(0);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [totalSpreads, setTotalSpreads] = useState(1);
  const [pageInputVal, setPageInputVal] = useState('1');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoplayTimerRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || pages.length === 0) return;

    if (!engineRef.current) {
      engineRef.current = new FlipBookEngine(mountRef.current, {
        appearance,
        initialPage,
        soundEnabled: soundEnabled,
        soundProfile: soundProfile,
        onPageChange: (info) => {
          setActualPage(info.pageIndex);
          setAtEnd(info.atEnd);
          setCurrentSpread(info.currentSpread);
          setTotalSpreads(info.totalSpreads);
          // Calculate human page label (e.g. "1" or "2-3")
          if (info.portrait) {
            setPageInputVal(String(info.pageIndex + 1));
          } else if (info.currentSpread === 0) {
            setPageInputVal('1');
          } else {
            const leftP = info.currentSpread * 2;
            const rightP = Math.min(pages.length, leftP + 1);
            setPageInputVal(leftP === rightP ? `${leftP}` : `${leftP}-${rightP}`);
          }
        }
      });
    }

    engineRef.current.setSoundProfile(soundProfile);
    engineRef.current.setSoundEnabled(soundEnabled);
    engineRef.current.loadPages(pages);


  }, [pages, soundProfile]);

  useEffect(() => { engineRef.current?.configure(appearance); }, [appearance]);

  useEffect(() => () => {
    clearInterval(autoplayTimerRef.current);
    engineRef.current?.destroy();
    engineRef.current = null;
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleNext = () => engineRef.current?.next();
  const handlePrev = () => engineRef.current?.prev();
  const handleFirst = () => engineRef.current?.first();
  const handleLast = () => engineRef.current?.last();

  const handlePageJump = (e) => {
    e.preventDefault();
    const val = parseInt(pageInputVal.split('-')[0], 10);
    if (!isNaN(val)) {
      engineRef.current?.goToPage(val);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    engineRef.current?.setSoundEnabled(next);
    showToast(next ? 'Suono carta attivato' : 'Suono disattivato');
  };

  const handleZoomIn = () => {
    const nextZoom = Math.min(2.5, zoomLevel + 0.25);
    setZoomLevel(nextZoom);
    engineRef.current?.setZoom(nextZoom);
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(0.8, zoomLevel - 0.25);
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportHtml = async () => {
    if (exportBusy || !pages.length) return;
    setExportBusy(true);
    try {
      const css = [...document.styleSheets].flatMap(sheet => { try { return [...sheet.cssRules].map(rule => rule.cssText); } catch { return []; } }).join('\n');
      const blob = await StandaloneExporter.export({ title: catalogTitle, pages, soundProfile, soundEnabled, appearance }, css);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'catalogo-raia.html'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Sfogliabile HTML scaricato: aprilo anche senza connessione.');
    } catch { showToast('Esportazione HTML non riuscita. Riprova.'); }
    finally { setExportBusy(false); }
  };

  const handleQuickDownloadPdf = async () => {
    if (pages.length === 0 || pdfBusy) return;
    setPdfBusy(true);
    setPdfResult(null);
    showToast('Generazione PDF in corso...');
    try {
      const blob = await PDFBuilder.generate(pages, { title: catalogTitle });
      const filename = (catalogTitle || 'catalogo-raia')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') + '.pdf';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      setPdfResult({ url, filename, size: blob.size });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 300000);
      showToast('PDF scaricato con successo!');
    } catch (e) {
      setPdfResult({ error: e.message });
      showToast('Errore durante la creazione del PDF.');
    } finally { setPdfBusy(false); }
  };

  const goToPage = (index) => {
    engineRef.current?.goToPage(index + 1);
  };

  return (
    <div className={`fliphtml5-wrapper theme-${theme} ${appearance.showArrows === false ? "hide-reader-arrows" : ""} ${appearance.showThumbnails === false ? "hide-reader-thumbs" : ""} ${appearance.showDownload === false ? "hide-reader-downloads" : ""}`} style={{ background: appearance.backgroundImage ? `url("${appearance.backgroundImage}") center / cover` : appearance.background, "--raia-red": appearance.accent, "--reader-toolbar": appearance.toolbar }}>
      {/* FlipHTML5 Top Branding Bar */}
      <div className="fliphtml5-topbar">
        <div className="fliphtml5-top-brand">
          <img className="reader-logo" src={appearance.logo || "/raia-logo.png"} alt="Logo del catalogo" />
          <span className="fliphtml5-top-title">{catalogTitle || 'Raia Prestige Lookbook'}</span>
        </div>

        <div className="fliphtml5-top-actions">
          <button className="fliphtml5-top-btn reader-export-html reader-download" onClick={handleExportHtml} disabled={exportBusy || !pages.length}><Download size={15} /><span>{exportBusy ? "Preparazione…" : "Scarica HTML"}</span></button>
          <button
            className="fliphtml5-top-btn"
            onClick={() => setIsShareModalOpen(true)}
            title="Condividi o incorpora flipbook"
          >
            <Share2 size={15} />
            <span>Link / Incorpora</span>
          </button>

          <button
            className="fliphtml5-top-btn"
            onClick={handleQuickDownloadPdf}
            title="Scarica PDF" data-download="true"
          >
            <Download size={15} />
            <span>{pdfBusy ? "Preparazione PDF…" : "Scarica PDF"}</span>
          </button>
        </div>
      </div>

      {pdfResult && <div className="pdf-result">{pdfResult.error ? `Errore PDF: ${pdfResult.error}` : <a href={pdfResult.url} download={pdfResult.filename}>PDF pronto ({Math.round(pdfResult.size / 1024)} KB) · Clicca qui se il download non parte</a>}</div>}
      {/* FlipHTML5 Central Stage Area */}
      <div className="fliphtml5-stage-area">
        {pages.length === 0 ? (
          <div className="viewer-empty-state">
            <h3>Nessuna pagina nel catalogo</h3>
            <p>Carica le tue immagini nello Studio o clicca "Carica Demo Raia" in alto.</p>
          </div>
        ) : (
          <>
            {/* Side Navigation Arrow Left */}
            <button
              className="fliphtml5-side-nav fliphtml5-side-prev"
              onClick={handlePrev}
              disabled={actualPage <= 0}
              title="Pagina precedente"
            >
              <ChevronLeft size={36} />
            </button>

            {/* Mount for 3D Book */}
            <div id="viewer-container">
              <div ref={mountRef} className="flipbook-mount" />
            </div>

            {/* Side Navigation Arrow Right */}
            <button
              className="fliphtml5-side-nav fliphtml5-side-next"
              onClick={handleNext}
              disabled={atEnd}
              title="Pagina successiva"
            >
              <ChevronRight size={36} />
            </button>
          </>
        )}
      </div>

      <div className="reader-hint">Scorri o tocca le pagine per sfogliare · Usa le frecce della tastiera</div>
      <div className="reader-progress" aria-hidden="true"><span style={{ width: `${totalSpreads > 1 ? currentSpread / (totalSpreads - 1) * 100 : 100}%` }} /></div>
      {/* FlipHTML5 Classic Bottom Navigation Bar */}
      {pages.length > 0 && (
        <div className="fliphtml5-bottom-bar">
          <div className="fh5-bar-container">
            {/* Left Tools Group: Table of Contents & Thumbnails */}
            <div className="fh5-group">
              <button
                className={`fh5-btn ${isTocOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsTocOpen(!isTocOpen);
                  setIsThumbnailsOpen(false);
                }}
                title="Sommario & Indice Capitoli"
              >
                <List size={18} />
              </button>

              <button
                data-thumbnails="true" className={`fh5-btn ${isThumbnailsOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsThumbnailsOpen(!isThumbnailsOpen);
                  setIsTocOpen(false);
                }}
                title="Miniature Pagine"
              >
                <Grid size={18} />
              </button>
            </div>

            <div className="fh5-separator" />

            {/* Center Navigation Group: First, Prev, Page Input, Next, Last */}
            <div className="fh5-group fh5-nav-group">
              <button
                className="fh5-btn"
                onClick={handleFirst}
                disabled={currentSpread <= 0}
                title="Prima Pagina"
              >
                <ChevronsLeft size={18} />
              </button>

              <button
                className="fh5-btn"
                onClick={handlePrev}
                disabled={currentSpread <= 0}
                title="Pagina Precedente"
              >
                <ChevronLeft size={18} />
              </button>

              <form onSubmit={handlePageJump} className="fh5-page-jump-box">
                <input
                  type="text"
                  className="fh5-page-input"
                  value={pageInputVal}
                  onChange={(e) => setPageInputVal(e.target.value)}
                  title="Digita il numero di pagina e premi Invio"
                />
                <span className="fh5-page-total">/ {pages.length}</span>
              </form>

              <button
                className="fh5-btn"
                onClick={handleNext}
                disabled={currentSpread >= totalSpreads - 1}
                title="Pagina Successiva"
              >
                <ChevronRight size={18} />
              </button>

              <button
                className="fh5-btn"
                onClick={handleLast}
                disabled={currentSpread >= totalSpreads - 1}
                title="Ultima Pagina"
              >
                <ChevronsRight size={18} />
              </button>
            </div>

            <div className="fh5-separator" />

            {/* Right Group: Zoom, Autoplay, Sound, Print, Share, Fullscreen */}
            <div className="fh5-group">
              <button
                className={`fh5-btn ${isPlaying ? 'active' : ''}`}
                onClick={toggleAutoplay}
                title={isPlaying ? 'Pausa Presentazione' : 'Riproduci Presentazione Automatica'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                className="fh5-btn"
                onClick={toggleSound}
                title={soundEnabled ? 'Disattiva Suono Carta' : 'Attiva Suono Carta'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <button className="fh5-btn" onClick={handleZoomIn} title="Ingrandisci (Zoom In)">
                <ZoomIn size={18} />
              </button>

              <button className="fh5-btn" onClick={handleZoomOut} title="Riduci (Zoom Out)">
                <ZoomOut size={18} />
              </button>

              <button className="fh5-btn" onClick={handleZoomReset} title="Ripristina 100%">
                <RotateCcw size={16} />
              </button>

              <button className="fh5-btn" onClick={handlePrint} title="Stampa Catalogo">
                <Printer size={18} />
              </button>

              <button
                className="fh5-btn"
                onClick={() => setIsShareModalOpen(true)}
                title="Link e codice HTML"
              >
                <Share2 size={18} />
              </button>

              <button className="fh5-btn" onClick={toggleFullscreen} title="Schermo Intero">
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FlipHTML5 Left Side Drawer: Table of Contents (Sommario) */}
      <div className={`fliphtml5-side-drawer ${isTocOpen ? 'open' : ''}`}>
        <div className="fh5-drawer-header">
          <div className="fh5-drawer-title">
            <BookOpen size={16} color="#852233" />
            <span>Sommario del Catalogo</span>
          </div>
          <button className="fh5-drawer-close" onClick={() => setIsTocOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="fh5-toc-list">
          {pages.map((p, idx) => (
            <div
              key={p.id || idx}
              className={`fh5-toc-item ${
                (currentSpread === 0 && idx === 0) ||
                (currentSpread > 0 && (idx === currentSpread * 2 - 1 || idx === currentSpread * 2))
                  ? 'active'
                  : ''
              }`}
              onClick={() => {
                goToPage(idx);
                setIsTocOpen(false);
              }}
            >
              <span className="fh5-toc-num">{idx === 0 ? 'Copertina' : `Pag. ${idx + 1}`}</span>
              <span className="fh5-toc-text">{p.title || `Pagina ${idx + 1}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FlipHTML5 Bottom Thumbnails Ribbon Drawer */}
      <div className={`fliphtml5-thumbnails-bar ${isThumbnailsOpen ? 'open' : ''}`}>
        <div className="fh5-thumb-bar-header">
          <span>Panoramica Miniature ({pages.length} pagine)</span>
          <button className="fh5-drawer-close" onClick={() => setIsThumbnailsOpen(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="fh5-thumb-ribbon">
          {pages.map((p, idx) => {
            const isActive =
              (currentSpread === 0 && idx === 0) ||
              (currentSpread > 0 && (idx === currentSpread * 2 - 1 || idx === currentSpread * 2));

            return (
              <div
                key={p.id || idx}
                className={`fh5-ribbon-item ${isActive ? 'active' : ''}`}
                onClick={() => goToPage(idx)}
              >
                <div className="fh5-thumb-img-wrap">
                  <img src={p.src} alt={p.title || `Pagina ${idx + 1}`} />
                </div>
                <span className="fh5-ribbon-label">
                  {idx === 0 ? 'Copertina' : (idx === pages.length - 1 ? 'Retro' : `Pag. ${idx + 1}`)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share & Embed Modal (FlipHTML5 Style) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        catalogTitle={catalogTitle}
        showToast={showToast}
      />
    </div>
  );
}
