export const fontFamilies = { Arial: 'Arial, sans-serif', Georgia: 'Georgia, serif', Verdana: 'Verdana, sans-serif', Courier: 'Courier New, monospace' };
export function pageBackground(page) { return page.gradient ? `linear-gradient(${page.gradientAngle ?? 135}deg, ${page.background || '#fff'}, ${page.backgroundEnd || '#211317'})` : page.background || '#fff'; }
export function elementStyle(item) {
  return { position: 'absolute', left: item.x + '%', top: item.y + '%', width: item.width + '%', height: item.height ? item.height + '%' : undefined,
    fontSize: (item.fontSize || 24) / 480 * 100 + 'cqw', fontFamily: fontFamilies[item.fontFamily] || fontFamilies.Arial,
    color: item.color || '#222222', fontWeight: item.bold ? 700 : 400, fontStyle: item.italic ? 'italic' : 'normal', textDecoration: item.underline ? 'underline' : 'none',
    textAlign: item.align || 'left', lineHeight: item.lineHeight || 1.35, letterSpacing: (item.letterSpacing || 0) / 480 * 100 + 'cqw',
    background: item.background || 'transparent', border: `${item.borderWidth || 0}px solid ${item.borderColor || '#852233'}`, borderRadius: item.shape === 'ellipse' ? '50%' : (item.radius || 0) + 'px',
    opacity: item.opacity ?? 1, transform: `rotate(${item.rotation || 0}deg)`, objectFit: item.fit || 'contain', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', boxSizing: 'border-box', display: item.hidden ? 'none' : undefined };
}
export function createPageNode(page) {
  const node = document.createElement('div'); node.className = 'raia-paper';
  const content = document.createElement('div'); content.className = 'raia-page-layout'; content.style.background = pageBackground(page); node.append(content);
  if (page.isCover || page.isBack) { node.dataset.density = 'hard'; node.classList.add('raia-hardcover'); }
  if (!page.blank && page.src) { const img = document.createElement('img'); img.className = 'raia-base-image'; img.src = page.src; img.alt = page.title || ''; img.draggable = false; content.append(img); }
  for (const item of page.elements || []) {
    const el = document.createElement(item.type === 'link' ? 'a' : item.type === 'image' ? 'img' : item.type === 'video' ? 'video' : item.type === 'audio' ? 'audio' : 'div');
    el.className = 'raia-page-element'; Object.assign(el.style, elementStyle(item));
    if (['image','video','audio'].includes(item.type)) { el.src = item.src || ''; if(item.type === 'image') { el.alt = item.name || ''; el.draggable = false; } else { el.controls = true; el.preload = 'metadata'; } }
    else if (item.type !== 'shape') el.textContent = item.text || '';
    if (item.type === 'link') { try { const url = new URL(item.url); if (['https:','http:','mailto:','tel:'].includes(url.protocol)) { el.href = url.href; el.target = '_blank'; el.rel = 'noopener noreferrer'; } } catch {} }
    if (['link','video','audio'].includes(item.type)) { for(const name of ['pointerdown','mousedown','touchstart','click']) el.addEventListener(name,e => e.stopPropagation()); }
    content.append(el);
  }
  return node;
}
