import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { useLanding } from '../../landing/LandingContext';
import { realityApi } from '../../lib/api/reality.api';
import { FormResultBox } from '../ui/FormResult';
import { Section } from '../ui/Section';
import { SupportLetterAnimation } from './SupportLetterAnimation';
import '../ui/Section.css';
import './SupportSection.css';

export function SupportSection() {
  const { isAuthenticated, user } = useAuth();
  const { goBack } = useLanding();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { loading, result, submit } = useFormSubmit();
  const [letterOpen, setLetterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(
      async () => {
        const response = await realityApi.createSupportTicket({
          subject,
          message,
          ...(isAuthenticated
            ? {}
            : { email, displayName }),
        });
        setSubject('');
        setMessage('');
        return response;
      },
      { successFallback: 'Обращение отправлено модератору' },
    ).then((ok) => {
      if (ok) {
        setLetterOpen(true);
      }
    });
  };

  return (
    <Section
      id="support"
      className="support-section"
      title="Поддержка"
      subtitle="Свяжись с модератором круга — поможем с ритуалами, оракулом и доступом"
      divider="☽ ᛉ ☾"
    >
      <form className="support-form panel-glass" onSubmit={handleSubmit}>
        <button type="button" className="support-back" onClick={goBack}>
          ← Назад
        </button>
        {!isAuthenticated && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supportName">Имя</label>
              <input
                id="supportName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="supportEmail">Email</label>
              <input
                id="supportEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {isAuthenticated && user && (
          <p className="support-hint">
            Пишешь как <strong>{user.displayName}</strong> ({user.email}). Статус обращения появится в
            кабинете.
          </p>
        )}

        <div className="form-group">
          <label htmlFor="supportSubject">Тема</label>
          <input
            id="supportSubject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Например: не сохраняется ритуал"
            required
            maxLength={200}
          />
        </div>
        <div className="form-group">
          <label htmlFor="supportMessage">Сообщение модератору</label>
          <textarea
            id="supportMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            minLength={10}
            required
            placeholder="Опиши проблему или вопрос..."
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Отправляю...' : 'Отправить модератору'}
          </button>
        </div>
        <FormResultBox result={result} />
      </form>
      <SupportLetterAnimation open={letterOpen} onClose={() => setLetterOpen(false)} />
    </Section>
  );
}
