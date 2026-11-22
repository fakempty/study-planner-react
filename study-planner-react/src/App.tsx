import { useEffect, useState } from 'react';
import Header from './components/Header';
import Pagination from './components/Pagination';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { TaskDetails } from './components/TaskDetails/TaskDetails';
import { taskRepository } from './repositories/taskRepository';
import type { CreateTaskInput } from './repositories/taskRepository';
import type { Task } from './types/task';
import './index.scss';

const PAGE_LIMIT = 10;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [completedFetchKey, setCompletedFetchKey] = useState<string | null>(
    null
  );

  const currentFetchKey = `${page}-${fetchTrigger}`;
  const isLoading = completedFetchKey !== currentFetchKey;

  useEffect(() => {
    const controller = new AbortController();
    const skip = (page - 1) * PAGE_LIMIT;

    taskRepository
      .getAll(PAGE_LIMIT, skip, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setTasks(result.tasks);
        setTotal(result.total);
        setError(null);
        setCompletedFetchKey(currentFetchKey);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Не вдалося завантажити список завдань.'
        );
        setCompletedFetchKey(currentFetchKey);
      });

    return () => {
      controller.abort();
    };
  }, [page, currentFetchKey]);

  const handleSubmitTask = async (
    values: CreateTaskInput,
    editingId?: number
  ) => {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (editingId !== undefined) {
        const current = tasks.find((item) => item.id === editingId);
        const updated = await taskRepository.update(editingId, values, current);
        setTasks((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item))
        );
        setEditingTask(null);
        setFeedbackMessage(`Завдання «${updated.title}» успішно оновлено.`);
      } else {
        const created = await taskRepository.create(values);
        setTasks((prev) => [created, ...prev]);
        setTotal((prev) => prev + 1);
        setFeedbackMessage(`Завдання «${created.title}» успішно створено.`);
      }
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Помилка збереження завдання.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    setBusyTaskId(task.id);
    setFeedbackMessage(null);

    try {
      const updated = await taskRepository.update(
        task.id,
        { completed: !task.completed },
        task
      );
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item))
      );
      setFeedbackMessage(`Статус завдання «${updated.title}» оновлено.`);
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Не вдалося змінити статус.'
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setBusyTaskId(id);
    setFeedbackMessage(null);

    try {
      await taskRepository.delete(id);
      setTasks((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
      if (editingTask?.id === id) {
        setEditingTask(null);
      }
      setFeedbackMessage('Завдання видалено.');
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Не вдалося видалити завдання.'
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const selectedFallbackTask =
    tasks.find((item) => item.id === selectedTaskId) ?? null;

  return (
    <main className="app">
      <Header />

      {feedbackMessage && (
        <p role="status" className="task-stats__item">
          {feedbackMessage}
        </p>
      )}

      <TaskForm
        key={editingTask ? `edit-${editingTask.id}` : 'create'}
        editingTask={editingTask}
        isSubmitting={isSubmitting}
        onSubmitTask={handleSubmitTask}
        onCancelEdit={() => setEditingTask(null)}
      />

      <TaskDetails
        taskId={selectedTaskId}
        fallbackTask={selectedFallbackTask}
        onClose={() => setSelectedTaskId(null)}
      />

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        busyTaskId={busyTaskId}
        onRetry={() => setFetchTrigger((prev) => prev + 1)}
        onToggleTask={handleToggleTask}
        onEditTask={(task) => setEditingTask(task)}
        onDeleteTask={handleDeleteTask}
        onSelectTask={(id) => setSelectedTaskId(id)}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        disabled={isLoading}
        onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />
    </main>
  );
}

export default App;
