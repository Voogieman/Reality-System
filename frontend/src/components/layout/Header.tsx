import { NAV_ITEMS } from '../../config/constants';
import { useAuth } from '../../auth/AuthContext';
import { VelesSymbol } from '../brand/VelesSymbol';
import './Header.css';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="header-logo">
          <VelesSymbol size={36} className="header-logo-symbol" />
          <span className="header-title">Велес</span>
        </a>
        <nav className="header-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="header-link">
              {item.label}
            </a>
          ))}
          {isAuthenticated && user ? (
            <button
              type="button"
              className="header-link header-user"
              title={user.email}
              onClick={() => void logout()}
            >
              {user.displayName} · выход
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
