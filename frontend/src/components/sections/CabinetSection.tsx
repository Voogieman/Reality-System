import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getGodById, SLAVIC_GODS } from '../../data/gods';
import { realityApi } from '../../lib/api/reality.api';
import type {
  OracleHistoryItem,
  RitualHistoryItem,
  SupportTicketItem,
  SupportTicketStatus,
} from '../../lib/api/types';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './CabinetSection.css';

const SUPPORT_STATUS_LABEL: Record<SupportTicketStatus, string> = {
  new: 'Новое',
  in_review: 'На рассмотрении',
  answered: 'Ответ модератора',
  closed: 'Закрыто',
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function oracleStatus(item: OracleHistoryItem): { label: string; tone: string } {
  if (item.prophecy?.trim()) {
    return { label: 'Ответ получен', tone: 'ok' };
  }
  return { label: 'Ожидает знамения', tone: 'wait' };
}

export function CabinetSection() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [rituals, setRituals] = useState<RitualHistoryItem[]>([]);
  const [ritualGodFilter, setRitualGodFilter] = useState<string>('all');
  const [oracles, setOracles] = useState<OracleHistoryItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const filteredRituals =
    ritualGodFilter === 'all' ? rituals : rituals.filter((item) => item.godId === ritualGodFilter);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [ritualRes, oracleRes, supportRes] = await Promise.all([
        realityApi.getRitualHistory(),
        realityApi.getOracleHistory(),
        realityApi.getSupportTickets(),
      ]);
      setRituals(Array.isArray(ritualRes.data) ? ritualRes.data : []);
      setOracles(Array.isArray(oracleRes.data) ? oracleRes.data : []);
      setTickets(Array.isArray(supportRes.data) ? supportRes.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить кабинет');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  if (authLoading) {
    return (
      <Section id="cabinet" title="Личный кабинет" subtitle="Загрузка профиля..." divider="☽ ◆ ☾">
        <p className="cabinet-empty">Открываю врата...</p>
      </Section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Section
        id="cabinet"
        className="cabinet-section"
        title="Личный кабинет"
        subtitle="Войди, чтобы видеть ритуалы и статусы обращений"
        divider="☽ ◆ ☾"
      >
        <div className="cabinet-gate panel-glass">
          <p>Кабинет доступен только посвящённым круга.</p>
          <a href="#auth" className="btn-primary">
            Войти / Регистрация
          </a>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="cabinet"
      className="cabinet-section"
      title="Личный кабинет"
      subtitle={`Привет, ${user.displayName}`}
      divider="☽ ◆ ☾"
    >
      <div className="cabinet-profile panel-glass">
        <div>
          <p className="cabinet-label">Имя</p>
          <p className="cabinet-value">{user.displayName}</p>
        </div>
        <div>
          <p className="cabinet-label">Email</p>
          <p className="cabinet-value">{user.email}</p>
        </div>
        <div>
          <p className="cabinet-label">ID духа</p>
          <p className="cabinet-value cabinet-mono">{user.id}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => void load()} disabled={loading}>
          {loading ? 'Обновляю...' : 'Обновить'}
        </button>
      </div>

      {error && <p className="cabinet-error">{error}</p>}

      <div className="cabinet-grid">
        <article className="cabinet-card panel-glass">
          <div className="cabinet-card-head">
            <h3 className="cabinet-card-title">Мои ритуалы</h3>
            <div className="cabinet-filter">
              <label htmlFor="cabinetRitualGodFilter">Бог</label>
              <select
                id="cabinetRitualGodFilter"
                value={ritualGodFilter}
                onChange={(e) => setRitualGodFilter(e.target.value)}
              >
                <option value="all">Все</option>
                {SLAVIC_GODS.map((god) => (
                  <option key={god.id} value={god.id}>
                    {god.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {rituals.length === 0 ? (
            <p className="cabinet-empty">Пока нет совершённых ритуалов.</p>
          ) : filteredRituals.length === 0 ? (
            <p className="cabinet-empty">По выбранному богу ритуалов пока нет.</p>
          ) : (
            <ul className="cabinet-list">
              {filteredRituals.map((item) => (
                <li key={item.id} className="cabinet-item">
                  <div className="cabinet-item-head">
                    <strong>{item.ritualName}</strong>
                    <span className={`status-pill ${item.success ? 'ok' : 'fail'}`}>
                      {item.success ? 'Успех' : 'Провал'}
                    </span>
                  </div>
                  <p className="cabinet-intention">
                    Бог: {item.godId ? (getGodById(item.godId)?.name ?? item.godId) : 'не указан'}
                  </p>
                  <p>
                    {item.person} · {item.location} · сила {item.intensity}
                  </p>
                  <time>{formatDate(item.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="cabinet-card panel-glass">
          <h3 className="cabinet-card-title">Обращения к оракулу</h3>
          {oracles.length === 0 ? (
            <p className="cabinet-empty">Ещё не было вопросов богам.</p>
          ) : (
            <ul className="cabinet-list">
              {oracles.map((item) => {
                const status = oracleStatus(item);
                const god = getGodById(item.godId);
                return (
                  <li key={item.id} className="cabinet-item">
                    <div className="cabinet-item-head">
                      <strong>{god?.name ?? item.godId}</strong>
                      <span className={`status-pill ${status.tone}`}>{status.label}</span>
                    </div>
                    <p className="cabinet-intention">{item.intention}</p>
                    {item.prophecy && (
                      <p className="cabinet-prophecy">
                        {item.prophecy.slice(0, 180)}
                        {item.prophecy.length > 180 ? '…' : ''}
                      </p>
                    )}
                    <time>{formatDate(item.createdAt)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="cabinet-card panel-glass cabinet-card-wide">
          <h3 className="cabinet-card-title">Обращения к модератору</h3>
          {tickets.length === 0 ? (
            <p className="cabinet-empty">
              Нет обращений в поддержку.{' '}
              <a href="#support">Написать модератору</a>
            </p>
          ) : (
            <ul className="cabinet-list">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="cabinet-item">
                  <div className="cabinet-item-head">
                    <strong>{ticket.subject}</strong>
                    <span className={`status-pill ${ticket.status}`}>
                      {SUPPORT_STATUS_LABEL[ticket.status]}
                    </span>
                  </div>
                  <p>{ticket.message}</p>
                  {ticket.moderatorReply && (
                    <p className="cabinet-reply">Модератор: {ticket.moderatorReply}</p>
                  )}
                  <time>{formatDate(ticket.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </Section>
  );
}
