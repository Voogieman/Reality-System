import type { ReactNode } from 'react';
import './Modal.css';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeText?: string;
  lockClose?: boolean;
};

export function Modal({ open, title, onClose, children, closeText = 'Закрыть', lockClose = false }: Props) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-box panel-glass">
        <div className="modal-head">
          <h3>{title}</h3>
          {!lockClose && (
            <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          )}
        </div>
        <div className="modal-content">{children}</div>
        {!lockClose && (
          <div className="modal-actions">
            <button className="btn-secondary" type="button" onClick={onClose}>
              {closeText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

