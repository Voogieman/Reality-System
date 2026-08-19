import { useState } from 'react';
import { getGodImageByGod, hasDedicatedGodImage } from '../../data/god-images';
import { getGodVoice } from '../../data/god-voices';
import { DEFAULT_GOD, SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { GodCard } from '../gods/GodCard';
import { GodSymbol } from '../gods/GodSymbol';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './GodsGallery.css';

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
};

export function GodsGallery({ selectedGod, onSelectGod }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = SLAVIC_GODS.filter((g) => {
    const term = filter.toLowerCase();
    const voice = getGodVoice(g);
    return (
      g.name.toLowerCase().includes(term) ||
      g.domain.toLowerCase().includes(term) ||
      voice.when.toLowerCase().includes(term)
    );
  });

  return (
    <Section
      id="gods"
      title="Голоса пантеона"
      subtitle="Выбери голос под свою ситуацию — затем услышь его"
      divider="ᛉ ◆ ᛉ"
    >
      <div className="gods-toolbar panel-glass">
        <input
          type="search"
          className="gods-search"
          placeholder="Искать по имени или сфере..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onSelectGod(DEFAULT_GOD)}
        >
          Голос Велеса
        </button>
      </div>
      <div className="gods-grid">
        {filtered.map((god) => (
          <GodCard
            key={god.id}
            god={god}
            selected={selectedGod.id === god.id}
            onSelect={onSelectGod}
          />
        ))}
      </div>
      {selectedGod ? (
        <article className="god-detail panel-glass">
          {hasDedicatedGodImage(selectedGod) ? (
            <img
              src={getGodImageByGod(selectedGod)}
              alt={selectedGod.name}
              className="god-detail-image"
            />
          ) : (
            <span className="god-detail-image god-detail-image--symbol">
              <GodSymbol god={selectedGod} size={56} active />
            </span>
          )}
          <div>
            <h3>{selectedGod.name}</h3>
            <p className="god-detail-desc">{getGodVoice(selectedGod).when}</p>
            <p>{selectedGod.description}</p>
            <p>
              <strong>Подношения:</strong> {selectedGod.offerings.join(', ')}
            </p>
            <p>
              <strong>Символы:</strong> {selectedGod.symbols.join(', ')} · <strong>Миры:</strong>{' '}
              {selectedGod.realms.join(', ')}
            </p>
          </div>
        </article>
      ) : null}
    </Section>
  );
}
