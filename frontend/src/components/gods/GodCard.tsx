import type { CSSProperties } from 'react';
import type { SlavicGod } from '../../data/gods';
import { GodSymbol } from './GodSymbol';
import './GodCard.css';

type Props = {
  god: SlavicGod;
  selected: boolean;
  onSelect: (god: SlavicGod) => void;
};

export function GodCard({ god, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`god-card panel-glass ${selected ? 'god-card--selected' : ''}`}
      onClick={() => onSelect(god)}
      style={{ '--god-accent': god.color } as CSSProperties}
    >
      <span className="god-card-help" aria-label={`Описание ${god.name}`}>
        ?
        <span className="god-card-tooltip">{god.description}</span>
      </span>
      <GodSymbol god={god} active={selected} />
      <h3 className="god-card-name">{god.name}</h3>
      <p className="god-card-title">{god.title}</p>
      <p className="god-card-domain">{god.domain}</p>
    </button>
  );
}
