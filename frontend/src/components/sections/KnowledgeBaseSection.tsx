import { useEffect, useMemo, useState } from 'react';
import { getGodImageByGod } from '../../data/god-images';
import { DEFAULT_GOD, SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './KnowledgeBaseSection.css';

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
};

export function KnowledgeBaseSection({ selectedGod, onSelectGod }: Props) {
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
        return (
          god.name.toLowerCase().includes(term) ||
          god.title.toLowerCase().includes(term) ||
          god.domain.toLowerCase().includes(term)
        );
      }),
    [search],
  );

  const activeGod =
    filteredGods.find((god) => god.id === activeGodId) ??
    SLAVIC_GODS.find((god) => god.id === activeGodId) ??
    DEFAULT_GOD;

  return (
    <Section
      id="knowledge-base"
      className="knowledge-section"
      title="База знаний"
      subtitle="Энциклопедия славянского пантеона в формате карточек"
      divider="☽ ᛉ ☾"
    >
      <div className="knowledge-toolbar panel-glass">
        <input
          type="search"
          className="knowledge-search"
          placeholder="Поиск по имени, титулу или сфере..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="knowledge-layout">
        <aside className="knowledge-list panel-glass">
          {filteredGods.map((god) => {
            const image = getGodImageByGod(god);
            const active = god.id === activeGod.id;
            return (
              <button
                key={god.id}
                type="button"
                className={`knowledge-card ${active ? 'active' : ''}`}
                onClick={() => {
                  setActiveGodId(god.id);
                  onSelectGod(god);
                }}
              >
                <img src={image} alt={god.name} className="knowledge-card-image" loading="lazy" />
                <div className="knowledge-card-content">
                  <h3>{god.name}</h3>
                  <p>{god.title}</p>
                  <span>{god.domain}</span>
                </div>
              </button>
            );
          })}
        </aside>

        <article className="knowledge-article panel-glass">
          <header className="knowledge-article-head">
            <img src={getGodImageByGod(activeGod)} alt={activeGod.name} className="knowledge-hero-image" />
            <div>
              <p className="knowledge-title-overline">{activeGod.title}</p>
              <h3>{activeGod.name}</h3>
              <p className="knowledge-domain">{activeGod.domain}</p>
            </div>
          </header>

          <div className="knowledge-infobox">
            <div className="knowledge-row">
              <dt>Стихия</dt>
              <dd>{activeGod.element}</dd>
            </div>
            <div className="knowledge-row">
              <dt>Миры</dt>
              <dd>{activeGod.realms.join(', ')}</dd>
            </div>
            <div className="knowledge-row">
              <dt>Символы</dt>
              <dd>{activeGod.symbols.join(', ')}</dd>
            </div>
            <div className="knowledge-row">
              <dt>Подношения</dt>
              <dd>{activeGod.offerings.join(', ')}</dd>
            </div>
          </div>

          <section className="knowledge-lore">
            <h4>Краткое описание</h4>
            <p>{activeGod.description}</p>
          </section>
        </article>
      </div>
    </Section>
  );
}

