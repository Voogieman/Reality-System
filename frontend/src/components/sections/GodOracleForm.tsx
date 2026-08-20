import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getGodVoice, godVoiceTitle } from '../../data/god-voices';
import type { SlavicGod } from '../../data/gods';
import { readWandererProfile } from '../../data/wanderer';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useLanding } from '../../landing/LandingContext';
import { realityApi } from '../../lib/api/reality.api';
import { FormResultBox } from '../ui/FormResult';
import { MicIcon } from '../ui/MicIcon';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './GodOracleForm.css';

const ORACLE_LIMIT = 6;
const ORACLE_COUNT_KEY = 'veles-oracle-answers';

const EMOTIONS: { id: string; label: string }[] = [
  { id: 'lighter', label: 'Стало легче' },
  { id: 'held', label: 'Появилась опора' },
  { id: 'still-heavy', label: 'Всё ещё тяжело' },
  { id: 'need-more', label: 'Нужно ещё слово' },
];

function readOracleCount(): number {
  try {
    const raw = Number(localStorage.getItem(ORACLE_COUNT_KEY));
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  } catch {
    return 0;
  }
}

function writeOracleCount(count: number): void {
  try {
    localStorage.setItem(ORACLE_COUNT_KEY, String(count));
  } catch {
    /* ignore quota / private mode */
  }
}

type Phase = 'ask' | 'answer' | 'emotion' | 'closed';

type Props = {
  selectedGod: SlavicGod;
};

export function GodOracleForm({ selectedGod }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { openSection, openAssistant } = useLanding();
  const voice = getGodVoice(selectedGod);
  const profile = readWandererProfile();
  const [intention, setIntention] = useState(voice.prompt);
  const [answerCount, setAnswerCount] = useState(readOracleCount);
  const [phase, setPhase] = useState<Phase>('ask');
  const [prophecy, setProphecy] = useState('');
  const [messageId, setMessageId] = useState('');
  const [sessionId] = useState(() => `sess_oracle_${Date.now()}`);
  const [emotion, setEmotion] = useState('lighter');
  const { loading, result, submit, setResult } = useFormSubmit();
  const speech = useSpeechToText((text) => {
    setIntention((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  });

  useEffect(() => {
    setIntention(getGodVoice(selectedGod).prompt);
    setPhase('ask');
    setResult(null);
  }, [selectedGod.id, setResult]);

  const goBack = () => {
    if (phase === 'emotion') setPhase('answer');
    else if (phase === 'answer' || phase === 'closed') setPhase('ask');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (readOracleCount() >= ORACLE_LIMIT) {
      window.alert('оплатите тариф');
      setAnswerCount(ORACLE_LIMIT);
      return;
    }

    void submit(
      async () => {
        const response = await realityApi.askOracle({
          godName: selectedGod.apiGodName,
          intention,
          userId: user?.id,
          communicationStyle: profile?.tone,
          situationNeed: profile?.situation,
          sessionId,
        });
        const data = response.data as {
          oracle?: { prophecy?: string; messageId?: string };
        } | undefined;
        const nextProphecy = data?.oracle?.prophecy ?? '';
        const nextCount = readOracleCount() + 1;
        writeOracleCount(nextCount);
        setAnswerCount(nextCount);
        setProphecy(nextProphecy);
        setMessageId(data?.oracle?.messageId ?? '');
        setPhase('answer');
        return {
          ...response,
          message: nextProphecy
            ? `— ${selectedGod.name} говорит —\n\n${nextProphecy}`
            : (response.message ?? `${selectedGod.name} ответил.`),
        };
      },
      { successFallback: 'Знамение получено.' },
    );
  };

  const closeSession = async () => {
    if (messageId) {
      try {
        await realityApi.oracleFeedback({ messageId, emotion });
      } catch {
        /* guest without saved message is fine */
      }
    }
    setPhase('closed');
  };

  return (
    <Section
      id="oracle"
      title={godVoiceTitle(selectedGod)}
      subtitle={voice.promise}
      divider="☽ ᛉ ☾"
    >
      <form className="oracle-form panel-glass" onSubmit={handleSubmit}>
        {phase !== 'ask' ? (
          <button type="button" className="oracle-back" onClick={goBack}>
            ← Назад
          </button>
        ) : null}

        <div className="form-group">
          <label htmlFor="oracleGod">Голос</label>
          <input id="oracleGod" value={`${selectedGod.name} — ${voice.when}`} readOnly />
        </div>
        {isAuthenticated && user ? (
          <p className="oracle-auth-hint">Разговор запишется для {user.displayName}.</p>
        ) : (
          <p className="oracle-auth-hint">
            Можно услышать сразу. Чтобы сохранить диалог,{' '}
            <button type="button" className="oracle-auth-link" onClick={() => openSection('auth')}>
              войдите или зарегистрируйтесь
            </button>
            .
          </p>
        )}
        <p className="oracle-auth-hint">
          Не знаешь, чей голос нужен?{' '}
          <button type="button" className="oracle-auth-link" onClick={openAssistant}>
            Определитель божества
          </button>
        </p>

        {phase === 'ask' ? (
          <>
            <div className="form-group">
              <label htmlFor="oracleQuestion">Вопрос</label>
              <div className="oracle-question-row">
                <textarea
                  id="oracleQuestion"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  rows={4}
                  required
                />
                {speech.supported ? (
                  <button
                    type="button"
                    className={`oracle-mic${speech.listening ? ' is-on' : ''}`}
                    onClick={speech.toggle}
                    aria-pressed={speech.listening}
                    aria-label={speech.listening ? 'Остановить запись' : 'Говорить'}
                  >
                    <MicIcon listening={speech.listening} />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Слушаю знамения...' : godVoiceTitle(selectedGod)}
              </button>
            </div>
            <p className="oracle-auth-hint">
              Бесплатно: {Math.min(answerCount, ORACLE_LIMIT)} из {ORACLE_LIMIT} ответов.
            </p>
          </>
        ) : null}

        {phase === 'answer' || phase === 'emotion' || phase === 'closed' ? (
          <FormResultBox
            result={result ?? (prophecy ? { type: 'success', text: prophecy } : null)}
          />
        ) : null}

        {phase === 'answer' ? (
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={() => setPhase('emotion')}>
              Завершить сессию
            </button>
          </div>
        ) : null}

        {phase === 'emotion' ? (
          <div className="oracle-emotion">
            <p>Как после разговора — какой отклик остался?</p>
            <div className="oracle-emotion-list">
              {EMOTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`oracle-emotion-btn${emotion === item.id ? ' is-active' : ''}`}
                  onClick={() => setEmotion(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn-primary" onClick={() => void closeSession()}>
              Оставить отклик
            </button>
          </div>
        ) : null}

        {phase === 'closed' ? (
          <p className="oracle-auth-hint">
            Сессия закрыта. Если ты в круге, уведомление уйдёт на почту
            {isAuthenticated ? ' и в Telegram, если бот привязан' : ''}.
          </p>
        ) : null}
      </form>
    </Section>
  );
}
