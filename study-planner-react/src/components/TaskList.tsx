import { useTaskContext } from '../hooks/useTaskContext';
import TaskItem from './TaskItem';
import './TaskList.scss';

function TaskList() {
  const { tasks, filter } = useTaskContext();

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'completed') {
      return task.completed;
    }
    if (filter === 'active') {
      return !task.completed;
    }
    return true;
  });

  if (tasks.length === 0) {
    return (
      <p className="task-list__empty">
        Завдань поки немає. Додайте перше навчальне завдання.
      </p>
    );
  }

  if (visibleTasks.length === 0) {
    const filterLabel = filter === 'completed' ? 'виконаних' : 'невиконаних';
    return (
      <p className="task-list__empty">
        За цим фільтром завдань немає ({filterLabel}).
      </p>
    );
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

export default TaskList;
