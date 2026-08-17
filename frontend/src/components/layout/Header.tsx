import { useAuth } from '../../auth/AuthContext';
import { NAV_ITEMS } from '../../config/constants';
import { NavLink, useNavigate } from 'react-router-dom';
import { VelesSymbol } from '../brand/VelesSymbol';
import { VolumeControl } from './VolumeControl';
import './Header.css';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleNavItems = NAV_ITEMS.filter((item) => (item.href === '/auth' ? !isAuthenticated : true));

  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink to="/" end className="header-logo">
          <VelesSymbol size={36} className="header-logo-symbol" />
          <span className="header-title">Велес</span>
        </NavLink>
        <nav className="header-nav">
          <VolumeControl />
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => `header-link${isActive ? ' header-link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && user ? (
            <button
              type="button"
              className="header-link header-user"
              title="Выйти"
              onClick={async () => {
                await logout();
                navigate('/auth');
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

