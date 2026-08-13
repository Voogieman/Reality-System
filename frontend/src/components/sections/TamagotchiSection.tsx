import { type FormEvent, useEffect, useState } from 'react';
import {
  ageLabel,
  cleanTamagotchi,
  createTamagotchi,
  feedTamagotchi,
  hatchTamagotchi,
  loadTamagotchi,
  moodLabel,
  playTamagotchi,
  saveTamagotchi,
  tickTamagotchi,
  toggleSleepTamagotchi,
  type TamagotchiState,
} from '../../lib/tamagotchi/state';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './TamagotchiSection.css';

const RANKING = [
  { name: 'СВЕТА', score: 9840, you: true },
  { name: 'ВУГАР', score: 9120, you: false },
  { name: 'ОЛЬГА', score: 8740, you: false },
  { name: 'ДМИТРИЙ МОЗГ', score: 8310, you: false },
  { name: 'ДМИТРИЙ ИВАНОВ', score: 7980, you: false },
  { name: 'ИВАН', score: 7650, you: false },
  { name: 'БОГДАН', score: 7210, you: false },
  { name: 'ВАХИД', score: 6840, you: false },
  { name: 'МАРИЯ', score: 6420, you: false },
  { name: 'СЕРГЕЙ', score: 5990, you: false },
] as const;

