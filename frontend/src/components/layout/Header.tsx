import { useAuth } from '../../auth/AuthContext';
import { useLanding, type LandingSection } from '../../landing/LandingContext';
import { VelesSymbol } from '../brand/VelesSymbol';
import './Header.css';

const NAV_ITEMS: { id: LandingSection; label: string; guestOnly?: boolean; authOnly?: boolean }[] = [
  { id: 'auth', label: 'Вход', guestOnly: true },
  { id: 'cabinet', label: 'Личный кабинет', authOnly: true },
  { id: 'support', label: 'Поддержка' },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { active, openSection, closeSection } = useLanding();
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
      </div>
    </header>
  );
}
