type Props = {
  open: boolean;
  onClose: () => void;
};

export function SupportLetterAnimation({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="support-letter-scene" role="dialog" aria-modal="true" aria-label="Обращение передано">
      <button type="button" className="support-letter-backdrop" onClick={onClose} aria-label="Закрыть" />
      <div className="support-letter-stage">
        <svg className="support-courier" viewBox="0 0 220 210" aria-hidden="true">
          <defs>
            <linearGradient id="angelBody" x1="30%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f4f1e6" />
              <stop offset="100%" stopColor="#d9d2c0" />
            </linearGradient>
            <linearGradient id="angelWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e8d9a8" />
            </linearGradient>
          </defs>
          <ellipse className="support-courier-shadow" cx="100" cy="198" rx="24" ry="5" fill="rgba(0,0,0,0.22)" />
          <g className="support-courier-body">
            <path
              className="support-wing support-wing--left"
              d="M92 88 C58 70 42 92 48 118 C62 104 78 102 92 108 Z"
              fill="url(#angelWing)"
              stroke="#c9a227"
              strokeWidth="1"
              opacity="0.92"
            />
            <path
              className="support-wing support-wing--right"
              d="M108 88 C142 70 158 92 152 118 C138 104 122 102 108 108 Z"
              fill="url(#angelWing)"
              stroke="#c9a227"
              strokeWidth="1"
              opacity="0.92"
            />
            <path d="M94 96 C84 122 82 152 88 176" fill="none" stroke="#f0e6d3" strokeWidth="3" strokeLinecap="round" />
            <path d="M106 96 C116 122 118 152 112 176" fill="none" stroke="#f0e6d3" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="88" cy="178" rx="5" ry="3" fill="#e8d9a8" />
            <ellipse cx="112" cy="178" rx="5" ry="3" fill="#e8d9a8" />
            <path className="support-courier-arm" d="M108 92 C128 100 142 110 158 118" fill="none" stroke="#f0e6d3" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M92 92 C78 102 72 116 76 128" fill="none" stroke="#f0e6d3" strokeWidth="2.4" strokeLinecap="round" />
            <ellipse cx="100" cy="108" rx="11" ry="34" fill="url(#angelBody)" stroke="#c9a227" strokeWidth="1.2" />
            <circle cx="100" cy="58" r="16" fill="url(#angelBody)" stroke="#c9a227" strokeWidth="1.2" />
            <ellipse cx="100" cy="44" rx="18" ry="6" fill="none" stroke="#e8b923" strokeWidth="1.4" opacity="0.85" />
            <g className="support-courier-eyes">
              <ellipse cx="94" cy="58" rx="3" ry="3.6" fill="#fff" />
              <ellipse cx="106" cy="58" rx="3" ry="3.6" fill="#fff" />
              <circle cx="94.4" cy="58.6" r="1.4" fill="#3a4a58" />
              <circle cx="106.4" cy="58.6" r="1.4" fill="#3a4a58" />
            </g>
            <path d="M96 66 Q100 70 104 66" fill="none" stroke="#3a4a58" strokeWidth="1.3" strokeLinecap="round" />
            <g className="support-letter">
              <rect x="150" y="104" width="40" height="26" rx="2" fill="#fffaf0" stroke="#c9a227" strokeWidth="1.2" />
              <path d="M150 106 L170 118 L190 106" fill="none" stroke="#c9a227" strokeWidth="1.1" />
            </g>
          </g>
        </svg>
        <div className="support-letter-card">
          <h3>Обращение передано</h3>
          <p>Ожидайте ответа</p>
          <button type="button" className="btn-primary" onClick={onClose}>
            Ок
          </button>
        </div>
      </div>
    </div>
  );
}
