import React, { useRef } from 'react';
import { UploadCloud, ChevronUp, ChevronDown, Bookmark, Trash2, Save, FolderOpen, Image as ImageIcon } from 'lucide-react';

export function EditorTab({
  state,
  setState,
  onUploadImages,
  onSaveProject,
  onLoadProject,
  onClearAll,
  showToast
}) {
  const fileInputRef = useRef(null);
  const projectInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadImages(e.dataTransfer.files);
    }
  };

  const movePage = (index, direction) => {
    const newPages = [...state.pages];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newPages.length) return;

    const temp = newPages[index];
    newPages[index] = newPages[targetIdx];
    newPages[targetIdx] = temp;

    // Recalculate covers and numbers
    newPages.forEach((p, i) => {
      p.pageNumber = i + 1;
      p.isCover = i === 0;
      p.type = i === 0 ? 'cover' : (i === newPages.length - 1 ? 'back' : 'page');
    });

    setState((prev) => ({ ...prev, pages: newPages }));
  };

  const setAsCover = (index) => {
    const newPages = [...state.pages];
    const [moved] = newPages.splice(index, 1);
    newPages.unshift(moved);

    newPages.forEach((p, i) => {
      p.pageNumber = i + 1;
      p.isCover = i === 0;
      p.type = i === 0 ? 'cover' : (i === newPages.length - 1 ? 'back' : 'page');
    });

    setState((prev) => ({ ...prev, pages: newPages }));
    showToast('Impostata come Copertina Principale');
  };

  const deletePage = (index) => {
    const newPages = state.pages.filter((_, i) => i !== index);
    newPages.forEach((p, i) => {
      p.pageNumber = i + 1;
      p.isCover = i === 0;
      p.type = i === 0 ? 'cover' : (i === newPages.length - 1 ? 'back' : 'page');
    });

    setState((prev) => ({ ...prev, pages: newPages }));
    showToast('Pagina rimossa');
  };

  return (
    <div className="studio-layout">
      {/* Sidebar Settings */}
      <aside className="sidebar-settings">
        <div className="sidebar-header">
          <h3>Impostazioni Catalogo</h3>
          <span className="sidebar-sub">Personalizza il tuo lookbook</span>
        </div>

        <div className="form-group">
          <label htmlFor="catalog-title">Titolo Catalogo / Brand</label>
          <input
            type="text"
            id="catalog-title"
            className="form-input"
            value={state.title}
            onChange={(e) => setState({ ...state, title: e.target.value })}
            placeholder="Es. Collezione Primavera 2026"
          />
        </div>

        <div className="form-group">
          <label htmlFor="catalog-subtitle">Sottotitolo / Campagna</label>
          <input
            type="text"
            id="catalog-subtitle"
            className="form-input"
            value={state.subtitle}
            onChange={(e) => setState({ ...state, subtitle: e.target.value })}
            placeholder="Es. Design, Stampa e Comunicazione"
          />
        </div>

        <div className="form-group">
          <label htmlFor="catalog-theme">Ambiente & Sfondo 3D</label>
          <select
            id="catalog-theme"
            className="form-select"
            value={state.theme}
            onChange={(e) => setState({ ...state, theme: e.target.value })}
          >
            <option value="raia-dark">Studio Raia Prestige (Bordeaux & Carbone)</option>
            <option value="walnut">Tavolo in Noce Pregiato</option>
            <option value="carrara">Marmo Bianco di Carrara</option>
            <option value="charcoal">Cemento Architettonico</option>
            <option value="minimal-light">Galleria d'Arte (Luminoso)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="sound-profile">Acustica Sfoglio (Suono Carta)</label>
          <select
            id="sound-profile"
            className="form-select"
            value={state.soundProfile}
            onChange={(e) => setState({ ...state, soundProfile: e.target.value })}
          >
            <option value="luxury">Carta Patinata Lucida (Rivista Luxury)</option>
            <option value="heavy">Cartoncino Pregiato Spesso (Libro d'Arte)</option>
            <option value="soft">Carta Seta Leggera (Catalogo Moda)</option>
          </select>
        </div>

        <div className="project-management-box">
          <label className="box-label">Salvataggio Progetto</label>
          <div className="btn-group-vertical">
            <button className="btn-secondary full-width" onClick={onSaveProject}>
              <Save size={15} />
              <span>Salva Progetto (.json)</span>
            </button>
            <button
              className="btn-secondary full-width"
              onClick={() => projectInputRef.current?.click()}
            >
              <FolderOpen size={15} />
              <span>Riapri Progetto Esistente</span>
            </button>
            <input
              type="file"
              ref={projectInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={onLoadProject}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="main-editor-area">
        {/* Dropzone */}
        <div
          className="dropzone-card"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">
            <UploadCloud size={32} />
          </div>
          <div className="dropzone-text">
            <h4>Trascina qui le foto del catalogo</h4>
            <p>oppure clicca per selezionare dal tuo computer (JPG, PNG, WebP, AVIF)</p>
          </div>
          <span className="dropzone-badge">
            Supporta immagini ad altissima definizione e ordinamento naturale
          </span>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) onUploadImages(e.target.files);
            }}
          />
        </div>

        {/* Pages Grid */}
        <div className="pages-manager-card">
          <div className="manager-header">
            <div className="manager-title">
              <h3>Pagine del Catalogo</h3>
              <span>Trascina o riordina le pagine per comporre la sequenza del libro</span>
            </div>
            <div className="manager-actions">
              <span className="badge-count">{state.pages.length} Pagine</span>
              {state.pages.length > 0 && (
                <button className="btn-icon-danger" onClick={onClearAll} title="Svuota catalogo">
                  <Trash2 size={15} />
                  <span>Svuota tutto</span>
                </button>
              )}
            </div>
          </div>

          <div className="pages-grid">
            {state.pages.length === 0 ? (
              <div className="empty-grid-msg">
                <ImageIcon size={40} />
                <p>Nessuna pagina ancora caricata.</p>
                <span>Trascina le foto qui sopra o clicca "Carica Demo Raia" in alto per iniziare.</span>
              </div>
            ) : (
              state.pages.map((page, index) => {
                const isCover = index === 0;
                const isBack = index === state.pages.length - 1 && state.pages.length > 2;

                return (
                  <div key={page.id || index} className="page-card">
                    <div className="page-card-preview">
                      <img src={page.src} alt={page.title} />
                      <div className={`page-card-badge ${isCover ? 'badge-cover' : ''}`}>
                        {isCover ? 'Copertina' : (isBack ? 'Retro Copertina' : `Pag. ${index + 1}`)}
                      </div>
                    </div>
                    <div className="page-card-info">
                      <div className="page-card-title" title={page.title}>
                        {page.title || `Pagina ${index + 1}`}
                      </div>
                      <div className="page-card-actions">
                        <button
                          className="action-icon-btn"
                          title="Sposta Su"
                          disabled={index === 0}
                          onClick={() => movePage(index, -1)}
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          className="action-icon-btn"
                          title="Sposta Giù"
                          disabled={index === state.pages.length - 1}
                          onClick={() => movePage(index, 1)}
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          className="action-icon-btn"
                          title="Imposta come Copertina"
                          onClick={() => setAsCover(index)}
                        >
                          <Bookmark size={15} />
                        </button>
                        <button
                          className="action-icon-btn btn-delete"
                          title="Elimina Pagina"
                          onClick={() => deletePage(index)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
