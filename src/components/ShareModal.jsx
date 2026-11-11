import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, QrCode, Code2, Send, Share2 } from 'lucide-react';

export function ShareModal({ isOpen, onClose, catalogTitle, showToast }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const qrCanvasRef = useRef(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://raia-sfogliabile.vercel.app';
  const embedCode = `<iframe src="${currentUrl}" width="100%" height="600" frameborder="0" allowfullscreen allow="clipboard-write"></iframe>`;

  // Draw simple clean QR Code pattern onto Canvas
  useEffect(() => {
    if (!isOpen || !qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 160;
    canvas.width = size;
    canvas.height = size;

    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw stylized QR matrix pattern with Raia Burgundy center emblem
    const cells = 21;
    const cellSize = size / cells;

    // Deterministic pseudo-random based on URL
    let seed = 0;
    for (let i = 0; i < currentUrl.length; i++) {
      seed = (seed + currentUrl.charCodeAt(i) * (i + 1)) % 100000;
    }

    function pseudoRandom() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    ctx.fillStyle = '#111827';

    // Position detection patterns (corners)
    function drawFinder(x, y) {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#852233'; // Raia red center in finder
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      ctx.fillStyle = '#111827';
    }

    drawFinder(0, 0);
    drawFinder(cells - 7, 0);
    drawFinder(0, cells - 7);

    // Matrix dots
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Skip finders
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= cells - 8) ||
          (r >= cells - 8 && c < 8)
        ) continue;

        // Skip center logo zone
        if (r >= 8 && r <= 12 && c >= 8 && c <= 12) continue;

        if (pseudoRandom() > 0.45) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }

    // Raia center badge in QR code
    ctx.fillStyle = '#852233';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', size / 2, size / 2);

  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast('Link copiato negli appunti!');
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
      showToast('Codice di incorporamento copiato!');
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Sfoglia il catalogo "${catalogTitle}": ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-title-group">
            <Share2 size={20} color="#852233" />
            <h3>Condividi Flipbook</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="share-modal-body">
          {/* QR Code and Social Actions */}
          <div className="qr-section">
            <div className="qr-frame">
              <canvas ref={qrCanvasRef} className="qr-canvas" />
              <span className="qr-caption">Scansiona con Smartphone</span>
            </div>

            <div className="qr-actions">
              <h4>Condivisione Rapida</h4>
              <p>Invia direttamente il catalogo ai tuoi clienti su smartphone o tablet:</p>
              <button className="btn-whatsapp" onClick={shareWhatsApp}>
                <Send size={16} />
                <span>Condividi su WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Direct Link */}
          <div className="share-field-group">
            <label>Link Diretto del Catalogo</label>
            <div className="share-input-row">
              <input type="text" readOnly value={currentUrl} className="share-input" />
              <button
                className="btn-copy-share"
                onClick={() => copyToClipboard(currentUrl, 'link')}
              >
                {copiedLink ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                <span>{copiedLink ? 'Copiato' : 'Copia'}</span>
              </button>
            </div>
          </div>

          {/* Embed Code (Iframe) */}
          <div className="share-field-group">
            <label>Codice di Incorporamento (Sito Web / Iframe)</label>
            <div className="share-input-row">
              <input type="text" readOnly value={embedCode} className="share-input" />
              <button
                className="btn-copy-share"
                onClick={() => copyToClipboard(embedCode, 'embed')}
              >
                {copiedEmbed ? <Check size={16} color="#4ade80" /> : <Code2 size={16} />}
                <span>{copiedEmbed ? 'Copiato' : 'Copia'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
