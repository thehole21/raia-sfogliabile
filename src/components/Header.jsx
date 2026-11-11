import React from 'react';
import { BookOpen, Edit3, Share2, Sparkles, Eye } from 'lucide-react';

export function Header({ activeTab, setActiveTab, onLoadDemo, onPreview }) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <img
          src="/raia-logo.png"
          alt="Raia - Design, Stampa e Comunicazione"
          className="brand-logo-img"
        />
        <div className="brand-badge-tag">
          FLIPBOOK STUDIO
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Edit3 size={16} />
          <span>Studio & Impaginazione</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'viewer' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('viewer');
            if (onPreview) onPreview();
          }}
        >
          <BookOpen size={16} />
          <span>Sfogliabile 3D</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <Share2 size={16} />
          <span>Condividi & Esporta</span>
        </button>
      </nav>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onLoadDemo} title="Carica catalogo demo di Raia">
          <Sparkles size={16} />
          <span>Carica Demo Raia</span>
        </button>

        <button
          className="btn-primary"
          onClick={() => {
            setActiveTab('viewer');
            if (onPreview) onPreview();
          }}
        >
          <Eye size={16} />
          <span>Sfoglia Libro</span>
        </button>
      </div>
    </header>
  );
}
