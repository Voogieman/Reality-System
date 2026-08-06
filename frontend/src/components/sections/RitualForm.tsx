import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_USER_ID, RITUAL_TYPES } from '../../config/constants';
import { DEFAULT_GOD, SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { realityApi } from '../../lib/api/reality.api';
import type { FormResult } from '../../lib/api/types';
import { FormResultBox } from '../ui/FormResult';
import { Modal } from '../ui/Modal';
import { Section } from '../ui/Section';
import '../ui/Section.css';
import './RitualForm.css';

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
};

type ModalState = {
  open: boolean;
  progress: number;
  phase: 'sending' | 'queued' | 'error';
  text: string;
};

export function RitualForm({ selectedGod, onSelectGod }: Props) {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'vugarguliev333@gmail.com';
  const [godName, setGodName] = useState(selectedGod.apiGodName || DEFAULT_GOD.apiGodName);
  const [ritualType, setRitualType] = useState('blessing');
  const [person, setPerson] = useState('');
  const [invokerId, setInvokerId] = useState(DEFAULT_USER_ID);
  const [loading, setLoading] = useState(false);
  const [adminRitualFx, setAdminRitualFx] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    progress: 0,
    phase: 'sending',
    text: 'Инициализируем ритуальный контур...',
  });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      setInvokerId(user.id);
    }
  }, [user]);

  useEffect(() => {
    setGodName(selectedGod.apiGodName);
  }, [selectedGod.apiGodName]);

  useEffect(
    () => () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    },
    [],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    if (isAdmin) {
      setAdminRitualFx(true);
    } else {
      setModal({
        open: true,
        progress: 8,
        phase: 'sending',
        text: 'Ритуал формируется и отправляется на модерацию...',
      });
      intervalRef.current = window.setInterval(() => {
        setModal((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 6, 92),
        }));
      }, 180);
    }

    try {
      const response = await realityApi.performRitual({
        godName,
        ritualType,
        person,
        invokerId: isAuthenticated && user ? user.id : invokerId,
      });

      if (!isAdmin) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }

        const data = response.data as { moderationEtaMinutes?: number } | undefined;
        setModal({
          open: true,
          progress: 100,
          phase: 'queued',
          text: `Ритуал отправлен на проверку. Ожидаем модерацию ${data?.moderationEtaMinutes ?? 45} минут.`,
        });
      }
      setResult({
        type: 'success',
        text: response.message ?? (isAdmin ? 'Ритуал исполнен.' : 'Ритуал отправлен на модерацию.'),
      });
      setPerson('');
    } catch (error) {
      if (!isAdmin) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
        const text = error instanceof Error ? error.message : 'Не удалось отправить ритуал';
        setModal({
          open: true,
          progress: 100,
          phase: 'error',
          text,
        });
        setResult({ type: 'error', text });
      } else {
        const text = error instanceof Error ? error.message : 'Не удалось исполнить ритуал';
        setResult({ type: 'error', text });
      }
    } finally {
      setLoading(false);
      if (isAdmin) {
        window.setTimeout(() => setAdminRitualFx(false), 900);
      }
    }
  };

  return (
    <>
      <Section
        id="ritual"
        className="ritual-section"
        title="Магический Ритуал"
        subtitle="Ритуал отправляется на модерацию и проходит 30-60 минут проверки"
        divider="☽ ◆ ☾"
      >
        <form className={`ritual-form panel-glass${adminRitualFx ? ' ritual-form-admin-fx' : ''}`} onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ritualGod">Божество пантеона</label>
              <select
                id="ritualGod"
                value={godName}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setGodName(nextId);
                  const nextGod = SLAVIC_GODS.find((god) => god.id === nextId);
                  if (nextGod) {
                    onSelectGod(nextGod);
                  }
                }}
              >
                {SLAVIC_GODS.map((god) => (
                  <option key={god.id} value={god.id}>
                    {god.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="ritualType">Тип ритуала</label>
              <select id="ritualType" value={ritualType} onChange={(e) => setRitualType(e.target.value)}>
                {RITUAL_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="person">Для кого</label>
              <input
                id="person"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="имя и фамилия"
                required
              />
            </div>
          </div>
          {!isAuthenticated && (
            <div className="form-group">
              <label htmlFor="invokerId">ID заклинателя</label>
              <input id="invokerId" value={invokerId} onChange={(e) => setInvokerId(e.target.value)} required />
            </div>
          )}
          {isAuthenticated && user && (
            <p className="ritual-auth-hint">
              Интенсивность зафиксирована на 76, место силы назначается автоматически.
            </p>
          )}
          <div className="form-actions">
            <button type="submit" className={`btn-primary${loading ? ' ritual-btn-pulse' : ''}`} disabled={loading}>
              {loading ? 'Отправляю на модерацию...' : 'Совершить ритуал'}
            </button>
          </div>
          <FormResultBox result={result} />
        </form>
      </Section>
      {!isAdmin && (
        <Modal
          open={modal.open}
          title={modal.phase === 'error' ? 'Ошибка ритуала' : 'Ритуальный процесс'}
          onClose={() => setModal((prev) => ({ ...prev, open: false }))}
          closeText="Понятно"
          lockClose={modal.phase === 'sending'}
        >
          <p>{modal.text}</p>
          <div className="ritual-progress">
            <div className={`ritual-progress-fill ${modal.phase}`} style={{ width: `${modal.progress}%` }} />
          </div>
        </Modal>
      )}
    </>
  );
}

