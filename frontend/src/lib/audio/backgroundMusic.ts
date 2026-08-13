const TRACK_SRC = '/audio/poceluj-goryacho.mp3';
const STORAGE_KEY = 'veles-bg-volume';
const DEFAULT_VOLUME = 0.45;

export type BackgroundMusicState = {
  playing: boolean;
  volume: number;
};

let audio: HTMLAudioElement | null = null;
let pausedForVideo = false;
let musicBlocked = false;
const listeners = new Set<(state: BackgroundMusicState) => void>();

function clampVolume(volume: number): number {
  if (Number.isNaN(volume)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, volume));
}

function loadStoredVolume(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VOLUME;
    return clampVolume(Number(raw));
  } catch {
    return DEFAULT_VOLUME;
  }
}

function persistVolume(volume: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(volume));
  } catch {
    /* ignore quota / private mode */
  }
}

function notify(): void {
  const state = getBackgroundMusicState();
  listeners.forEach((listener) => listener(state));
}

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(TRACK_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = loadStoredVolume();
    audio.addEventListener('play', notify);
    audio.addEventListener('pause', notify);
    audio.addEventListener('ended', notify);
    audio.addEventListener('volumechange', notify);
  }
  return audio;
}

export function getBackgroundMusicState(): BackgroundMusicState {
  if (!audio) {
    return { playing: false, volume: loadStoredVolume() };
  }
  return { playing: !audio.paused, volume: audio.volume };
}

export function subscribeBackgroundMusic(listener: (state: BackgroundMusicState) => void): () => void {
  listeners.add(listener);
  listener(getBackgroundMusicState());
  return () => {
    listeners.delete(listener);
  };
}

export function setBackgroundMusicBlocked(blocked: boolean): void {
  musicBlocked = blocked;
  if (blocked) {
    pauseBackgroundMusicForVideo();
  }
}

export function pauseBackgroundMusicForVideo(): void {
  const el = getAudio();
  if (!el.paused) {
    pausedForVideo = true;
    el.pause();
  }
}

export async function resumeBackgroundMusicAfterVideo(): Promise<void> {
  if (musicBlocked || !pausedForVideo) return;
  pausedForVideo = false;
  await playBackgroundTrack();
}

async function playBackgroundTrack(): Promise<void> {
  if (musicBlocked) return;
  const el = getAudio();
  if (el.volume <= 0) {
    setBackgroundVolume(DEFAULT_VOLUME);
  }
  try {
    await el.play();
  } catch {
    /* браузер может блокировать autoplay до клика */
  }
}

/** Пользовательский жест: запускает фоновый трек по кругу. На странице «Об авторе» не играет. */
export async function triggerBackgroundMusic(): Promise<void> {
  if (musicBlocked) return;
  pausedForVideo = false;
  await playBackgroundTrack();
}

export function setBackgroundVolume(volume: number): void {
  const next = clampVolume(volume);
  const el = getAudio();
  el.volume = next;
  persistVolume(next);
  notify();
}
