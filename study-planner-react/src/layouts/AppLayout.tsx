import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import './AppLayout.scss';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate('/login');
  };

  return (
    <main className="app">
      <Header />
      <nav className="layout-nav" aria-label="Головна навігація">
        <Link className="layout-nav__link" to="/tasks">
          Tasks
        </Link>
        <Link className="layout-nav__link" to="/profile">
          Profile
        </Link>
        {isAuthenticated ? (
          <button
            type="button"
            className="layout-nav__logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link className="layout-nav__link" to="/login">
            Login
          </Link>
        )}
      </nav>
      {children}
    </main>
  );
}
