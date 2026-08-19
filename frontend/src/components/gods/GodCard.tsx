import type { CSSProperties } from 'react';
import { getGodImageByGod, hasDedicatedGodImage } from '../../data/god-images';
import type { SlavicGod } from '../../data/gods';
import { GodSymbol } from './GodSymbol';
import './GodCard.css';

type Props = {
  god: SlavicGod;
  selected: boolean;
  onSelect: (god: SlavicGod) => void;
};

export function GodCard({ god, selected, onSelect }: Props) {
  const hasImage = hasDedicatedGodImage(god);

  return (
    <button
      type="button"
      className={`god-card panel-glass${selected ? ' god-card--selected' : ''}`}
      onClick={() => onSelect(god)}
      style={{ '--god-accent': god.color } as CSSProperties}
    >
      <span className="god-card-help" aria-label={`Описание ${god.name}`}>
        ?
        <span className="god-card-tooltip">{god.description}</span>
      </span>
      {hasImage ? (
        <img src={getGodImageByGod(god)} alt={god.name} className="god-card-image" loading="lazy" />
      ) : (
        <span className="god-card-image god-card-image--symbol">
          <GodSymbol god={god} size={48} active={selected} />
        </span>
      )}
      <div className="god-card-body">
        <p className="god-card-title">{god.title}</p>
        <h3 className="god-card-name">{god.name}</h3>
        <p className="god-card-domain">{god.domain}</p>
        <p className="god-card-summary">{god.description}</p>
      </div>
    </button>
  );
}
