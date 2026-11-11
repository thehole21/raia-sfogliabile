// Demo Catalog for Raia Design & Stampa

export class DemoCatalogGenerator {
  static createPageCanvas(width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, width, height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  static generate() {
    const W = 1000;
    const H = 1414; // A4 ratio
    const pages = [];

    // Page 1: Hardcover Front (Burgundy Raia Prestige)
    const coverSrc = this.createPageCanvas(W, H, (ctx, w, h) => {
      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#15171e');
      bg.addColorStop(0.5, '#211317');
      bg.addColorStop(1, '#0c0d11');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Elegant burgundy border frame
      ctx.strokeStyle = 'rgba(133, 34, 51, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, w - 120, h - 120);

      // Inner thin gold frame
      ctx.strokeStyle = 'rgba(212, 163, 89, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(70, 70, w - 140, h - 140);

      // Emblem circular badge
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, 380, 100, 0, Math.PI * 2);
      ctx.fillStyle = '#852233';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d4a359';
      ctx.stroke();

      // 'R' in badge
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', w / 2, 380);
      ctx.restore();

      // Top badge
      ctx.fillStyle = '#d4a359';
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '10px';
      ctx.textAlign = 'center';
      ctx.fillText('EDIZIONE PRESTIGE 2026', w / 2, 200);

      // Main Brand Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px "Cormorant Garamond", Georgia, serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('RAIA', w / 2, 590);

      ctx.fillStyle = '#852233';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('DESIGN, STAMPA E COMUNICAZIONE', w / 2, 650);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('PORTFOLIO PROGETTI & FINITURE DI PREGIO', w / 2, 710);

      // Bottom coordinates
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('NAPOLI  |  MILANO  |  ROMA', w / 2, h - 100);
    });

    pages.push({
      id: 'page-1',
      src: coverSrc,
      title: 'Raia Prestige Lookbook',
      subtitle: 'Design, Stampa e Comunicazione',
      type: 'cover',
      isCover: true,
      pageNumber: 1
    });

    // Page 2: Editorial Manifesto & Presentation
    const page2Src = this.createPageCanvas(W, H, (ctx, w, h) => {
      ctx.fillStyle = '#fcfcfc';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#852233';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('EDITORIALE // 01', 100, 130);

      ctx.font = 'italic 52px "Cormorant Garamond", Georgia, serif';
      ctx.fillStyle = '#111827';
      ctx.fillText('Diamo corpo alle tue idee.', 100, 220);
      ctx.fillText('Dalla carta all\'esperienza.', 100, 280);

      // Burgundy bar
      ctx.fillStyle = '#852233';
      ctx.fillRect(100, 320, 100, 4);

      ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#4b5563';
      const lines = [
        "In Raia uniamo l'eccellenza della stampa offset e digitale",
        "alla maestria del graphic design contemporaneo.",
        "",
        "Ogni catalogo, packaging o materiale coordinato nasce",
        "per comunicare l'unicità del brand attraverso carte speciali,",
        "nobilitazioni a caldo, rilievi a secco e rilegature sartoriali.",
        "",
        "Questo sfogliabile digitale rappresenta il connubio perfetto",
        "tra la precisione artigianale della stampa fisica e",
        "l'accessibilità interattiva per i tuoi clienti in tutto il mondo."
      ];
      let y = 380;
      for (const l of lines) {
        ctx.fillText(l, 100, y);
        y += 32;
      }

      // Feature highlights
      y = 780;
      const feats = [
        { title: 'Stampa Fine Art & Nobilitazioni', desc: 'Lamine a caldo, serigrafia UV spessorata e rilievo' },
        { title: 'Graphic Design & Identity', desc: 'Progettazione editoriale e packaging su misura' },
        { title: 'Cataloghi Interattivi 3D', desc: 'Soluzioni digitali sfogliabili con link diretto per clienti' }
      ];

      for (const f of feats) {
        ctx.fillStyle = '#852233';
        ctx.beginPath();
        ctx.arc(110, y - 6, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111827';
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(f.title, 130, y);

        ctx.fillStyle = '#6b7280';
        ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(f.desc, 130, y + 24);

        y += 75;
      }
    });

    pages.push({
      id: 'page-2',
      src: page2Src,
      title: 'Editoriale Raia',
      type: 'page',
      pageNumber: 2
    });

    // Page 3: Brand Identity & Packaging Spreads
    const page3Src = this.createPageCanvas(W, H, (ctx, w, h) => {
      ctx.fillStyle = '#13151b';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#852233';
      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('PORTFOLIO // SELEZIONE 01', 90, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 46px "Cormorant Garamond", Georgia, serif';
      ctx.fillText('Packaging di Lusso & Scatole Rigide', 90, 185);

      // Simulated luxury box photograph
      const boxGrad = ctx.createLinearGradient(90, 240, w - 90, 800);
      boxGrad.addColorStop(0, '#242a38');
      boxGrad.addColorStop(0.5, '#191c24');
      boxGrad.addColorStop(1, '#0e1015');
      ctx.fillStyle = boxGrad;
      ctx.fillRect(90, 230, w - 180, 560);

      // Hot gold foil logo simulation on packaging
      ctx.strokeStyle = '#d4a359';
      ctx.lineWidth = 2;
      ctx.strokeRect(w / 2 - 140, 430, 280, 140);

      ctx.fillStyle = '#d4a359';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '6px';
      ctx.textAlign = 'center';
      ctx.fillText('RAIA COUTURE', w / 2, 490);
      ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('LIMITED LUXURY BOX', w / 2, 525);
      ctx.textAlign = 'left';

      // Caption
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Finitura: Cartoncino accoppiato 2mm con carta materica Fedrigoni', 90, 840);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Stampa a caldo in oro opaco, chiusura calamitata e fustellatura personalizzata.', 90, 875);
    });

    pages.push({
      id: 'page-3',
      src: page3Src,
      title: 'Packaging Luxury',
      type: 'page',
      pageNumber: 3
    });

    // Page 4: Nobilitazioni e Campionario Carte
    const page4Src = this.createPageCanvas(W, H, (ctx, w, h) => {
      ctx.fillStyle = '#f8f8f9';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#852233';
      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('TECNICHE & NOBILITAZIONI // 02', 90, 120);

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 44px "Cormorant Garamond", serif';
      ctx.fillText('Carte Speciali & Trattamenti Superficiali', 90, 180);

      // Swatches grid 2x2
      const swW = (w - 220) / 2;
      const swH = 260;

      const swatches = [
        { name: 'Lamina a Caldo Oro & Rame', color: '#1f242e', border: '#d4a359' },
        { name: 'Vernice UV Serigrafica a Spessore', color: '#161922', border: '#852233' },
        { name: 'Rilievo a Secco con Debossing', color: '#eef0f3', border: '#cbd5e1', dark: true },
        { name: 'Brossura Filo Refe Dorata', color: '#2b2126', border: '#d4a359' }
      ];

      let sx = 90;
      let sy = 230;

      for (let i = 0; i < swatches.length; i++) {
        const sw = swatches[i];
        ctx.fillStyle = sw.color;
        ctx.fillRect(sx, sy, swW, swH);

        ctx.strokeStyle = sw.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, swW, swH);

        ctx.fillStyle = sw.dark ? '#111827' : '#ffffff';
        ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(sw.name, sx + 24, sy + swH - 24);

        if (i % 2 === 0) {
          sx += swW + 40;
        } else {
          sx = 90;
          sy += swH + 40;
        }
      }

      ctx.fillStyle = '#4b5563';
      ctx.font = 'italic 16px "Cormorant Garamond", serif';
      ctx.fillText('Ogni lavorazione viene calibrata per esaltare al massimo la resa visiva e tattile.', 90, 870);
    });

    pages.push({
      id: 'page-4',
      src: page4Src,
      title: 'Nobilitazioni di Pregio',
      type: 'page',
      pageNumber: 4
    });

    // Page 5: Backcover (Hardcover Retro)
    const backSrc = this.createPageCanvas(W, H, (ctx, w, h) => {
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0c0d11');
      bg.addColorStop(0.5, '#1e1115');
      bg.addColorStop(1, '#090a0d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(133, 34, 51, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, w - 120, h - 120);

      // Center logo text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('RAIA', w / 2, h / 2 - 50);

      ctx.fillStyle = '#852233';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('DESIGN, STAMPA E COMUNICAZIONE', w / 2, h / 2 + 5);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('www.raia.it  |  info@raia.it', w / 2, h / 2 + 65);

      ctx.fillStyle = '#d4a359';
      ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('CATALOGHI • PACKAGING • BRAND IDENTITY • DIGITAL FLIPBOOKS', w / 2, h / 2 + 110);
    });

    pages.push({
      id: 'page-5',
      src: backSrc,
      title: 'Retro Copertina',
      type: 'back',
      isBack: true,
      pageNumber: 5
    });

    return pages;
  }
}
