import type { TaskFilter } from '../types/task';
import './TaskFilters.scss';

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
];

function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        const buttonClass = isActive
          ? 'task-filters__button task-filters__button--active'
          : 'task-filters__button';

        return (
          <button
            key={filter.value}
            type="button"
            className={buttonClass}
            aria-pressed={isActive}
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default TaskFilters;
