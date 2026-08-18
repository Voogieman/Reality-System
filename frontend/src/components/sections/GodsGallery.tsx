import { useState } from 'react';
import { DEFAULT_GOD, SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { GodCard } from '../gods/GodCard';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './GodsGallery.css';

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
};

export function GodsGallery({ selectedGod, onSelectGod }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = SLAVIC_GODS.filter(
    (g) =>
      g.name.toLowerCase().includes(filter.toLowerCase()) ||
      g.domain.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Section
      id="gods"
      title="Пантеон"
      subtitle="Выбери божество — образ на фоне сменится"
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
          Велес по умолчанию
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
      {selectedGod && (
        <article className="god-detail panel-glass">
          <h3>{selectedGod.name}</h3>
          <p className="god-detail-desc">{selectedGod.description}</p>
          <p>
            <strong>Подношения:</strong> {selectedGod.offerings.join(', ')}
          </p>
          <p>
            <strong>Символы:</strong> {selectedGod.symbols.join(', ')} · <strong>Миры:</strong>{' '}
            {selectedGod.realms.join(', ')}
          </p>
        </article>
      )}
    </Section>
  );
}
