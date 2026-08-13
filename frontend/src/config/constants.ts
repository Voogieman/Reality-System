export const DEFAULT_USER_ID = 'vugar_guliev_1996';

export const RITUAL_TYPES = [
  { value: 'purification', label: 'Очищение' },
  { value: 'blessing', label: 'Благословение' },
  { value: 'consecration', label: 'Освящение' },
  { value: 'weaving', label: 'Плетение судьбы' },
  { value: 'coition', label: 'Единение' },
  { value: 'offer', label: 'Подношение' },
] as const;

export const NAV_ITEMS = [
  { href: '/', label: 'Главная' },
  { href: '/portal', label: 'Портал' },
  { href: '/about', label: 'Об авторе' },
  { href: '/auth', label: 'Вход' },
  { href: '/cabinet', label: 'Кабинет' },
  { href: '/support', label: 'Поддержка' },
] as const;
