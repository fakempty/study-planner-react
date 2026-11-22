import TaskItem from './TaskItem';
import type { Task } from '../types/task';
import './TaskList.scss';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  busyTaskId: number | null;
  onRetry: () => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onSelectTask: (id: number) => void;
}

function TaskList({
  tasks,
  isLoading,
  error,
  busyTaskId,
  onRetry,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onSelectTask,
}: TaskListProps) {
  if (isLoading) {
    return <p className="task-list__empty">Loading...</p>;
  }

  if (error) {
    return (
      <div className="task-list__empty">
        <p>Помилка завантаження: {error}</p>
        <button type="button" onClick={onRetry}>
          Спробувати ще
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p className="task-list__empty">Завдань не знайдено.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isBusy={busyTaskId === task.id}
          onToggleTask={onToggleTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onSelectTask={onSelectTask}
        />
      ))}
    </ul>
  );
}

export default TaskList;
