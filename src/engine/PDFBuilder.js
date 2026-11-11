// Client-Side Zero-Dependency High Resolution PDF Compiler
// ISO 32000 compliant

export class PDFBuilder {
  static async processImage(imageSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const base64Data = dataUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        resolve({ width: w, height: h, bytes });
      };
      img.onerror = (err) => reject(err);
      img.src = imageSrc;
    });
  }

  static async generate(pagesList, options = {}) {
    const processedImages = [];
    for (let i = 0; i < pagesList.length; i++) {
      try {
        const imgInfo = await this.processImage(pagesList[i].src);
        processedImages.push({ info: imgInfo, meta: pagesList[i] });
      } catch (e) {
        console.warn('PDF page processing error:', e);
      }
    }

    if (processedImages.length === 0) {
      throw new Error('Nessuna pagina valida trovata per il PDF.');
    }

    const N = processedImages.length;
    const totalObjects = 2 + (N * 3);
    const offsets = [];
    const enc = new TextEncoder();
    const chunks = [];

    const writeString = (str) => chunks.push(enc.encode(str));
    const writeBytes = (b) => chunks.push(b);
    const recordOffset = () => chunks.reduce((acc, c) => acc + c.byteLength, 0);

    // Header
    writeString("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    // Catalog
    offsets[1] = recordOffset();
    writeString(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

    // Pages Tree
    offsets[2] = recordOffset();
    const kids = [];
    for (let i = 0; i < N; i++) {
      kids.push(`${3 + (i * 3)} 0 R`);
    }
    writeString(`2 0 obj\n<< /Type /Pages /Kids [ ${kids.join(' ')} ] /Count ${N} >>\nendobj\n`);

    for (let i = 0; i < N; i++) {
      const item = processedImages[i];
      const pageObjNum = 3 + (i * 3);
      const contentObjNum = pageObjNum + 1;
      const imgObjNum = pageObjNum + 2;

      const ptWidth = 595.28;
      const ptHeight = (item.info.height / item.info.width) * ptWidth;

      offsets[pageObjNum] = recordOffset();
      writeString(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 ${ptWidth.toFixed(2)} ${ptHeight.toFixed(2)} ] /Contents ${contentObjNum} 0 R /Resources << /XObject << /Im${i + 1} ${imgObjNum} 0 R >> >> >>\nendobj\n`);

      offsets[contentObjNum] = recordOffset();
      const streamContent = `q\n${ptWidth.toFixed(2)} 0 0 ${ptHeight.toFixed(2)} 0 0 cm\n/Im${i + 1} Do\nQ\n`;
      writeString(`${contentObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`);

      offsets[imgObjNum] = recordOffset();
      writeString(`${imgObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${item.info.width} /Height ${item.info.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${item.info.bytes.byteLength} >>\nstream\n`);
      writeBytes(item.info.bytes);
      writeString(`\nendstream\nendobj\n`);
    }

    const startXref = recordOffset();
    writeString(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
    for (let i = 1; i <= totalObjects; i++) {
      const off = offsets[i] || 0;
      writeString(`${off.toString().padStart(10, '0')} 00000 n \n`);
    }

    writeString(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

    return new Blob(chunks, { type: 'application/pdf' });
  }
}
