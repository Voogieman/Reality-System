import type { CSSProperties } from 'react';
import type { SlavicGod } from '../../data/gods';
import './GodSymbol.css';

const ELEMENT_GLYPH: Record<string, string> = {
  огонь: 'ᛟ',
  вода: 'ᛩ',
  земля: 'ᛉ',
  воздух: 'ᛈ',
  эфир: 'ᛊ',
};

type Props = {
  god: SlavicGod;
  size?: number;
  active?: boolean;
};

export function GodSymbol({ god, size = 56, active = false }: Props) {
  const glyph = ELEMENT_GLYPH[god.element] ?? '◆';

  return (
    <div
      className={`god-symbol ${active ? 'god-symbol--active' : ''}`}
      style={
        {
          '--god-color': god.color,
          width: size,
          height: size,
        } as CSSProperties
      }
      title={god.name}
    >
      <span className="god-symbol-glyph" aria-hidden>
        {glyph}
      </span>
      <span className="god-symbol-initial">{god.name.charAt(0)}</span>
    </div>
  );
}
