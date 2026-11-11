import React, { useState } from 'react';
import { StandaloneExporter } from '../engine/StandaloneExporter.js';
import { PDFBuilder } from '../engine/PDFBuilder.js';
import { ShareModal } from './ShareModal.jsx';
export function ExportTab({ state, showToast }) {
  const [busy, setBusy] = useState('');
  const [share, setShare] = useState(false);
  const download = async type => {
    if (busy || !state.pages.length) return;
    setBusy(type);
    try {
      const css = [...document.styleSheets].flatMap(sheet => { try { return [...sheet.cssRules].map(r => r.cssText); } catch { return []; } }).join('\n');
      const blob = type === 'html' ? await StandaloneExporter.export(state, css) : await PDFBuilder.generate(state.pages);
      const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = (state.title || 'catalogo-raia').replace(/[^a-z0-9]/gi,'-') + '.' + type; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(type === 'html' ? 'Sfogliabile HTML scaricato' : 'PDF scaricato');
    } catch { showToast('Esportazione non riuscita. Riprova.'); } finally { setBusy(''); }
  };
  return <div className="simple-export"><span className="export-eyebrow">RAIA / PUBBLICA E CONDIVIDI</span><h1>Il tuo catalogo, pronto da condividere.</h1><p>Scegli il formato. Le tue pagine e le personalizzazioni vengono incluse nell’esportazione.</p><div className="simple-export-grid">
    <article><span>01 / WEB</span><h2>Sfogliabile HTML</h2><p>Un file completo con pagine interattive, link, suono e personalizzazioni. Aprilo offline o caricalo sul tuo sito.</p><button disabled={!!busy || !state.pages.length} onClick={() => download('html')}>{busy === 'html' ? 'Preparazione…' : 'Scarica HTML'}</button></article>
    <article><span>02 / DOCUMENTO</span><h2>Catalogo PDF</h2><p>Tutte le pagine, compresi i testi e le immagini aggiunti nell’editor, in un documento da scaricare e stampare.</p><button disabled={!!busy || !state.pages.length} onClick={() => download('pdf')}>{busy === 'pdf' ? 'Preparazione…' : 'Scarica PDF'}</button></article>
    <article><span>03 / CONDIVISIONE</span><h2>Link e incorpora</h2><p>Copia l’indirizzo del catalogo pubblicato oppure il codice HTML per inserirlo all’interno del tuo sito.</p><button onClick={() => setShare(true)}>Link / Incorpora</button></article>
  </div><p className="export-footnote">Per un link pubblico, pubblica il file HTML sul tuo spazio web. Il download non pubblica automaticamente il catalogo.</p><ShareModal isOpen={share} onClose={() => setShare(false)} catalogTitle={state.title} showToast={showToast} /></div>;
}
