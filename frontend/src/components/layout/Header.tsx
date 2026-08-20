import { useAuth } from '../../auth/AuthContext';
import { useLanding, type LandingSection } from '../../landing/LandingContext';
import { VelesSymbol } from '../brand/VelesSymbol';
import { VolumeControl } from './VolumeControl';
import './Header.css';

const NAV_ITEMS: { id: LandingSection; label: string; guestOnly?: boolean; authOnly?: boolean }[] = [
  { id: 'auth', label: 'Вход', guestOnly: true },
  { id: 'knowledge', label: 'База знаний' },
  { id: 'cabinet', label: 'Личный кабинет', authOnly: true },
  { id: 'rituals', label: 'Ритуалы', authOnly: true },
  { id: 'support', label: 'Поддержка' },
  { id: 'about', label: 'Об авторе' },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { active, openSection, closeSection, openAssistant } = useLanding();
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.guestOnly) return !isAuthenticated;
    if (item.authOnly) return isAuthenticated;
    return true;
  });

  return (
    <header className="header">
      <div className="container header-inner">
        <button type="button" className="header-logo" onClick={closeSection}>
          <VelesSymbol size={36} className="header-logo-symbol" />
          <span className="header-title">Велес</span>
        </button>
        <nav className="header-nav">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`header-link${active === item.id ? ' header-link--active' : ''}`}
              onClick={() => openSection(item.id)}
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated && user ? (
            <button
              type="button"
              className="header-link header-user"
              title="Выйти"
              onClick={async () => {
                await logout();
                openSection('auth');
              }}
            >
              Выход
            </button>
          ) : null}
        </nav>
        <div className="header-tools">
          <VolumeControl />
          <button
            type="button"
            className="header-assistant"
            onClick={openAssistant}
            aria-label="Волшебный ассистент"
            title="Ассистент"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2.2 13.2 8l5.8 1.2L13.2 10.4 12 16.2 10.8 10.4 5 9.2 10.8 8 12 2.2Zm7.2 12.3 1 3.3 3.3 1-3.3 1-1 3.3-1-3.3-3.3-1 3.3-1 1-3.3ZM3.6 13.4l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
