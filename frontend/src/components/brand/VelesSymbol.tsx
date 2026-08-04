import { useId } from 'react';
import './VelesSymbol.css';

type Props = {
  size?: number;
  className?: string;
  title?: string;
};

/** Знак Велеса («Бычья голова»): рога + перевёрнутая «А» с прорезью. */
export function VelesSymbol({ size = 32, className = '', title = 'Знак Велеса' }: Props) {
  const gradId = useId().replace(/:/g, '');

  return (
    <svg
      className={`veles-symbol ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 56"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`velesGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.82" />
        </linearGradient>
      </defs>
      <path
        className="veles-symbol-horns"
        fill={`url(#velesGrad-${gradId})`}
        d="
          M 6 4 L 11 17 L 9 17 L 6 4 Z
          M 9 15 H 39 V 17 H 9 Z
          M 42 4 L 37 17 L 39 17 L 42 4 Z
        "
      />
      <path
        className="veles-symbol-body"
        fill={`url(#velesGrad-${gradId})`}
        fillRule="evenodd"
        d="
          M 8 22 L 40 22 L 24 52 Z
          M 16 30 L 32 30 L 24 43 Z
        "
      />
    </svg>
  );
}