export function TamagotchiSection() {
  const [pet, setPet] = useState<TamagotchiState>(() => loadTamagotchi());
  const [nameDraft, setNameDraft] = useState(pet.name);

  useEffect(() => {
    saveTamagotchi(pet);
  }, [pet]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPet((prev) => tickTamagotchi(prev));
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const alive = pet.stage === 'spirit' || pet.stage === 'guardian';
  const status = moodLabel(pet);

  const update = (next: TamagotchiState) => {
    setPet(tickTamagotchi(next));
  };

  const handleRename = (event: FormEvent) => {
    event.preventDefault();
    const name = nameDraft.trim() || pet.name;
    setNameDraft(name);
    setPet((prev) => ({ ...prev, name }));
  };

  return (
    <Section
      id="tamagotchi"
      title="Тамагочи"
      subtitle="Вырасти домового: корми, играй, очищай и не оставляй без тепла"
      divider="ᛉ ◆ ᛉ"
    >
      <div className="tama-layout">
      <div className="tama-shell panel-glass">
        <div className={`tama-device tama-device--${pet.stage}${pet.sleeping ? ' tama-device--sleep' : ''}`}>
          <p className="tama-brand">Велес · дух</p>
          <div className="tama-screen" aria-live="polite">
            <Creature stage={pet.stage} sleeping={pet.sleeping} mood={pet.mood} hunger={pet.hunger} />
            <p className="tama-name">{pet.name}</p>
            <p className="tama-status">
              {status} · {ageLabel(pet)}
            </p>
          </div>
          <div className="tama-meters">
            <Meter label="Сытость" value={pet.hunger} />
            <Meter label="Настроение" value={pet.mood} />
            <Meter label="Сила" value={pet.energy} />
            <Meter label="Чистота" value={pet.hygiene} />
            <Meter label="Здоровье" value={pet.health} />
          </div>
        </div>

        <div className="tama-panel">
          {pet.stage === 'egg' ? (
            <p className="tama-hint">Яйцо домового ждёт. Согрей его — и хранитель проснётся.</p>
          ) : null}
          {pet.stage === 'gone' ? (
            <p className="tama-hint">Дух ушёл в Навь. Можно призвать нового хранителя.</p>
          ) : null}
          {alive ? (
            <form className="tama-name-form" onSubmit={handleRename}>
              <label htmlFor="tamaName">Имя духа</label>
              <div className="tama-name-row">
                <input
                  id="tamaName"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  maxLength={18}
                />
                <button type="submit" className="btn-secondary">
                  Наречь
                </button>
              </div>
            </form>
          ) : null}

          <div className="tama-actions">
            {pet.stage === 'egg' ? (
              <button type="button" className="btn-primary" onClick={() => update(hatchTamagotchi(pet))}>
                Согреть яйцо
              </button>
            ) : null}
            {alive ? (
              <>
                <button type="button" className="btn-primary" onClick={() => update(feedTamagotchi(pet))}>
                  Кормить
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={pet.energy < 12}
                  onClick={() => update(playTamagotchi(pet))}
                >
                  Играть
                </button>
                <button type="button" className="btn-secondary" onClick={() => update(cleanTamagotchi(pet))}>
                  Очистить
                </button>
                <button type="button" className="btn-secondary" onClick={() => update(toggleSleepTamagotchi(pet))}>
                  {pet.sleeping ? 'Разбудить' : 'Уложить спать'}
                </button>
              </>
            ) : null}
            {pet.stage === 'gone' ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const next = createTamagotchi(nameDraft);
                  setNameDraft(next.name);
                  setPet(next);
                }}
              >
                Новый дух
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="tama-rating panel-glass" aria-label="Топ 10 игроков">
        <p className="tama-rating-title">Топ 10 игроков</p>
        <table className="tama-rating-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Игрок</th>
              <th>Очки</th>
            </tr>
          </thead>
          <tbody>
            {RANKING.map((row, index) => (
              <tr key={`${row.name}-${index}`} className={row.you ? 'tama-rating-you' : undefined}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.score.toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
      </div>
    </Section>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="tama-meter">
      <span>{label}</span>
      <div className="tama-meter-track" aria-hidden="true">
        <div className="tama-meter-fill" style={{ width: `${value}%` }} />
      </div>
      <b>{value}</b>
    </div>
  );
}

function Creature({
  stage,
  sleeping,
  mood,
  hunger,
}: {
  stage: TamagotchiState['stage'];
  sleeping: boolean;
  mood: number;
  hunger: number;
}) {
  if (stage === 'egg') {
    return (
      <svg className="tama-sprite tama-sprite--egg" viewBox="0 0 120 120" aria-hidden="true">
        <ellipse cx="60" cy="98" rx="22" ry="5" fill="rgba(0,0,0,0.22)" />
        <g className="tama-egg">
          <ellipse cx="60" cy="62" rx="24" ry="32" fill="#f7f4ea" stroke="#e8d9a8" strokeWidth="2.2" />
          <ellipse cx="52" cy="52" rx="8" ry="12" fill="#ffffff" opacity="0.7" />
          <path d="M48 50 Q60 38 72 54" fill="none" stroke="#c9a227" strokeWidth="1.4" opacity="0.7" />
          <circle cx="60" cy="64" r="3" fill="#fff" className="tama-egg-pulse" />
        </g>
      </svg>
    );
  }

  if (stage === 'gone') {
    return (
      <svg className="tama-sprite tama-sprite--gone" viewBox="0 0 120 120" aria-hidden="true">
        <ellipse cx="60" cy="98" rx="20" ry="5" fill="rgba(0,0,0,0.16)" />
        <circle className="tama-ghost" cx="60" cy="56" r="18" fill="#f7f4ea" opacity="0.28" />
      </svg>
    );
  }

  const grown = stage === 'guardian';
  const happy = mood > 70 && hunger > 50;
  const sad = mood < 30 || hunger < 22;

  return (
    <svg
      className={`tama-sprite tama-sprite--spirit${sleeping ? ' tama-sprite--sleep' : ''}${grown ? ' tama-sprite--grown' : ''}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spiritBody" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f4f0e2" />
          <stop offset="100%" stopColor="#d8d0bc" />
        </linearGradient>
      </defs>
      <ellipse cx="58" cy="104" rx="22" ry="5" fill="rgba(0,0,0,0.22)" className="tama-shadow" />
      <g className="tama-spirit">
        <path className="tama-arm tama-arm--left" d="M38 64 C24 70 22 82 28 88" fill="none" stroke="#f0e6d3" strokeWidth="5" strokeLinecap="round" />
        <path className="tama-arm tama-arm--right" d="M78 64 C92 70 94 82 88 88" fill="none" stroke="#f0e6d3" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="48" cy="92" rx="7" ry="4" fill="#e8d9a8" />
        <ellipse cx="68" cy="92" rx="7" ry="4" fill="#e8d9a8" />
        <ellipse cx="58" cy="72" rx={grown ? 24 : 20} ry={grown ? 26 : 22} fill="url(#spiritBody)" stroke="#c9a227" strokeWidth="1.6" />
        <ellipse cx="58" cy="78" rx="11" ry="13" fill="#fff" opacity="0.7" />
        <circle cx="58" cy="46" r={grown ? 18 : 15} fill="url(#spiritBody)" stroke="#c9a227" strokeWidth="1.6" />
        {grown ? <ellipse cx="58" cy="30" rx="12" ry="4" fill="none" stroke="#e8b923" strokeWidth="1.5" /> : null}
        {sleeping ? (
          <>
            <path d="M50 46 Q54 44 58 46" fill="none" stroke="#3a4a58" strokeWidth="1.8" />
            <path d="M62 46 Q66 44 70 46" fill="none" stroke="#3a4a58" strokeWidth="1.8" />
            <text className="tama-zzz" x="84" y="30" fill="#c9a227" fontSize="10">
              z
            </text>
          </>
        ) : (
          <>
            <g className="tama-eyes">
              <ellipse cx="52" cy="46" rx="4.2" ry="5" fill="#fff" />
              <ellipse cx="66" cy="46" rx="4.2" ry="5" fill="#fff" />
              <circle cx="52.5" cy="47" r="2.1" fill="#3a4a58" />
              <circle cx="66.5" cy="47" r="2.1" fill="#3a4a58" />
              <circle cx="53.4" cy="45.6" r="0.7" fill="#fff" />
              <circle cx="67.4" cy="45.6" r="0.7" fill="#fff" />
            </g>
            <path
              d={happy ? 'M52 56 Q58 62 64 56' : sad ? 'M52 60 Q58 54 64 60' : 'M53 57 Q58 60 63 57'}
              fill="none"
              stroke="#3a4a58"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    </svg>
  );
}
