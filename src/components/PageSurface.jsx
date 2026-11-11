import React from 'react';
import { elementStyle, pageBackground } from '../engine/pageModel.js';
export function PageSurface({ page, selected, onSelect, onDragStart, onDrag, onDragEnd, onEdit, interactive = false }) {
  if (!page) return null;
  return <div className="page-surface" style={{ background: pageBackground(page) }}>
    {!page.blank && page.src && <img className="page-base-image" src={page.src} alt="" draggable="false" />}
    {(page.elements || []).map(item => <div key={item.id} className={`${interactive ? 'editable-element' : 'surface-element'} ${selected === item.id ? 'selected' : ''} ${item.locked ? 'locked' : ''}`} style={elementStyle(item)}
      onPointerDown={interactive ? e => { e.stopPropagation(); onSelect?.(item.id); if (!item.locked) onDragStart?.(e,item); } : undefined}
      onPointerMove={interactive ? onDrag : undefined} onPointerUp={interactive ? onDragEnd : undefined} onPointerCancel={interactive ? onDragEnd : undefined} onDoubleClick={interactive ? () => onEdit?.(item) : undefined}>
      {item.type === 'image' ? <img src={item.src} alt={item.name || ''} draggable="false" style={{ objectFit: item.fit || 'contain' }} /> : item.type === 'video' ? <div className="media-placeholder">▷<small>Video</small></div> : item.type === 'audio' ? <div className="media-placeholder">♫<small>Audio</small></div> : item.type !== 'shape' ? item.text : null}
      {interactive && selected === item.id && !item.locked && <span className="element-resize" onPointerDown={e => { e.stopPropagation(); onDragStart?.(e,item,true); }} />}
    </div>)}
  </div>;
}
