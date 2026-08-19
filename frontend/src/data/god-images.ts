import { SLAVIC_GODS, type SlavicGod } from './gods';

const godImageModules = import.meta.glob('../assets/gods/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, '');

const godImageByKey = Object.entries(godImageModules).reduce<Record<string, string>>((acc, [path, url]) => {
  const filename = path.split('/').pop() ?? '';
  const stem = filename.replace(/\.[^.]+$/, '');
  const keys = new Set([normalize(stem), normalize(stem.split(/\s*[-–—]\s*/)[0] ?? '')]);
  for (const key of keys) {
    if (key) {
      acc[key] = url;
    }
  }
  return acc;
}, {});

export type GodImageFrame = {
  fit: 'cover' | 'contain';
  position: string;
};

const GOD_IMAGE_FRAME: Record<string, GodImageFrame> = {
  veles: { fit: 'cover', position: 'center 28%' },
  perun: { fit: 'cover', position: 'center 22%' },
  yarilo: { fit: 'cover', position: 'center 24%' },
  dazhbog: { fit: 'contain', position: 'center center' },
  khors: { fit: 'contain', position: 'center 12%' },
  chernobog: { fit: 'contain', position: 'center 18%' },
  rod: { fit: 'contain', position: 'center 20%' },
  stribog: { fit: 'contain', position: 'center center' },
  mokosh: { fit: 'contain', position: 'center 10%' },
  lada: { fit: 'contain', position: 'center 8%' },
  morana: { fit: 'contain', position: 'center 12%' },
  svarog: { fit: 'contain', position: 'center 10%' },
  vyshen: { fit: 'contain', position: 'center 8%' },
  posvist: { fit: 'contain', position: 'center 14%' },
  yaginya: { fit: 'contain', position: 'center 12%' },
  belobog: { fit: 'contain', position: 'center 12%' },
};

export function frameFromRatio(ratio: number): GodImageFrame {
  if (ratio >= 1.35) return { fit: 'cover', position: 'center 22%' };
  if (ratio <= 0.85) return { fit: 'contain', position: 'center 10%' };
  return { fit: 'contain', position: 'center center' };
}

export function getGodImageFrame(god: SlavicGod, ratio?: number): GodImageFrame {
  if (GOD_IMAGE_FRAME[god.id]) return GOD_IMAGE_FRAME[god.id];
  return frameFromRatio(ratio ?? 1);
}

export function getGodImageByGod(god: SlavicGod): string {
  const byId = godImageByKey[normalize(god.id)];
  if (byId) return byId;

  const byName = godImageByKey[normalize(god.name)];
  if (byName) return byName;

  return '/veles-bg.png';
}

export function hasDedicatedGodImage(god: SlavicGod): boolean {
  return Boolean(godImageByKey[normalize(god.id)] || godImageByKey[normalize(god.name)]);
}

export function getMissingGodImages(): string[] {
  return SLAVIC_GODS.filter((god) => !godImageByKey[normalize(god.id)] && !godImageByKey[normalize(god.name)]).map(
    (god) => god.id,
  );
}
