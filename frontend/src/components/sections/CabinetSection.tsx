import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_GOD, getGodById, SLAVIC_GODS } from '../../data/gods';
import { realityApi } from '../../lib/api/reality.api';
import { useLanding } from '../../landing/LandingContext';
import type {
  OracleHistoryItem,
  RitualModerationStatus,
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

const RITUAL_STATUS_LABEL: Record<RitualModerationStatus, string> = {
  submitted_for_review: 'Отправлен на проверку',
  accepted_for_execution: 'Принят на реализацию',
  rejected: 'Отклонён',
  completed: 'Выполнен',
};

function ritualStatusLabel(item: RitualHistoryItem): string {
  return RITUAL_STATUS_LABEL[item.moderationStatus] ?? 'Отправлен на проверку';
}

function resolveRitualGodId(item: RitualHistoryItem): string | null {
  if (item.godId) {
    return item.godId.trim().toLowerCase();
  }

  const result = item.result as Record<string, unknown>;
  const resultGodId = result?.godId;
  if (typeof resultGodId === 'string' && resultGodId.trim()) {
    return resultGodId.trim().toLowerCase();
  }

  const resultGodName = result?.godName;
  if (typeof resultGodName === 'string' && resultGodName.trim()) {
    const byName = SLAVIC_GODS.find((god) => god.name.toLowerCase() === resultGodName.trim().toLowerCase());
    if (byName) {
      return byName.id;
    }
  }

  return DEFAULT_GOD.id;
}

export function CabinetSection() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { openSection } = useLanding();
  const [rituals, setRituals] = useState<RitualHistoryItem[]>([]);
  const [ritualGodFilter, setRitualGodFilter] = useState<string>('all');
  const [oracles, setOracles] = useState<OracleHistoryItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const filteredRituals =
    ritualGodFilter === 'all'
      ? rituals
      : rituals.filter((item) => resolveRitualGodId(item) === ritualGodFilter);

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
          <button type="button" className="btn-primary" onClick={() => openSection('auth')}>
            Войти / Регистрация
          </button>
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
            <h3 className="cabinet-card-title">История ритуалов</h3>
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
              {filteredRituals.map((item) => {
                const ritualGodId = resolveRitualGodId(item);
                return (
                  <li key={item.id} className="cabinet-item">
                    <div className="cabinet-item-head">
                      <strong>{item.ritualName}</strong>
                      <span className={`status-pill ${item.moderationStatus}`}>
                        {ritualStatusLabel(item)}
                      </span>
                    </div>
                    <p className="cabinet-intention">
                      Бог: {ritualGodId ? (getGodById(ritualGodId)?.name ?? ritualGodId) : 'не указан'}
                    </p>
                    <p>{item.person} · сила {item.intensity}</p>
                    {item.moderationReason && <p className="cabinet-reply">Причина: {item.moderationReason}</p>}
                    <time>{formatDate(item.createdAt)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="cabinet-card panel-glass">
          <h3 className="cabinet-card-title">История диалогов</h3>
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
                    <p className="cabinet-intention">Ты: {item.intention}</p>
                    {item.prophecy ? (
                      <p className="cabinet-prophecy">Оракул: {item.prophecy}</p>
                    ) : null}
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
              <button type="button" className="cabinet-inline-link" onClick={() => openSection('support')}>
                Написать модератору
              </button>
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
