import React, { useRef, useState } from 'react';
import { FlipbookViewer } from './FlipbookViewer.jsx';

const presets = [{ name: 'Classico', background: '#c8c9cc', toolbar: '#292a2d' }, { name: 'Bianco', background: '#f3f1ed', toolbar: '#852233' }, { name: 'Notte', background: '#202124', toolbar: '#111111' }, { name: 'Raia', background: '#471521', toolbar: '#240b11' }];
const readImage = file => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
export function EditorTab({ state, setState, onUploadImages, onSaveProject, onLoadProject, showToast }) {
  const undoStack = useRef([]), redoStack = useRef([]);
  const commit = action => { undoStack.current.push(state); if (undoStack.current.length > 40) undoStack.current.shift(); redoStack.current = []; setState(action); };
  const undo = () => { const previous = undoStack.current.pop(); if (previous) { redoStack.current.push(state); setState(previous); } };
  const redo = () => { const next = redoStack.current.pop(); if (next) { undoStack.current.push(state); setState(next); } };
  const [section, setSection] = useState('design');
  const [selectedPage, selectPage] = useState(0);
  const [selectedElement, selectElement] = useState(null);
  const [preview, setPreview] = useState(false);
  const upload = useRef(null), project = useRef(null), canvas = useRef(null), drag = useRef(null);
  const page = state.pages[selectedPage];
  const appearance = state.appearance || {};
  const element = page?.elements?.find(el => el.id === selectedElement);
  const patch = changes => commit(prev => ({ ...prev, ...changes }));
  const style = changes => commit(prev => ({ ...prev, appearance: { ...prev.appearance, ...changes } }));
  const updatePage = changes => commit(prev => ({ ...prev, pages: prev.pages.map((p, i) => i === selectedPage ? { ...p, ...changes } : p) }));
  const updateElement = changes => commit(prev => ({ ...prev, pages: prev.pages.map((p, i) => i === selectedPage ? { ...p, elements: (p.elements || []).map(el => el.id === selectedElement ? { ...el, ...changes } : el) } : p) }));
  const addElement = async (type, file) => {
    if (!page) return;
    const item = { id: crypto.randomUUID(), type, x: 12, y: 15, width: 65, fontSize: 26, color: '#852233', text: type === 'link' ? 'Visita il nostro sito' : 'Scrivi il tuo testo', url: 'https://', ...(file ? { src: await readImage(file) } : {}) };
    updatePage({ elements: [...(page.elements || []), item] }); selectElement(item.id);
  };
  const blankPage = () => {
    patch({ pages: [...state.pages, { id: crypto.randomUUID(), title: 'Nuova pagina', blank: true, background: '#ffffff', elements: [] }] });
    selectPage(state.pages.length); selectElement(null); setSection('pages'); setPreview(false);
  };
  const movePage = direction => {
    const target = selectedPage + direction;
    if (target < 0 || target >= state.pages.length) return;
    const pages = [...state.pages]; [pages[selectedPage], pages[target]] = [pages[target], pages[selectedPage]];
    patch({ pages }); selectPage(target);
  };
  const imageInput = (label, action) => <label className="custom-file">{label}<input type="file" accept="image/*" onChange={async e => { if (e.target.files[0]) { try { await action(e.target.files[0]); } catch { showToast('Immagine non caricata.'); } } e.target.value = ''; }} /></label>;
  return <div className="customizer">
    <div className="customizer-rail">{[['design','Temi'],['settings','Impostazioni'],['pages','Pagine'],['brand','Brand']].map(([id, label]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>{label}</button>)}<button onClick={onSaveProject}>Salva</button><button onClick={() => project.current.click()}>Apri</button><input hidden ref={project} type="file" accept=".json" onChange={onLoadProject} /></div>
    <aside className="customizer-panel">
      <div className="customizer-panel-heading"><h2>{ { design: 'Design e temi', settings: 'Impostazioni lettore', pages: 'Editor delle pagine', brand: 'La tua identità' }[section] }</h2><p>Le modifiche sono subito visibili nell’anteprima.</p></div>
      {section === 'design' && <>
        <h3>Temi</h3><div className="theme-presets">{presets.map(p => <button key={p.name} onClick={() => style({ ...p, backgroundImage: '' })}><span style={{ background: p.background, borderBottom: `9px solid ${p.toolbar}` }}>▱</span>{p.name}</button>)}</div>
        <label>Colore dello sfondo<input type="color" value={appearance.background || '#c8c9cc'} onChange={e => style({ background: e.target.value, backgroundImage: '' })} /></label>
        {imageInput('Carica immagine di sfondo', async f => style({ backgroundImage: await readImage(f) }))}
        {appearance.backgroundImage && <button onClick={() => style({ backgroundImage: '' })}>Rimuovi immagine di sfondo</button>}
        <label>Colore dei pulsanti<input type="color" value={appearance.accent || '#852233'} onChange={e => style({ accent: e.target.value })} /></label>
        <label>Barra degli strumenti<input type="color" value={appearance.toolbar || '#292a2d'} onChange={e => style({ toolbar: e.target.value })} /></label>
      </>}
      {section === 'settings' && <>
        <label>Velocità di sfogliamento<select value={appearance.duration || 420} onChange={e => style({ duration: Number(e.target.value) })}><option value={280}>Rapida · 0,28 s</option><option value={420}>Naturale · 0,42 s</option><option value={650}>Rilassata · 0,65 s</option><option value={900}>Lenta · 0,90 s</option></select></label>
        <label>Suono della carta<select value={state.soundProfile} onChange={e => patch({ soundProfile: e.target.value })}><option value="luxury">Carta patinata</option><option value="soft">Carta leggera</option><option value="heavy">Carta spessa</option></select></label>
        <label>Volume<input type="range" min="0" max="1" step=".05" value={appearance.volume ?? .65} onChange={e => style({ volume: Number(e.target.value) })} /></label>
        {[['showArrows','Frecce laterali'],['showThumbnails','Pulsante miniature'],['showDownload','Download HTML e PDF']].map(([key,label]) => <label className="switch-field" key={key}>{label}<input type="checkbox" checked={appearance[key] !== false} onChange={e => style({ [key]: e.target.checked })} /></label>)}
        <p className="editor-note">Sfoglia dall’anteprima per provare velocità e suono. L’audio parte dopo il primo clic.</p>
      </>}
      {section === 'brand' && <>
        <label>Titolo del catalogo<input value={state.title} onChange={e => patch({ title: e.target.value })} /></label>
        <label>Sottotitolo<input value={state.subtitle} onChange={e => patch({ subtitle: e.target.value })} /></label>
        <img className="brand-preview" src={appearance.logo || '/raia-logo.png'} alt="Logo del catalogo" />
        {imageInput('Sostituisci logo', async f => style({ logo: await readImage(f) }))}
        <button onClick={() => style({ logo: '/raia-logo.png', accent: '#852233' })}>Ripristina marchio Raia</button>
      </>}
      {section === 'pages' && <>
        <div className="editor-button-row"><button onClick={() => upload.current.click()}>Importa immagini</button><button onClick={blankPage}>+ Pagina vuota</button></div>
        <input hidden ref={upload} type="file" accept="image/*" multiple onChange={e => { onUploadImages(e.target.files); e.target.value = ''; }} />
        {page && <>
          <label>Nome pagina<input value={page.title || ''} onChange={e => updatePage({ title: e.target.value })} /></label>
          <div className="editor-button-row"><button onClick={() => movePage(-1)} disabled={!selectedPage}>← Sposta</button><button onClick={() => movePage(1)} disabled={selectedPage === state.pages.length - 1}>Sposta →</button></div>
          {imageInput('Sostituisci immagine di pagina', async f => updatePage({ src: await readImage(f), blank: false }))}
          {page.blank && <label>Colore della pagina<input type="color" value={page.background || '#ffffff'} onChange={e => updatePage({ background: e.target.value })} /></label>}
          <h3>Aggiungi contenuti</h3><div className="editor-button-row"><button onClick={() => addElement('text')}>+ Testo</button><button onClick={() => addElement('link')}>+ Link</button></div>
          {imageInput('+ Immagine sulla pagina', f => addElement('image', f))}
          <div className="editor-layers">{(page.elements || []).map(el => <button key={el.id} className={el.id === selectedElement ? 'active' : ''} onClick={() => selectElement(el.id)}>{el.type === 'image' ? 'Immagine' : el.text || 'Testo'}</button>)}</div>
          {element && <>
            <h3>Proprietà dell’elemento</h3>
            {element.type !== 'image' && <label>Testo<textarea value={element.text} onChange={e => updateElement({ text: e.target.value })} /></label>}
            {element.type === 'link' && <label>Indirizzo del link<input type="url" value={element.url} onChange={e => updateElement({ url: e.target.value })} /></label>}
            {element.type !== 'image' && <><label>Dimensione testo<input type="number" min="8" max="120" value={element.fontSize} onChange={e => updateElement({ fontSize: Number(e.target.value) })} /></label><label>Colore<input type="color" value={element.color} onChange={e => updateElement({ color: e.target.value })} /></label><label className="switch-field">Grassetto<input type="checkbox" checked={!!element.bold} onChange={e => updateElement({ bold: e.target.checked })} /></label><label>Allineamento<select value={element.align || 'left'} onChange={e => updateElement({ align: e.target.value })}><option value="left">Sinistra</option><option value="center">Centro</option><option value="right">Destra</option></select></label></>}
            {[['x','Posizione orizzontale',0,95],['y','Posizione verticale',0,95],['width','Larghezza',5,100]].map(([key,label,min,max]) => <label key={key}>{label} · {Math.round(element[key])}%<input type="range" min={min} max={max} value={element[key]} onChange={e => updateElement({ [key]: Number(e.target.value) })} /></label>)}
            <div className="editor-button-row"><button onClick={() => { updatePage({ elements: [...page.elements, { ...element, id: crypto.randomUUID(), y: Math.min(90, element.y + 5) }] }); }}>Duplica</button><button onClick={() => { updatePage({ elements: page.elements.filter(el => el.id !== selectedElement) }); selectElement(null); }}>Elimina elemento</button></div>
          </>}
          <button className="editor-danger" onClick={() => { patch({ pages: state.pages.filter((_,i) => i !== selectedPage) }); selectPage(Math.max(0, selectedPage - 1)); selectElement(null); }}>Elimina pagina</button>
          <p className="editor-note">Le immagini importate restano immagini: puoi sostituirle e aggiungere elementi. Testi, immagini e link aggiunti qui restano modificabili.</p>
        </>}
      </>}
    </aside>
    <section className="customizer-workspace">
      <div className="customizer-toolbar"><span>{section === 'pages' && !preview ? `Modifica pagina ${selectedPage + 1}` : 'Anteprima interattiva'}</span><div><button onClick={undo} disabled={!undoStack.current.length}>Annulla</button><button onClick={redo} disabled={!redoStack.current.length}>Ripeti</button><button className={!preview && section === 'pages' ? 'active' : ''} onClick={() => { setSection('pages'); setPreview(false); }}>Modifica pagina</button><button className={preview || section !== 'pages' ? 'active' : ''} onClick={() => setPreview(true)}>Sfoglia e prova</button><button onClick={onSaveProject}>Salva progetto</button></div></div>
      {section !== 'pages' || preview ? <div className="customizer-reader"><FlipbookViewer initialPage={section === "pages" ? selectedPage : 0} pages={state.pages} appearance={appearance} soundProfile={state.soundProfile} theme={state.theme} catalogTitle={state.title} showToast={showToast} /></div> : <div className="page-editor-stage" style={{ background: appearance.background }}>
        {page ? <div ref={canvas} className="page-edit-canvas" style={{ background: page.background || '#fff' }} onPointerDown={() => selectElement(null)}>
          {!page.blank && <img className="page-base-image" src={page.src} alt={page.title} draggable="false" />}
          {(page.elements || []).map(el => <div key={el.id} className={`editable-element ${el.id === selectedElement ? 'selected' : ''}`} style={{ left: el.x + '%', top: el.y + '%', width: el.width + '%', fontSize: el.fontSize / 480 * 100 + 'cqw', color: el.color, fontWeight: el.bold ? 700 : 400, textAlign: el.align }} onPointerDown={e => { e.stopPropagation(); selectElement(el.id); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, left: el.x, top: el.y }; }} onPointerMove={e => { if (!drag.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return; const rect = canvas.current.getBoundingClientRect(); const x = Math.max(0, Math.min(95, drag.current.left + (e.clientX - drag.current.x) / rect.width * 100)); const y = Math.max(0, Math.min(95, drag.current.top + (e.clientY - drag.current.y) / rect.height * 100)); updateElement({ x, y }); }} onPointerUp={() => { drag.current = null; }}>{el.type === 'image' ? <img src={el.src} draggable="false" alt="Elemento immagine" /> : el.text}</div>)}
        </div> : <button onClick={blankPage}>Crea la prima pagina</button>}
      </div>}
      <div className="editor-page-strip">{state.pages.map((p,i) => <button key={p.id || i} className={i === selectedPage ? 'active' : ''} onClick={() => { selectPage(i); selectElement(null); setSection('pages'); setPreview(false); }}>{p.blank ? <span className="blank-thumb" style={{ background: p.background }}>Aa</span> : <img src={p.src} alt="" />}<span>{i + 1}</span></button>)}<button onClick={blankPage} className="add-page-tile">+<small>Pagina</small></button></div>
    </section>
  </div>;
}
