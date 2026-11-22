import { useTaskContext } from '../hooks/useTaskContext';
import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, requestDelete, startEditingTask, pendingDelete } =
    useTaskContext();

  const isPendingDeletion = pendingDelete?.taskId === task.id;

  const itemClasses = ['task-item'];
  if (task.completed) {
    itemClasses.push('task-item--completed');
  }
  if (isPendingDeletion) {
    itemClasses.push('task-item--pending-delete');
  }

  return (
    <li className={itemClasses.join(' ')}>
      <div className="task-item__body">
        <div className="task-item__top">
          <h3 className="task-item__title">{task.title}</h3>
          <span className="task-item__status">
            {task.completed ? 'Виконано' : 'Не виконано'}
          </span>
          {isPendingDeletion && (
            <span className="task-item__pending-badge">Буде видалено</span>
          )}
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
          disabled={isPendingDeletion}
          onClick={() => toggleTask(task.id)}
        >
          {task.completed ? 'Повернути в не виконані' : 'Позначити виконаним'}
        </button>

        <button
          type="button"
          className="task-item__btn"
          disabled={isPendingDeletion}
          onClick={() => startEditingTask(task)}
        >
          Редагувати
        </button>

        <button
          type="button"
          className="task-item__btn task-item__btn--danger"
          disabled={isPendingDeletion}
          onClick={() => requestDelete(task.id)}
        >
          Видалити
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
