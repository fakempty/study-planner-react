import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import '../components/TaskDetails/TaskDetails.scss';

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate('/login');
  };

  return (
    <section className="task-details" aria-label="Профіль користувача">
      <div className="task-details__header">
        <h2 className="task-details__title">Профіль користувача</h2>
        <button
          type="button"
          className="task-item__btn task-item__btn--danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="task-details__meta">
        <p>
          <strong>Статус авторизації:</strong>{' '}
          {isAuthenticated ? 'Авторизований' : 'Не авторизований'}
        </p>
        <p>
          <strong>Username:</strong> {user?.username ?? '—'}
        </p>
        <p>
          <strong>Email:</strong> {user?.email ?? '—'}
        </p>
      </div>
    </section>
  );
}
