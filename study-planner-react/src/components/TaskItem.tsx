import type { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

function TaskItem({ task, onToggleTask, onDeleteTask }: TaskItemProps) {
  return (
    <li data-completed={task.completed}>
      <div>
        <div>
          <h3>{task.title}</h3>
          <span>{task.completed ? 'Виконано' : 'Не виконано'}</span>
        </div>

        {task.description && <p>{task.description}</p>}

        <div>
          <span>Категорія: {task.category}</span>
          <span>Пріоритет: {task.priority}</span>
        </div>
      </div>

      <div>
        <button type="button" onClick={() => onToggleTask(task.id)}>
          {task.completed ? 'Повернути в не виконані' : 'Позначити виконаним'}
        </button>

        <button type="button" onClick={() => onDeleteTask(task.id)}>
          Видалити
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
