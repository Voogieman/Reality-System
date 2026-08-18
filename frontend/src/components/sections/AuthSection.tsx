import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { useLanding } from '../../landing/LandingContext';
import { FormResultBox } from '../ui/FormResult';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './AuthSection.css';

type Mode = 'login' | 'register';

export function AuthSection() {
  const { isAuthenticated, user, login, register, confirmEmail, logout } = useAuth();
  const { openSection } = useLanding();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const { loading, result, submit, setResult } = useFormSubmit();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setConfirmToken(token);
    }
  }, []);

  if (isAuthenticated && user) {
    return (
      <Section
        id="auth"
        className="auth-section"
        title="Круг открыт"
        subtitle={`Ты вошёл как ${user.displayName}`}
        divider="ᛉ ◆ ᛉ"
      >
        <div className="auth-panel panel-glass">
          <p className="auth-signed-in">
            Email: <strong>{user.email}</strong>
          </p>
          <div className="form-actions auth-actions">
            <button type="button" className="btn-primary" onClick={() => openSection('cabinet')}>
              Личный кабинет
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={loading}
              onClick={() =>
                void submit(
                  async () => {
                    await logout();
                    return { success: true, message: 'Сессия завершена' };
                  },
                  { successFallback: 'Выход выполнен' },
                )
              }
            >
              Выйти
            </button>
          </div>
          <FormResultBox result={result} />
        </div>
      </Section>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      void submit(
        async () => {
          await login({ email, password });
          return { success: true, message: 'Вход выполнен. JWT сохранён.' };
        },
        { successFallback: 'Вход выполнен' },
      );
      return;
    }

        void submit(
          async () => {
            const res = await register({ email, displayName, password });
            if (res.confirmationUrl) {
              const url = new URL(res.confirmationUrl);
              const token = url.searchParams.get('token') ?? '';
              setConfirmToken(token);
              return {
                success: true,
                message: `${res.message} Токен подтверждения подставлен ниже — нажми «Подтвердить email».`,
              };
            }
            return { success: true, message: res.message };
          },
          { successFallback: 'Регистрация выполнена' },
        );
  };

  const handleConfirm = () => {
    if (!confirmToken.trim()) return;
    void submit(
      async () => {
        const message = await confirmEmail(confirmToken.trim());
        setMode('login');
        return { success: true, message: `${message}. Теперь войди.` };
      },
      { successFallback: 'Email подтверждён' },
    );
  };

  return (
    <Section
      id="auth"
      className="auth-section"
      title="Вход и регистрация"
      divider="ᛉ ◆ ᛉ"
    >
      <div className="auth-panel panel-glass">
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => {
              setMode('login');
              setResult(null);
            }}
          >
            Вход
          </button>
          <button
            type="button"
            role="tab"
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => {
              setMode('register');
              setResult(null);
            }}
          >
            Регистрация
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="authDisplayName">Имя в круге</label>
              <input
                id="authDisplayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Воин Руси"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="authEmail">Email</label>
            <input
              id="authEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="drevniy@rus.su"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="authPassword">Пароль</label>
            <input
              id="authPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? 'Жди...'
                : mode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </button>
          </div>
        </form>

        {mode === 'register' && (
          <div className="auth-confirm">
            <div className="form-group">
              <label htmlFor="confirmToken">Токен подтверждения email</label>
              <input
                id="confirmToken"
                value={confirmToken}
                onChange={(e) => setConfirmToken(e.target.value)}
                placeholder="из ответа регистрации / письма"
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                disabled={loading || !confirmToken.trim()}
                onClick={handleConfirm}
              >
                Подтвердить email
              </button>
            </div>
          </div>
        )}

        <FormResultBox result={result} />
      </div>
    </Section>
  );
}
