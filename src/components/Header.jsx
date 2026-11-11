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
          <span>Personalizza</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'viewer' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('viewer');
            if (onPreview) onPreview();
          }}
        >
          <BookOpen size={16} />
          <span>Sfoglia</span>
        </button>


      </nav>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onLoadDemo} title="Carica catalogo demo di Raia">
          <Sparkles size={16} />
          <span>Catalogo demo</span>
        </button>

        <button
          className="btn-primary"
          onClick={() => {
            setActiveTab('viewer');
            if (onPreview) onPreview();
          }}
        >
          <Eye size={16} />
          <span>Anteprima</span>
        </button>
      </div>
    </header>
  );
}
