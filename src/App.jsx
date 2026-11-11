import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { EditorTab } from './components/EditorTab.jsx';
import { FlipbookViewer } from './components/FlipbookViewer.jsx';
import { ExportTab } from './components/ExportTab.jsx';
import { Toast } from './components/Toast.jsx';
import { DemoCatalogGenerator } from './utils/demoData.js';

export function App() {
  const [activeTab, setActiveTab] = useState('viewer');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [state, setState] = useState({
    title: 'Raia Prestige Lookbook',
    subtitle: 'Design, Stampa e Comunicazione',
    theme: 'raia-dark',
    appearance: { background: '#c8c9cc', accent: '#852233', toolbar: '#292a2d', logo: '/raia-logo.png', duration: 420, volume: .65, showArrows: true, showThumbnails: true, showDownload: true },
    soundProfile: 'luxury',
    soundEnabled: true,
    pages: []
  });

  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, duration);
  };

  // Load demo pages on mount so the user immediately sees a live working catalog
  useEffect(() => {
    const demo = DemoCatalogGenerator.generate();
    setState((prev) => ({
      ...prev,
      pages: demo
    }));
  }, []);

  // Update theme class on body
  useEffect(() => {
    document.body.className = `theme-${state.theme}`;
  }, [state.theme]);

  // Handle uploaded images from dropzone or file input
  const handleUploadImages = async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      showToast('Nessun file immagine valido selezionato.');
      return;
    }

    // Natural sort: page1, page2, page10
    files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    showToast(`Caricamento di ${files.length} immagini in corso...`);

    const newPages = [...state.pages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await readFileAsDataURL(file);
      const isFirst = newPages.length === 0;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');

      newPages.push({
        id: `page-${Date.now()}-${i}`,
        src: dataUrl,
        title: isFirst ? state.title : cleanName,
        subtitle: isFirst ? state.subtitle : '',
        type: isFirst ? 'cover' : 'page',
        isCover: isFirst,
        pageNumber: newPages.length + 1
      });
    }

    setState((prev) => ({ ...prev, pages: newPages }));
    showToast(`${files.length} pagine aggiunte con successo!`);
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  // Load Raia Demo Lookbook
  const handleLoadDemo = () => {
    showToast('Generazione catalogo di design Raia...');
    setTimeout(() => {
      const demo = DemoCatalogGenerator.generate();
      setState((prev) => ({
        ...prev,
        title: 'Raia Prestige Lookbook',
        subtitle: 'Design, Stampa e Comunicazione',
        pages: demo
      }));
      showToast('Catalogo Demo Raia caricato con successo!');
    }, 150);
  };

  // Save project JSON
  const handleSaveProject = () => {
    if (state.pages.length === 0) {
      showToast('Nessuna pagina da salvare nel progetto.');
      return;
    }
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const filename = (state.title || 'progetto-raia')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') + '.sfogliabile.json';

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast('Progetto salvato con successo!');
  };

  // Load project JSON
  const handleLoadProject = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loaded = JSON.parse(evt.target.result);
        setState((prev) => ({
          ...prev,
          title: loaded.title || 'Catalogo Raia',
          subtitle: loaded.subtitle || '',
          theme: loaded.theme || 'raia-dark',
          soundProfile: loaded.soundProfile || 'luxury',
          appearance: loaded.appearance || prev.appearance,
          pages: loaded.pages || []
        }));
        showToast('Progetto caricato con successo!');
      } catch (err) {
        showToast('File di progetto non valido.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Vuoi rimuovere tutte le pagine dal catalogo?')) {
      setState((prev) => ({ ...prev, pages: [] }));
      showToast('Catalogo svuotato');
    }
  };

  return (
    <div className={`app-container mode-${activeTab}`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadDemo={handleLoadDemo}
        onPreview={() => setActiveTab('viewer')}
      />

      <main className="app-main">
        {activeTab === 'studio' && (
          <EditorTab
            state={state}
            setState={setState}
            onUploadImages={handleUploadImages}
            onSaveProject={handleSaveProject}
            onLoadProject={handleLoadProject}
            onClearAll={handleClearAll}
            showToast={showToast}
          />
        )}

        {activeTab === 'viewer' && (
          <FlipbookViewer
            appearance={state.appearance}
            pages={state.pages}
            soundProfile={state.soundProfile}
            theme={state.theme}
            catalogTitle={state.title}
            showToast={showToast}
          />
        )}

        {activeTab === 'export' && (
          <ExportTab
            state={state}
            showToast={showToast}
          />
        )}
      </main>

      <Toast message={toastMessage} isVisible={toastVisible} />
    </div>
  );
}

export default App;
