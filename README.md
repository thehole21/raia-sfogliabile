# Raia Sfogliabile Studio 📖✨
### Design, Stampa e Comunicazione

Un'applicazione web moderna in **React + Node.js (Vite)** creata su misura per **Raia**, progettata per trasformare collezioni di immagini fotografiche in **cataloghi sfogliabili interattivi 3D di lusso**, con audio realistico della carta (*Web Audio API*), fisica di piega e strumenti completi di esportazione per clienti.

Pronta per la pubblicazione su **Vercel** dall'account GitHub **`thehole21`**.

---

## 🎨 Identità Visiva Raia
- **Logo Ufficiale**: Stemma circolare con la 'R' stilizzata e tipografia con il caratteristico punto rosso sulla 'i'.
- **Palette Cromatica**:
  - Rosso Amaranto / Burgundy Raia: `#852233`
  - Carbone & Ossidiana Luxury: `#0f1117`, `#181b24`
  - Oro Caldo & Finiture Nobili: `#d4a359`
  - Bianco Puro & Contrasto Fine Art: `#ffffff`, `#f8fafc`

---

## 🚀 Guida al Deploy su Vercel (per `thehole21`)

Il progetto include già il file di configurazione [`vercel.json`](./vercel.json) e gli script di build ottimizzati per Vercel.

### Passo 1: Crea la repository su GitHub
1. Vai su [GitHub](https://github.com/new) e crea una nuova repository chiamata:
   ```text
   raia-sfogliabile
   ```
   (puoi impostarla come *Public* o *Private* a tua scelta).

### Passo 2: Pusha il codice dal tuo computer
Nel tuo terminale (PowerShell o Git Bash):
```bash
# Entra nella cartella del progetto
cd "C:\Users\manij\.gemini\antigravity\scratch\raia-sfogliabile"

# Inizializza git e collega la tua repo
git init
git add .
git commit -m "Initial commit - Raia Sfogliabile Studio (React + Vite + Vercel)"
git branch -M main
git remote add origin https://github.com/thehole21/raia-sfogliabile.git
git push -u origin main
```

### Passo 3: Collega e Pubblica su Vercel
1. Vai su [vercel.com/new](https://vercel.com/new).
2. Seleziona **"Import"** accanto alla tua repository **`thehole21/raia-sfogliabile`**.
3. Vercel rileverà in automatico il framework **Vite**.
4. Clicca su **"Deploy"**.
5. In meno di un minuto il tuo sito sarà live su un link pubblico HTTPS (es. `https://raia-sfogliabile.vercel.app`)!

---

## 💻 Esecuzione in Locale

Per testare o lavorare sul progetto in locale sul tuo computer:

```bash
# Installa le dipendenze
npm install

# Avvia l'ambiente di sviluppo
npm run dev
```
L'app si aprirà all'indirizzo `http://localhost:3000`.

Per compilare la versione di produzione:
```bash
npm run build
```

---

## 🌟 Funzionalità Principali

1. **Studio Creativo & Upload**:
   - Trascina le immagini del catalogo con ordinamento naturale automatico.
   - Designazione automatica di copertina rigida (*hardcover*) e retro-copertina.
   - Riordino visivo rapido delle pagine.
   - Pulsante **"Carica Demo Raia"** per generare all'istante un lookbook con campionari di packaging, carte speciali e lamine a caldo.

2. **Esperienza Sfogliabile 3D**:
   - Curvatura realistica della carta con riflessi di luce e ombre della rilegatura.
   - **Acustica della Carta (Web Audio API)**: sintetizzatore procedurale senza file MP3 esterni (profili: *Patinata Lucida*, *Cartoncino Spesso*, *Seta Leggera*).
   - Zoom ad alta definizione, miniature estraibili e presentazione automatica (*autoplay*).

3. **Esportazione & Condivisione per Clienti**:
   - **Pacchetto Web Autonomo (.html)**: 1 singolo file con immagini, audio e 3D incorporati da mandare direttamente al cliente via WhatsApp, Email o WeTransfer.
   - **Catalogo PDF ad Alta Risoluzione (.pdf)**: Compilatore PDF standard ISO 32000 per stampe tipografiche.
   - **Salva/Riapri Progetto (.json)**: Per salvare e riprendere il catalogo in qualsiasi momento.
