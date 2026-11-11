import React, { useState } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';
export function ShareModal({ isOpen, onClose, catalogTitle, showToast }) {
  const [url, setUrl] = useState(() => localStorage.getItem('raia-published-url') || (/^(localhost|127\.)/.test(location.hostname) ? '' : location.origin + location.pathname));
  const [copied, setCopied] = useState('');
  if (!isOpen) return null;
  const valid = /^https?:\/\//i.test(url);
  const copy = async (value, kind) => { try { await navigator.clipboard.writeText(value); setCopied(kind); showToast('Copiato negli appunti'); } catch { showToast('Seleziona il testo e copialo manualmente.'); } };
  const embed = `<iframe src="${url.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')}" title="Catalogo Raia" width="100%" height="700" style="border:0" allowfullscreen></iframe>`;
  return <div className="modal-backdrop" onClick={onClose}><div className="share-modal-card" role="dialog" aria-modal="true" aria-label="Link e codice HTML" onClick={e => e.stopPropagation()}><div className="share-modal-header"><div className="share-title-group"><Link size={20} /><h3>Link e codice HTML</h3></div><button className="modal-close-btn" aria-label="Chiudi" onClick={onClose}><X size={18} /></button></div><div className="share-modal-body">
    <p style={{ fontSize: 13, lineHeight: 1.7 }}>Scarica lo sfogliabile HTML e pubblicalo sul tuo sito. Incolla qui il suo indirizzo per copiarne il link o incorporarlo in una pagina.</p>
    <div className="share-field-group"><label>Indirizzo del catalogo pubblicato</label><div className="share-input-row"><input className="share-input" value={url} placeholder="https://tuosito.it/catalogo.html" onChange={e => { setUrl(e.target.value); localStorage.setItem('raia-published-url',e.target.value); }} /><button className="btn-copy-share" disabled={!valid} onClick={() => copy(url,'link')}>{copied === 'link' ? <Check size={16} /> : <Copy size={16} />} Copia link</button></div></div>
    <div className="share-field-group"><label>Codice HTML per incorporare il catalogo</label><div className="share-input-row"><input className="share-input" value={valid ? embed : ''} readOnly /><button className="btn-copy-share" disabled={!valid} onClick={() => copy(embed,'html')}>Copia HTML</button></div></div>
    {!valid && <p style={{ fontSize: 12, color: '#d4a359' }}>L’anteprima locale non è un link pubblico. Il file HTML scaricato contiene il catalogo e funziona anche offline.</p>}
  </div></div></div>;
}
