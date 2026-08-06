import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_USER_ID } from '../../config/constants';
import type { SlavicGod } from '../../data/gods';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { realityApi } from '../../lib/api/reality.api';
import { FormResultBox } from '../ui/FormResult';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './GodOracleForm.css';

type Props = {
  selectedGod: SlavicGod;
};

export function GodOracleForm({ selectedGod }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [intention, setIntention] = useState('что готовит мне судьба в ближайший год?');
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const { loading, result, submit } = useFormSubmit();

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(
      async () => {
        const response = await realityApi.askOracle({
          godName: selectedGod.apiGodName,
          intention,
          userId: isAuthenticated && user ? user.id : userId,
        });
        const data = response.data as { oracle?: { prophecy?: string } } | undefined;
        const prophecy = data?.oracle?.prophecy;
        return {
          ...response,
          message: prophecy
            ? `— ${selectedGod.name} говорит —\n\n${prophecy}`
            : (response.message ?? 'Оракул ответил.'),
        };
      },
      { successFallback: 'Пророчество получено.' },
    );
  };

  return (
    <Section
      id="oracle"
      title="ИИ-Оракул"
      subtitle={`Спроси ${selectedGod.name} о своём пути`}
      divider="☽ ᛉ ☾"
    >
      <form className="oracle-form panel-glass" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="oracleGod">Божество</label>
          <input id="oracleGod" value={selectedGod.name} readOnly />
        </div>
        {!isAuthenticated && (
          <div className="form-group">
            <label htmlFor="oracleUser">ID духа</label>
            <input id="oracleUser" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <p className="oracle-auth-hint">
              <Link to="/auth">Войди</Link>, чтобы история обращений сохранилась в кабинете.
            </p>
          </div>
        )}
        {isAuthenticated && user && (
          <p className="oracle-auth-hint">Обращение запишется для {user.displayName}.</p>
        )}
        <div className="form-group">
          <label htmlFor="oracleQuestion">Вопрос или намерение</label>
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
            {loading ? 'Слушаю знамения...' : 'Получить пророчество'}
          </button>
        </div>
        <FormResultBox result={result} />
      </form>
    </Section>
  );
}
