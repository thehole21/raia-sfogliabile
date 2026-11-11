import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Toast({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className={`toast-msg ${isVisible ? 'show' : ''}`}>
      <CheckCircle2 size={18} color="#852233" />
      <span>{message}</span>
    </div>
  );
}
