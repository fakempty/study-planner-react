import { useTaskContext } from '../hooks/useTaskContext';
import type { TaskFilter } from '../types/task';
import './TaskFilters.scss';

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
];

function TaskFilters() {
  const { filter, setFilter } = useTaskContext();

  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {FILTERS.map((item) => {
        const isActive = filter === item.value;
        const buttonClass = isActive
          ? 'task-filters__button task-filters__button--active'
          : 'task-filters__button';

        return (
          <button
            key={item.value}
            type="button"
            className={buttonClass}
            aria-pressed={isActive}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default TaskFilters;
