import { useEffect, type ReactNode } from 'react';
import './SectionOverlay.css';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function SectionOverlay({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="section-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="section-overlay-backdrop" onClick={onClose} aria-label="Закрыть" />
      <div className="section-overlay-panel panel-glass">
        <div className="section-overlay-head">
          <p className="section-overlay-kicker">{title}</p>
          <button type="button" className="section-overlay-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="section-overlay-body">{children}</div>
      </div>
    </div>
  );
}
