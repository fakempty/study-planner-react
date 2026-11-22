import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

function TaskItem({ task, onToggleTask, onDeleteTask }: TaskItemProps) {
  const itemClass = task.completed
    ? 'task-item task-item--completed'
    : 'task-item';

  return (
    <li className={itemClass}>
      <div className="task-item__body">
        <div className="task-item__top">
          <h3 className="task-item__title">{task.title}</h3>
          <span className="task-item__status">
            {task.completed ? 'Виконано' : 'Не виконано'}
          </span>
        </div>

        {task.description && (
          <p className="task-item__description">{task.description}</p>
        )}

        <div className="task-item__meta">
          <span>Категорія: {task.category}</span>
          <span>Пріоритет: {task.priority}</span>
        </div>
      </div>

      <div className="task-item__actions">
        <button
          type="button"
          className="task-item__btn"
          onClick={() => onToggleTask(task.id)}
        >
          {task.completed ? 'Повернути в не виконані' : 'Позначити виконаним'}
        </button>

        <button
          type="button"
          className="task-item__btn task-item__btn--danger"
          onClick={() => onDeleteTask(task.id)}
        >
          Видалити
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
