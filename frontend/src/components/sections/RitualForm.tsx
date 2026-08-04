import { type FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_USER_ID, RITUAL_TYPES } from '../../config/constants';
import { DEFAULT_GOD, SLAVIC_GODS, type SlavicGod } from '../../data/gods';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import { realityApi } from '../../lib/api/reality.api';
import { FormResultBox } from '../ui/FormResult';
import { Section } from '../ui/Section';
import '../ui/Section.css';

type Props = {
  selectedGod: SlavicGod;
  onSelectGod: (god: SlavicGod) => void;
};

export function RitualForm({ selectedGod, onSelectGod }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [godName, setGodName] = useState(selectedGod.id || DEFAULT_GOD.id);
  const [ritualType, setRitualType] = useState('blessing');
  const [person, setPerson] = useState('');
  const [location, setLocation] = useState('Священная роща');
  const [intensity, setIntensity] = useState(75);
  const [invokerId, setInvokerId] = useState(DEFAULT_USER_ID);
  const { loading, result, submit } = useFormSubmit();

  useEffect(() => {
    if (user?.id) {
      setInvokerId(user.id);
    }
  }, [user]);

  useEffect(() => {
    setGodName(selectedGod.id);
  }, [selectedGod.id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(
      () =>
        realityApi.performRitual({
          godName,
          ritualType,
          person,
          location,
          intensity,
          invokerId: isAuthenticated && user ? user.id : invokerId,
        }),
      { successFallback: 'Ритуал совершён. Силы природы отвечают.' },
    );
  };

  return (
    <Section
      id="ritual"
      className="ritual-section"
      title="Магический Ритуал"
      subtitle="Призови силы Яви для преображения реальности"
      divider="☽ ◆ ☾"
    >
      <form className="ritual-form panel-glass" onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label htmlFor="intensity">Интенсивность ({intensity})</label>
            <input
              id="intensity"
              type="range"
              min={1}
              max={100}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
            />
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
          <div className="form-group">
            <label htmlFor="location">Место силы</label>
            <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
        </div>
        {!isAuthenticated && (
          <div className="form-group">
            <label htmlFor="invokerId">ID заклинателя</label>
            <input id="invokerId" value={invokerId} onChange={(e) => setInvokerId(e.target.value)} required />
          </div>
        )}
        {isAuthenticated && user && (
          <p className="ritual-auth-hint">Ритуал сохранится в кабинете для {user.displayName}.</p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Совершаю...' : 'Совершить ритуал'}
          </button>
        </div>
        <FormResultBox result={result} />
      </form>
    </Section>
  );
}
