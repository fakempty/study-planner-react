import type { Task } from '../types/task';

interface TaskStatsProps {
  tasks: Task[];
}

function TaskStats({ tasks }: TaskStatsProps) {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.filter((task) => !task.completed).length;

  return (
    <section aria-label="Статистика завдань">
      <p>Усього завдань: {totalCount}</p>
      <p>Виконано: {completedCount}</p>
      <p>Не виконано: {activeCount}</p>
    </section>
  );
}

export default TaskStats;
