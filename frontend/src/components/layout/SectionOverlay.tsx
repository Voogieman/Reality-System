import { useEffect, type ReactNode } from 'react';
import './SectionOverlay.css';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  children: ReactNode;
};

export function SectionOverlay({ open, title, onClose, onBack, canGoBack, children }: Props) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (canGoBack && onBack) onBack();
      else onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, onBack, canGoBack]);

  if (!open) return null;

  return (
    <div className="section-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="section-overlay-backdrop"
        onClick={canGoBack && onBack ? onBack : onClose}
        aria-label={canGoBack ? 'Назад' : 'Закрыть'}
      />
      <div className="section-overlay-panel panel-glass">
        <div className="section-overlay-head">
          <button
            type="button"
            className="section-overlay-back"
            onClick={canGoBack && onBack ? onBack : onClose}
          >
            ← Назад
          </button>
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
