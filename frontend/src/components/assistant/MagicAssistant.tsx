import { useEffect, useRef, useState } from 'react';
import { getGodById } from '../../data/gods';
import type { SlavicGod } from '../../data/gods';
import {
  getWandererCategory,
  getWandererSituation,
  markWelcomeSeen,
  readWandererProfile,
  WANDERER_CATEGORIES,
  WANDERER_TONES,
  writeWandererProfile,
  type CommunicationTone,
} from '../../data/wanderer';
import { useLanding } from '../../landing/LandingContext';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { realityApi } from '../../lib/api/reality.api';
import { MicIcon } from '../ui/MicIcon';
import './MagicAssistant.css';

type Step = 'welcome' | 'tutorial' | 'identify' | 'tone' | 'match';
type Mode = 'self' | 'categories';

type Props = {
  onSelectGod: (god: SlavicGod) => void;
};

export function MagicAssistant({ onSelectGod }: Props) {
  const { assistantOpen, closeAssistant } = useLanding();
  const saved = readWandererProfile();
  const [step, setStep] = useState<Step>('welcome');
  const [fromMenu, setFromMenu] = useState(false);
  const [mode, setMode] = useState<Mode>('self');
  const [ownText, setOwnText] = useState(saved?.need ?? saved?.situation ?? '');
  const savedSituation = getWandererSituation(
    (saved?.situation ?? '').split(',')[0]?.trim() ?? '',
  );
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [situationId, setSituationId] = useState<string | null>(savedSituation?.id ?? null);
  const [tone, setTone] = useState<CommunicationTone>(saved?.tone ?? 'images');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState(saved?.matchReason ?? '');
  const [godId, setGodId] = useState(saved?.preferredGodId ?? '');
  const speech = useSpeechToText((text) => {
    setOwnText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  });
  const loadOpen = useRef(true);

  useEffect(() => {
    if (!assistantOpen) {
      loadOpen.current = false;
      return;
    }
    if (loadOpen.current) {
      setFromMenu(false);
      setStep('welcome');
      return;
    }
    setFromMenu(true);
    setStep((current) => (current === 'welcome' || current === 'tutorial' ? 'identify' : current));
  }, [assistantOpen]);

  const canMatchWords = ownText.trim().length >= 2;
  const selectedCategory = categoryId ? getWandererCategory(categoryId) : undefined;
  const selectedSituation = situationId ? getWandererSituation(situationId) : undefined;
  const canMatchCategory = Boolean(selectedSituation);

  if (!assistantOpen) return null;

  const goBack = () => {
    if (step === 'match') {
      setStep(mode === 'categories' ? 'tone' : 'identify');
      return;
    }
    if (step === 'tone') {
      setStep('identify');
      return;
    }
    if (step === 'identify' && mode === 'categories' && categoryId) {
      setCategoryId(null);
      return;
    }
    if (step === 'identify') {
      if (fromMenu) {
        closeAssistant();
        return;
      }
      setStep('tutorial');
      return;
    }
    if (step === 'tutorial') {
      setStep('welcome');
      return;
    }
    markWelcomeSeen();
    closeAssistant();
  };

  const runMatch = async () => {
    const situation = mode === 'categories' ? selectedSituation?.id ?? '' : ownText.trim();
    const need = mode === 'categories' ? selectedSituation?.label ?? '' : ownText.trim();
    if (mode === 'self' && need.length < 2) return;
    if (mode === 'categories' && !selectedSituation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await realityApi.matchGod({ situation, need, tone });
      const data = response.data as { godId?: string; reason?: string } | undefined;
      const matchedId = data?.godId ?? 'veles';
      const god = getGodById(matchedId);
      if (god) onSelectGod(god);
      setGodId(matchedId);
      setReason(data?.reason ?? '');
      writeWandererProfile({
        situation,
        tone,
        need,
        preferredGodId: matchedId,
        matchReason: data?.reason,
      });
      markWelcomeSeen();
      setStep('match');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Оракул молчит. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const matchedGod = getGodById(godId);

  return (
    <div className="assistant-overlay" role="dialog" aria-modal="true" aria-label="Волшебный ассистент">
      <button type="button" className="assistant-backdrop" onClick={goBack} aria-label="Назад" />
      <div className="assistant-panel panel-glass">
        <div className="assistant-head">
          <button type="button" className="assistant-back" onClick={goBack}>
            ← Назад
          </button>
          <p className="assistant-kicker">Волшебный ассистент</p>
          <button
            type="button"
            className="assistant-close"
            onClick={() => {
              markWelcomeSeen();
              closeAssistant();
            }}
          >
            ×
          </button>
        </div>

        {step === 'welcome' ? (
          <div className="assistant-body">
            <p className="assistant-epigraph">Первое слово круга</p>
            <h2>Дорогой странник, добро пожаловать</h2>
            <p>
              Краткий путь — через волшебного ассистента. Можно сказать своими словами и голосом
              или выбрать категорию и жизненную ситуацию.
            </p>
            <div className="assistant-actions">
              <button type="button" className="btn-primary" onClick={() => setStep('tutorial')}>
                Через ассистента
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  markWelcomeSeen();
                  closeAssistant();
                }}
              >
                Войти самому
              </button>
            </div>
          </div>
        ) : null}

        {step === 'tutorial' ? (
          <div className="assistant-body">
            <h2>Как это работает</h2>
            <ol className="assistant-steps">
              <li>Выбери путь: своими словами и микрофоном или категорию и ситуацию.</li>
              <li>Ассистент подберёт голос.</li>
              <li>Задай вопрос оракулу и услышь его.</li>
            </ol>
            <div className="assistant-actions">
              <button type="button" className="btn-primary" onClick={() => setStep('identify')}>
                Дальше
              </button>
            </div>
          </div>
        ) : null}

        {step === 'identify' ? (
          <div className="assistant-body">
            <h2>Определитель божества</h2>
            <p>Два пути: скажи сам или выбери категорию и ситуацию.</p>
            <div className="assistant-modes" role="tablist">
              <button
                type="button"
                className={`assistant-mode${mode === 'self' ? ' is-active' : ''}`}
                onClick={() => setMode('self')}
              >
                Выбрать самому
              </button>
              <button
                type="button"
                className={`assistant-mode${mode === 'categories' ? ' is-active' : ''}`}
                onClick={() => {
                  setMode('categories');
                  setCategoryId(null);
                }}
              >
                Категории
              </button>
            </div>

            {mode === 'self' ? (
              <div className="form-group">
                <div className="assistant-input-row">
                  <textarea
                    id="assistantOwnText"
                    value={ownText}
                    onChange={(e) => setOwnText(e.target.value)}
                    rows={4}
                    placeholder="Где застрял, чего боишься, чего ждёшь..."
                    aria-label="Своими словами"
                  />
                  {speech.supported ? (
                    <button
                      type="button"
                      className={`assistant-mic${speech.listening ? ' is-on' : ''}`}
                      onClick={speech.toggle}
                      aria-pressed={speech.listening}
                      aria-label={speech.listening ? 'Остановить запись' : 'Говорить'}
                    >
                      <MicIcon listening={speech.listening} />
                    </button>
                  ) : null}
                </div>
              </div>
            ) : !selectedCategory ? (
              <div className="assistant-options">
                {WANDERER_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="assistant-option"
                    onClick={() => {
                      setCategoryId(category.id);
                      setSituationId(null);
                    }}
                  >
                    <strong>{category.label}</strong>
                    <span>{category.hint}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="assistant-options">
                <p className="assistant-category-title">{selectedCategory.label}</p>
                {selectedCategory.situations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`assistant-option${situationId === item.id ? ' is-active' : ''}`}
                    onClick={() => setSituationId(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {error && mode === 'self' ? <p className="assistant-error">{error}</p> : null}
            <div className="assistant-actions">
              {mode === 'self' ? (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={loading || !canMatchWords}
                  onClick={() => void runMatch()}
                >
                  {loading ? 'Слушаю...' : 'К голосу'}
                </button>
              ) : selectedCategory ? (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!canMatchCategory}
                  onClick={() => setStep('tone')}
                >
                  Дальше
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 'tone' ? (
          <div className="assistant-body">
            <h2>Как с тобой говорить?</h2>
            <p>Под каждого странника — своя форма общения.</p>
            <div className="assistant-options">
              {WANDERER_TONES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`assistant-option${tone === item.id ? ' is-active' : ''}`}
                  onClick={() => setTone(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
            {error ? <p className="assistant-error">{error}</p> : null}
            <div className="assistant-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={loading || !canMatchCategory}
                onClick={() => void runMatch()}
              >
                {loading ? 'Слушаю...' : 'К голосу'}
              </button>
            </div>
          </div>
        ) : null}

        {step === 'match' ? (
          <div className="assistant-body">
            <h2>{matchedGod ? `Голос ${matchedGod.name}` : 'Голос найден'}</h2>
            <p>{reason || 'Этот голос ближе к твоей ситуации.'}</p>
            <div className="assistant-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  closeAssistant();
                  document.getElementById('oracle')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                К оракулу
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
