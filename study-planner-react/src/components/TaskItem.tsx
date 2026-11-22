import { useState } from 'react';
import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
  isBusy?: boolean;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onSelectTask: (id: number) => void;
}

function TaskItem({
  task,
  isBusy = false,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onSelectTask,
}: TaskItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
          disabled={isBusy}
          onClick={() => onSelectTask(task.id)}
        >
          Деталі
        </button>

        <button
          type="button"
          className="task-item__btn"
          disabled={isBusy}
          onClick={() => onToggleTask(task)}
        >
          {task.completed ? 'Повернути в не виконані' : 'Позначити виконаним'}
        </button>

        <button
          type="button"
          className="task-item__btn"
          disabled={isBusy}
          onClick={() => onEditTask(task)}
        >
          Редагувати
        </button>

        {!confirmingDelete ? (
          <button
            type="button"
            className="task-item__btn task-item__btn--danger"
            disabled={isBusy}
            onClick={() => setConfirmingDelete(true)}
          >
            Видалити
          </button>
        ) : (
          <>
            <button
              type="button"
              className="task-item__btn task-item__btn--danger"
              disabled={isBusy}
              onClick={() => {
                setConfirmingDelete(false);
                onDeleteTask(task.id);
              }}
            >
              Підтвердити
            </button>
            <button
              type="button"
              className="task-item__btn"
              disabled={isBusy}
              onClick={() => setConfirmingDelete(false)}
            >
              Скасувати
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TaskItem;
