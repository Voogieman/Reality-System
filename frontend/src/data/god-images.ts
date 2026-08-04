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
  const key = normalize(filename.replace(/\.[^.]+$/, ''));
  if (key) {
    acc[key] = url;
  }
  return acc;
}, {});

export function getGodImageByGod(god: SlavicGod): string {
  const byId = godImageByKey[normalize(god.id)];
  if (byId) return byId;

  const byName = godImageByKey[normalize(god.name)];
  if (byName) return byName;

  return '/veles-bg.png';
}

export function getMissingGodImages(): string[] {
  return SLAVIC_GODS.filter((god) => !godImageByKey[normalize(god.id)] && !godImageByKey[normalize(god.name)]).map(
    (god) => god.id,
  );
}

