import type { Task } from '../types/task';
import './TaskStats.scss';

interface TaskStatsProps {
  tasks: Task[];
}

function TaskStats({ tasks }: TaskStatsProps) {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.filter((task) => !task.completed).length;

  return (
    <section className="task-stats" aria-label="Статистика завдань">
      <p className="task-stats__item">Усього завдань: {totalCount}</p>
      <p className="task-stats__item">Виконано: {completedCount}</p>
      <p className="task-stats__item">Не виконано: {activeCount}</p>
    </section>
  );
}

export default TaskStats;
