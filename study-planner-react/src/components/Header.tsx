import { useTaskContext } from '../hooks/useTaskContext';
import './Header.scss';

function Header() {
  const { resetTasks } = useTaskContext();

  return (
    <header className="header">
      <div>
        <h1 className="header__title">Study Planner</h1>
        <p className="header__subtitle">Планувальник навчальних завдань</p>
      </div>

      <button type="button" className="header__reset" onClick={resetTasks}>
        Скинути дані
      </button>
    </header>
  );
}

export default Header;
