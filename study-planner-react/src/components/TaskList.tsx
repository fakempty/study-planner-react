import { Task, TaskFilter } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  activeFilter: TaskFilter;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

function TaskList({
  tasks,
  totalTasksCount,
  activeFilter,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  if (totalTasksCount === 0) {
    return (
      <p>
        Завдань поки немає. Додайте перше навчальне завдання.
      </p>
    );
  }

  if (tasks.length === 0) {
    const filterLabel =
      activeFilter === 'completed' ? 'виконаних' : 'невиконаних';
    return <p>За цим фільтром завдань немає ({filterLabel}).</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ul>
  );
}

export default TaskList;
