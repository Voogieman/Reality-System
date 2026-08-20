import { pauseBackgroundMusicForVideo } from './backgroundMusic';

const STORAGE_KEY = 'veles-clip-volume';
const DEFAULT_VOLUME = 0.7;

export type ClipAudioState = {
  playing: boolean;
  volume: number;
};

let video: HTMLVideoElement | null = null;
const listeners = new Set<(state: ClipAudioState) => void>();

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
  const state = getClipAudioState();
  listeners.forEach((listener) => listener(state));
}

export function getClipAudioState(): ClipAudioState {
  if (!video) {
    return { playing: false, volume: loadStoredVolume() };
  }
  return {
    playing: !video.paused && !video.muted && video.volume > 0,
    volume: video.volume,
  };
}

export function subscribeClipAudio(listener: (state: ClipAudioState) => void): () => void {
  listeners.add(listener);
  listener(getClipAudioState());
  return () => {
    listeners.delete(listener);
  };
}

export function registerClipVideo(element: HTMLVideoElement | null): void {
  if (video) {
    video.removeEventListener('play', notify);
    video.removeEventListener('pause', notify);
    video.removeEventListener('volumechange', notify);
  }
  video = element;
  if (video) {
    video.volume = loadStoredVolume();
    video.addEventListener('play', notify);
    video.addEventListener('pause', notify);
    video.addEventListener('volumechange', notify);
  }
  notify();
}

export async function triggerClipAudio(): Promise<void> {
  if (!video) return;
  pauseBackgroundMusicForVideo();
  if (!video.muted && !video.paused) {
    video.muted = true;
    notify();
    return;
  }
  video.muted = false;
  if (video.volume <= 0) {
    setClipVolume(DEFAULT_VOLUME);
  }
  try {
    await video.play();
  } catch {
    video.muted = true;
  }
  notify();
}

export function muteClipAudio(): void {
  if (!video) return;
  video.muted = true;
  notify();
}

export function setClipVolume(volume: number): void {
  const next = clampVolume(volume);
  persistVolume(next);
  if (!video) {
    notify();
    return;
  }
  video.volume = next;
  if (next > 0) {
    video.muted = false;
    pauseBackgroundMusicForVideo();
    void video.play().catch(() => undefined);
  } else {
    video.muted = true;
  }
  notify();
}
