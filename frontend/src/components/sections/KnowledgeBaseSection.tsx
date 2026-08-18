import { type MouseEvent, useMemo, useState } from 'react';
import { getGodLore } from '../../data/god-knowledge';
import { getGodImageByGod } from '../../data/god-images';
import { SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { Modal } from '../ui/Modal';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './KnowledgeBaseSection.css';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 5H6.2A2.2 2.2 0 0 0 4 7.2v9.6A2.2 2.2 0 0 0 6.2 19h9.6A2.2 2.2 0 0 0 18 16.8V15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M11 13 20 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 4h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GodKnowledgeArticle({ god }: { god: SlavicGod }) {
  const lore = getGodLore(god.id, god.description);

  return (
    <article className="knowledge-article">
      <header className="knowledge-article-head">
        <img src={getGodImageByGod(god)} alt={god.name} className="knowledge-article-image" />
        <div>
          <p className="knowledge-title-overline">{god.title}</p>
          <h3>{god.name}</h3>
          <p className="knowledge-domain">{god.domain}</p>
          <p className="knowledge-epithet">{lore.epithet}</p>
        </div>
      </header>

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
}

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
  sectionId?: string;
};

export function KnowledgeBaseSection({ selectedGod, onSelectGod, sectionId }: Props) {
  const [search, setSearch] = useState('');
  const [openGodId, setOpenGodId] = useState<string | null>(null);
  const [previewGodId, setPreviewGodId] = useState<string | null>(null);

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

  const openGod = openGodId ? (SLAVIC_GODS.find((god) => god.id === openGodId) ?? null) : null;
  const previewGod = previewGodId ? (SLAVIC_GODS.find((god) => god.id === previewGodId) ?? null) : null;

  const selectGod = (god: SlavicGod) => {
    onSelectGod(god);
  };

  const openCard = (god: SlavicGod) => {
    selectGod(god);
    setPreviewGodId(null);
    setOpenGodId(god.id);
  };

  const previewCard = (event: MouseEvent, god: SlavicGod) => {
    event.stopPropagation();
    selectGod(god);
    setPreviewGodId(god.id);
  };

  return (
    <Section
      id={sectionId}
      className="knowledge-section"
      title="База знаний"
      subtitle="Компактные карточки пантеона — откройте карточку или посмотрите быстрый обзор"
      divider="☽ ᛉ ☾"
    >
      {openGod ? (
        <div className="knowledge-open">
          <button type="button" className="knowledge-back" onClick={() => setOpenGodId(null)}>
            ← К карточкам
          </button>
          <GodKnowledgeArticle god={openGod} />
        </div>
      ) : (
        <>
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
              {filteredGods.map((god) => (
                <article
                  key={god.id}
                  className={`knowledge-card panel-glass${selectedGod.id === god.id ? ' is-active' : ''}`}
                >
                  <button type="button" className="knowledge-card-main" onClick={() => openCard(god)}>
                    <img src={getGodImageByGod(god)} alt={god.name} className="knowledge-card-image" loading="lazy" />
                    <div className="knowledge-card-body">
                      <p className="knowledge-title-overline">{god.title}</p>
                      <h3>{god.name}</h3>
                      <p className="knowledge-domain">{god.domain}</p>
                      <p className="knowledge-card-summary">{god.description}</p>
                    </div>
                  </button>
                  <div className="knowledge-card-actions">
                    <button
                      type="button"
                      className="knowledge-icon-btn"
                      title="Быстрый просмотр"
                      aria-label={`Быстрый просмотр: ${god.name}`}
                      onClick={(event) => previewCard(event, god)}
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      className="knowledge-icon-btn"
                      title="Открыть карточку"
                      aria-label={`Открыть карточку: ${god.name}`}
                      onClick={() => openCard(god)}
                    >
                      <OpenIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={Boolean(previewGod)}
        title={previewGod ? previewGod.name : 'Быстрый просмотр'}
        onClose={() => setPreviewGodId(null)}
        closeText="Закрыть"
        className="knowledge-preview-modal"
      >
        {previewGod ? <GodKnowledgeArticle god={previewGod} /> : null}
      </Modal>
    </Section>
  );
}
