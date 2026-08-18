import { GOD_ORACLE_PROFILES } from '../../../src/ai/prompts/god-oracle-profiles';

export type GodLore = {
  epithet: string;
  lore: string[];
  imagery: string[];
};

const POSVIST_LORE: GodLore = {
  epithet: 'Посвист — Свистящий Ветер, Бог бури, вихрей и внезапных предвестий',
  lore: [
    'Посвист — бог свистящих ветров и резких порывов, несущий внезапные перемены.',
    'Его голос слышен в свисте над степью, в звоне колокольчиков и в шуме надвигающейся бури.',
    'К нему обращаются, когда нужно распознать знамение в резкой перемене ветра или погоды.',
  ],
  imagery: ['буревестник', 'вихрь', 'свисток', 'порыв бури', 'перья хищных птиц'],
};

export function getGodLore(godId: string, fallbackDescription: string): GodLore {
  if (godId === 'posvist') {
    return POSVIST_LORE;
  }

  const profile = GOD_ORACLE_PROFILES[godId];
  if (!profile?.lore?.length) {
    return {
      epithet: fallbackDescription,
      lore: [fallbackDescription],
      imagery: [],
    };
  }

  return {
    epithet: profile.epithet,
    lore: profile.lore,
    imagery: profile.imagery,
  };
}
