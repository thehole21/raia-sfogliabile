export async function renderPage(page) {
  const canvas = document.createElement('canvas'); canvas.width = 1440; canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = page.background || '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const image = src => new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
  if (!page.blank && page.src) {
    const img = await image(page.src); const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    ctx.drawImage(img, (canvas.width - img.width * scale) / 2, (canvas.height - img.height * scale) / 2, img.width * scale, img.height * scale);
  }
  for (const item of page.elements || []) {
    const x = item.x / 100 * canvas.width, y = item.y / 100 * canvas.height, width = item.width / 100 * canvas.width;
    if (item.type === 'image') { const img = await image(item.src); ctx.drawImage(img, x, y, width, width / img.width * img.height); continue; }
    const size = (item.fontSize || 24) * 3; const lineHeight = size * 1.35;
    ctx.font = `${item.bold ? '700' : '400'} ${size}px Arial`; ctx.fillStyle = item.color || '#222'; ctx.textBaseline = 'top'; ctx.textAlign = item.align || 'left';
    let lineY = y;
    for (const paragraph of (item.text || '').split('\n')) {
      let line = '';
      const drawLine = () => { ctx.fillText(line, x + (ctx.textAlign === 'center' ? width / 2 : ctx.textAlign === 'right' ? width : 0), lineY); lineY += lineHeight; };
      for (const char of paragraph) { if (line && ctx.measureText(line + char).width > width) { drawLine(); line = ''; } line += char; }
      drawLine();
    }
  }
  return canvas.toDataURL('image/jpeg', .94);
}
