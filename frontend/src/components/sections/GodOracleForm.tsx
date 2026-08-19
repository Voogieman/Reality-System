import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getGodVoice, godVoiceTitle } from '../../data/god-voices';
import type { SlavicGod } from '../../data/gods';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { useLanding } from '../../landing/LandingContext';
import { realityApi } from '../../lib/api/reality.api';
import { FormResultBox } from '../ui/FormResult';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './GodOracleForm.css';

const ORACLE_LIMIT = 6;
const ORACLE_COUNT_KEY = 'veles-oracle-answers';

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

type Props = {
  selectedGod: SlavicGod;
};

export function GodOracleForm({ selectedGod }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { openSection } = useLanding();
  const voice = getGodVoice(selectedGod);
  const [intention, setIntention] = useState(voice.prompt);
  const [answerCount, setAnswerCount] = useState(readOracleCount);
  const { loading, result, submit } = useFormSubmit();

  useEffect(() => {
    setIntention(getGodVoice(selectedGod).prompt);
  }, [selectedGod.id]);

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
        });
        const data = response.data as { oracle?: { prophecy?: string } } | undefined;
        const prophecy = data?.oracle?.prophecy;
        const nextCount = readOracleCount() + 1;
        writeOracleCount(nextCount);
        setAnswerCount(nextCount);
        return {
          ...response,
          message: prophecy
            ? `— ${selectedGod.name} говорит —\n\n${prophecy}`
            : (response.message ?? `${selectedGod.name} ответил.`),
        };
      },
      { successFallback: 'Знамение получено.' },
    );
  };

  return (
    <Section
      id="oracle"
      title={godVoiceTitle(selectedGod)}
      subtitle={voice.promise}
      divider="☽ ᛉ ☾"
    >
      <form className="oracle-form panel-glass" onSubmit={handleSubmit}>
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
        <div className="form-group">
          <label htmlFor="oracleQuestion">Вопрос</label>
          <textarea
            id="oracleQuestion"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            rows={4}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Слушаю знамения...' : godVoiceTitle(selectedGod)}
          </button>
        </div>
        <p className="oracle-auth-hint">
          Бесплатно: {Math.min(answerCount, ORACLE_LIMIT)} из {ORACLE_LIMIT} ответов.
        </p>
        <FormResultBox result={result} />
      </form>
    </Section>
  );
}
