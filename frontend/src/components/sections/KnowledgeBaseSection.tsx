import { useEffect, useMemo, useState } from 'react';
import { getGodLore } from '../../data/god-knowledge';
import { getGodImageByGod } from '../../data/god-images';
import { DEFAULT_GOD, SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './KnowledgeBaseSection.css';

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
  sectionId?: string;
};

export function KnowledgeBaseSection({ selectedGod, onSelectGod, sectionId }: Props) {
  const [search, setSearch] = useState('');
  const [activeGodId, setActiveGodId] = useState(selectedGod.id || DEFAULT_GOD.id);

  useEffect(() => {
    setActiveGodId(selectedGod.id);
  }, [selectedGod.id]);

  const filteredGods = useMemo(
    () =>
      SLAVIC_GODS.filter((god) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        const lore = getGodLore(god.id, god.description);
        return (
          god.name.toLowerCase().includes(term) ||
          god.title.toLowerCase().includes(term) ||
          god.domain.toLowerCase().includes(term) ||
          lore.epithet.toLowerCase().includes(term) ||
          lore.lore.some((paragraph) => paragraph.toLowerCase().includes(term))
        );
      }),
    [search],
  );

  return (
    <Section
      id={sectionId}
      className="knowledge-section"
      title="База знаний"
      subtitle="Карточки пантеона с каноном, образами и подробным описанием каждого божества"
      divider="☽ ᛉ ☾"
    >
      <div className="knowledge-toolbar panel-glass">
        <input
          type="search"
          className="knowledge-search"
          placeholder="Поиск по имени, титулу, сфере или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredGods.length === 0 ? (
        <p className="knowledge-empty">По этому запросу божества не найдены.</p>
      ) : (
        <div className="knowledge-grid">
          {filteredGods.map((god) => {
            const lore = getGodLore(god.id, god.description);
            const active = god.id === activeGodId;
            return (
              <article key={god.id} className={`knowledge-detail-card panel-glass${active ? ' is-active' : ''}`}>
                <button
                  type="button"
                  className="knowledge-detail-head"
                  onClick={() => {
                    setActiveGodId(god.id);
                    onSelectGod(god);
                  }}
                >
                  <img src={getGodImageByGod(god)} alt={god.name} className="knowledge-detail-image" loading="lazy" />
                  <div>
                    <p className="knowledge-title-overline">{god.title}</p>
                    <h3>{god.name}</h3>
                    <p className="knowledge-domain">{god.domain}</p>
                  </div>
                </button>

                <p className="knowledge-epithet">{lore.epithet}</p>

                <section className="knowledge-lore">
                  <h4>Канон и описание</h4>
                  {lore.lore.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>

                {lore.imagery.length > 0 ? (
                  <section className="knowledge-imagery">
                    <h4>Священные образы</h4>
                    <ul>
                      {lore.imagery.map((image) => (
                        <li key={image}>{image}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <dl className="knowledge-infobox">
                  <div className="knowledge-row">
                    <dt>Стихия</dt>
                    <dd>{god.element}</dd>
                  </div>
                  <div className="knowledge-row">
                    <dt>Миры</dt>
                    <dd>{god.realms.join(', ')}</dd>
                  </div>
                  <div className="knowledge-row">
                    <dt>Символы</dt>
                    <dd>{god.symbols.join(', ')}</dd>
                  </div>
                  <div className="knowledge-row">
                    <dt>Подношения</dt>
                    <dd>{god.offerings.join(', ')}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
