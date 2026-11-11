import React, { useState } from 'react';
import {
  Globe,
  FileCode,
  FileText,
  CheckCircle,
  Copy,
  ExternalLink,
  Download,
  Terminal,
  ShieldCheck,
  Send
} from 'lucide-react';
import { StandaloneExporter } from '../engine/StandaloneExporter.js';
import { PDFBuilder } from '../engine/PDFBuilder.js';

export function ExportTab({ state, showToast }) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isExportingHtml, setIsExportingHtml] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const gitCommands = `# 1. Vai nella cartella del progetto
cd raia-sfogliabile

# 2. Crea la repo su GitHub (thehole21/raia-sfogliabile) e collega il remote
git remote add origin https://github.com/thehole21/raia-sfogliabile.git
git branch -M main
git push -u origin main

# 3. Su Vercel: Importa la repo 'raia-sfogliabile' e clicca 'Deploy'!`;

  const copyGitCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    showToast('Comandi Git copiati negli appunti!');
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleExportHtml = async () => {
    if (state.pages.length === 0) {
      showToast('Aggiungi prima delle pagine al catalogo!');
      return;
    }

    setIsExportingHtml(true);
    showToast('Compilazione pacchetto autonomo (.html)...');

    try {
      // Gather css rules from stylesheet
      let cssRules = '';
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            cssRules += rule.cssText + '\n';
          }
        } catch (e) {}
      }

      const htmlBlob = await StandaloneExporter.export(state, cssRules);
      const filename = (state.title || 'catalogo-raia')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') + '-sfogliabile.html';

      downloadBlob(htmlBlob, filename);
      showToast(`Scaricato con successo: ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('Errore durante l\'esportazione HTML.');
    } finally {
      setIsExportingHtml(false);
    }
  };

  const handleExportPdf = async () => {
    if (state.pages.length === 0) {
      showToast('Aggiungi prima delle pagine al catalogo!');
      return;
    }

    setIsExportingPdf(true);
    showToast('Generazione PDF ad alta risoluzione...');

    try {
      const pdfBlob = await PDFBuilder.generate(state.pages, {
        title: state.title
      });

      const filename = (state.title || 'catalogo-raia')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') + '.pdf';

      downloadBlob(pdfBlob, filename);
      showToast(`PDF generato con successo: ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('Errore durante la creazione del PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="export-layout">
      <div className="export-hero">
        <div className="brand-pill">RAIA DEPLOY & SHARE HUB</div>
        <h2>Esporta & Condividi con i tuoi Clienti</h2>
        <p>
          Tutte le modalità di condivisione professionali: dal link cloud su Vercel per il tuo account{' '}
          <strong>thehole21</strong>, al pacchetto autonomo interattivo 3D con audio fino al PDF di stampa.
        </p>
      </div>

      <div className="export-grid">
        {/* CARD 1: VERCEL & GITHUB DEPLOYMENT */}
        <div className="export-card highlight-card">
          <span className="export-badge-tag badge-vercel">Vercel & GitHub</span>
          <div className="export-icon">
            <Globe size={28} />
          </div>
          <h3>Deploy su Vercel (thehole21)</h3>
          <p>
            L'applicazione React + Node.js è configurata al 100% con <code>vercel.json</code> e build Vite.
            Puoi pubblicarla su Vercel in 60 secondi con il tuo account GitHub:
          </p>

          <div className="code-snippet-box">
            <div className="code-snippet-header">
              <div className="code-snippet-title">
                <Terminal size={14} />
                <span>Comandi Git per thehole21/raia-sfogliabile</span>
              </div>
              <button className="copy-code-btn" onClick={copyGitCommands}>
                {copiedCmd ? <CheckCircle size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copiedCmd ? 'Copiato!' : 'Copia'}</span>
              </button>
            </div>
            <pre className="code-snippet-body">
              <code>{gitCommands}</code>
            </pre>
          </div>

          <ul className="export-features">
            <li>
              <ShieldCheck size={16} />
              URL pubblico sicuro HTTPS (es. <code>raia-sfogliabile.vercel.app</code>)
            </li>
            <li>
              <ShieldCheck size={16} />
              Aggiornamenti automatici ad ogni push su GitHub
            </li>
            <li>
              <ShieldCheck size={16} />
              Pronto per collegare il tuo dominio personalizzato (es. <code>sfogliabile.raia.it</code>)
            </li>
          </ul>

          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary full-width text-center"
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            <ExternalLink size={16} />
            <span>Apri Vercel Dashboard</span>
          </a>
        </div>

        {/* CARD 2: STANDALONE HTML 3D FLIPBOOK */}
        <div className="export-card">
          <span className="export-badge-tag badge-gold">Consigliato per Clienti</span>
          <div className="export-icon">
            <FileCode size={28} />
          </div>
          <h3>Pacchetto Web Autonomo (.html)</h3>
          <p>
            Genera un singolo file HTML autonomo che include tutte le immagini ad alta qualità,
            il motore 3D e i suoni realistici della carta. Nessun server necessario.
          </p>

          <ul className="export-features">
            <li>
              <CheckCircle size={16} />
              Funziona con doppio clic su qualsiasi PC, Mac, iPhone o Android
            </li>
            <li>
              <CheckCircle size={16} />
              Ideale da inviare tramite WhatsApp, Email o WeTransfer
            </li>
            <li>
              <CheckCircle size={16} />
              Caricabile anche sul server/sito web aziendale di Raia
            </li>
          </ul>

          <button
            className="btn-primary full-width"
            onClick={handleExportHtml}
            disabled={isExportingHtml}
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <Download size={16} />
            <span>{isExportingHtml ? 'Compilazione...' : 'Scarica File Sfogliabile (.html)'}</span>
          </button>
        </div>

        {/* CARD 3: HIGH RESOLUTION PDF */}
        <div className="export-card">
          <span className="export-badge-tag badge-slate">Stampa & Documento</span>
          <div className="export-icon">
            <FileText size={28} />
          </div>
          <h3>Catalogo PDF ad Alta Risoluzione</h3>
          <p>
            Compila tutte le pagine in un documento PDF conforme allo standard ISO 32000,
            con compressione JPEG ad alta fedeltà pronto per la stampa o l'invio formale.
          </p>

          <ul className="export-features">
            <li>
              <CheckCircle size={16} />
              Compatibile al 100% con Adobe Acrobat Reader e visualizzatori PDF
            </li>
            <li>
              <CheckCircle size={16} />
              Risoluzione perfetta per stampa offset o digitale professionale
            </li>
            <li>
              <CheckCircle size={16} />
              Ideale per archiviazione documentale e allegati a contratti
            </li>
          </ul>

          <button
            className="btn-secondary full-width"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <Download size={16} />
            <span>{isExportingPdf ? 'Generazione...' : 'Esporta Catalogo PDF (.pdf)'}</span>
          </button>
        </div>
      </div>

      {/* QUICK INSTANT LINK TIP BOX */}
      <div className="quick-tip-banner">
        <div className="tip-icon">
          <Send size={24} />
        </div>
        <div className="tip-content">
          <h4>Vuoi mandare un link istantaneo a un cliente in 20 secondi?</h4>
          <p>
            Dopo aver scaricato il <strong>file .html autonomo</strong>, puoi anche trascinarlo gratis su{' '}
            <a href="https://tiiny.host" target="_blank" rel="noopener noreferrer">
              tiiny.host
            </a>{' '}
            o{' '}
            <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer">
              Netlify Drop
            </a>
            : riceverai subito un link web protetto da inviare immediatamente su WhatsApp al cliente!
          </p>
        </div>
      </div>
    </div>
  );
}
