const STORAGE_KEY = 'veles-tamagotchi';

export type TamagotchiStage = 'egg' | 'spirit' | 'guardian' | 'gone';

export type TamagotchiState = {
  name: string;
  bornAt: number;
  lastTick: number;
  hunger: number;
  mood: number;
  energy: number;
  hygiene: number;
  health: number;
  stage: TamagotchiStage;
  sleeping: boolean;
};

const DEFAULT_STATE: TamagotchiState = {
  name: 'Домовой',
  bornAt: 0,
  lastTick: 0,
  hunger: 72,
  mood: 70,
  energy: 80,
  hygiene: 78,
  health: 100,
  stage: 'egg',
  sleeping: false,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function createTamagotchi(name = 'Домовой'): TamagotchiState {
  const now = Date.now();
  return {
    ...DEFAULT_STATE,
    name: name.trim() || 'Домовой',
    bornAt: now,
    lastTick: now,
    stage: 'egg',
  };
}

export function loadTamagotchi(): TamagotchiState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createTamagotchi();
    const parsed = JSON.parse(raw) as TamagotchiState;
    return tickTamagotchi({ ...DEFAULT_STATE, ...parsed, name: parsed.name || 'Домовой' });
  } catch {
    return createTamagotchi();
  }
}

export function saveTamagotchi(state: TamagotchiState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export function tickTamagotchi(state: TamagotchiState): TamagotchiState {
  if (state.stage === 'gone' || state.stage === 'egg') {
    return { ...state, lastTick: Date.now() };
  }

  const now = Date.now();
  const minutes = Math.min(240, (now - state.lastTick) / 60000);
  if (minutes < 0.08) return state;

  const hunger = clamp(state.hunger - minutes * 3.4);
  const mood = clamp(state.mood - minutes * 2.6);
  const energy = clamp(state.sleeping ? state.energy + minutes * 7 : state.energy - minutes * 2.2);
  const hygiene = clamp(state.hygiene - minutes * 1.8);
  const neglected = hunger < 18 || mood < 18 || hygiene < 12;
  const health = clamp(state.health + (neglected ? minutes * -6 : minutes * 0.6));
  const ageMinutes = (now - state.bornAt) / 60000;
  const cared = hunger > 45 && mood > 45 && health > 50;
  let stage: TamagotchiStage = state.stage;
  if (health <= 0) {
    stage = 'gone';
  } else if (ageMinutes > 18 && cared) {
    stage = 'guardian';
  } else if (ageMinutes > 2) {
    stage = 'spirit';
  }

  return {
    ...state,
    lastTick: now,
    hunger,
    mood,
    energy,
    hygiene,
    health,
    stage,
    sleeping: stage === 'gone' ? false : state.sleeping,
  };
}

export function hatchTamagotchi(state: TamagotchiState): TamagotchiState {
  if (state.stage !== 'egg') return state;
  const now = Date.now();
  return {
    ...state,
    stage: 'spirit',
    bornAt: now,
    lastTick: now,
    sleeping: false,
  };
}

export function feedTamagotchi(state: TamagotchiState): TamagotchiState {
  if (!canAct(state)) return state;
  return {
    ...state,
    hunger: clamp(state.hunger + 28),
    hygiene: clamp(state.hygiene - 4),
    sleeping: false,
  };
}

export function playTamagotchi(state: TamagotchiState): TamagotchiState {
  if (!canAct(state) || state.energy < 12) return state;
  return {
    ...state,
    mood: clamp(state.mood + 24),
    energy: clamp(state.energy - 14),
    hunger: clamp(state.hunger - 8),
    sleeping: false,
  };
}

export function cleanTamagotchi(state: TamagotchiState): TamagotchiState {
  if (!canAct(state)) return state;
  return {
    ...state,
    hygiene: clamp(state.hygiene + 32),
    mood: clamp(state.mood + 6),
    sleeping: false,
  };
}

export function toggleSleepTamagotchi(state: TamagotchiState): TamagotchiState {
  if (state.stage === 'gone' || state.stage === 'egg') return state;
  return { ...state, sleeping: !state.sleeping };
}

export function ageLabel(state: TamagotchiState): string {
  if (state.stage === 'egg') return 'яйцо духа';
  if (state.stage === 'gone') return 'дух ушёл';
  const minutes = Math.max(0, Math.floor((Date.now() - state.bornAt) / 60000));
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
}

export function moodLabel(state: TamagotchiState): string {
  if (state.stage === 'egg') return 'ждёт тепла';
  if (state.stage === 'gone') return 'тишина';
  if (state.sleeping) return 'спит';
  if (state.health < 25) return 'слаб';
  if (state.hunger < 20) return 'голоден';
  if (state.hygiene < 20) return 'ждет очищения';
  if (state.mood > 75 && state.hunger > 60) return 'доволен';
  if (state.mood < 30) return 'скучает';
  return 'живёт';
}

function canAct(state: TamagotchiState): boolean {
  return state.stage !== 'gone' && state.stage !== 'egg';
}
