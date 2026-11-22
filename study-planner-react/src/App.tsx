import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Pagination from './components/Pagination';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { TaskDetails } from './components/TaskDetails/TaskDetails';
import { taskRepository } from './repositories/taskRepository';
import type { CreateTaskInput } from './repositories/taskRepository';
import type { Task, TaskPriority } from './types/task';
import './index.scss';

const PAGE_LIMIT = 10;
const TOAST_DURATION_MS = 4500;

interface PendingDeleteState {
  task: Task;
  index: number;
  timerId: number;
}

interface ToastState {
  id: number;
  message: string;
  canUndo: boolean;
}

function App() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [progress, setProgress] = useState(100);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [completedFetchKey, setCompletedFetchKey] = useState<string | null>(null);

  const pendingDeleteRef = useRef<PendingDeleteState | null>(null);
  const toastSeqRef = useRef(0);

  useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  const currentFetchKey = `fetch-${fetchTrigger}`;
  const isLoading = completedFetchKey !== currentFetchKey;

  useEffect(() => {
    const controller = new AbortController();

    taskRepository
      .getAll(0, 0, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setAllTasks(result.tasks);
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
  }, [currentFetchKey]);

  useEffect(() => {
    return () => {
      if (pendingDeleteRef.current) {
        window.clearTimeout(pendingDeleteRef.current.timerId);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const startTime = performance.now();
    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100);
      setProgress(remainingPct);
    }, 50);

    const dismissId = window.setTimeout(() => {
      setToast(null);
      setProgress(100);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(dismissId);
    };
  }, [toast]);

  const triggerToast = (message: string, canUndo: boolean) => {
    toastSeqRef.current += 1;
    setProgress(100);
    setToast({
      id: toastSeqRef.current,
      message,
      canUndo,
    });
  };

  const dismissToast = () => {
    setToast(null);
    setProgress(100);
  };

  const handleSubmitTask = async (
    values: CreateTaskInput,
    editingId?: number
  ) => {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (editingId !== undefined) {
        const current = allTasks.find((item) => item.id === editingId);
        const updated = await taskRepository.update(editingId, values, current);
        setAllTasks((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item))
        );
        setEditingTask(null);
        const msg = `Завдання «${updated.title}» успішно оновлено.`;
        setFeedbackMessage(msg);
        triggerToast(msg, false);
      } else {
        const created = await taskRepository.create(values);
        setAllTasks((prev) => [created, ...prev]);
        const msg = `Завдання «${created.title}» успішно створено.`;
        setFeedbackMessage(msg);
        triggerToast(msg, false);
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
      setAllTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item))
      );
      const msg = `Статус завдання «${updated.title}» оновлено.`;
      setFeedbackMessage(msg);
      triggerToast(msg, false);
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : 'Не вдалося змінити статус.'
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleRequestDeleteTask = (id: number) => {
    const targetTask = allTasks.find((item) => item.id === id);
    if (!targetTask) {
      return;
    }

    setFeedbackMessage(null);

    if (pendingDelete) {
      window.clearTimeout(pendingDelete.timerId);
      const prevTask = pendingDelete.task;
      void taskRepository.delete(prevTask.id).catch(() => {});
      setPendingDelete(null);
    }

    const index = allTasks.findIndex((item) => item.id === id);
    setAllTasks((prev) => prev.filter((item) => item.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
    }
    if (editingTask?.id === id) {
      setEditingTask(null);
    }

    const timerId = window.setTimeout(() => {
      setPendingDelete(null);
      dismissToast();
      void taskRepository
        .delete(id)
        .then(() => {
          setFeedbackMessage(`Завдання «${targetTask.title}» видалено.`);
        })
        .catch((err: unknown) => {
          setAllTasks((prev) => {
            if (prev.some((item) => item.id === id)) {
              return prev;
            }
            const copy = [...prev];
            copy.splice(Math.max(0, Math.min(index, copy.length)), 0, targetTask);
            return copy;
          });
          setFeedbackMessage(
            err instanceof Error ? err.message : 'Не вдалося видалити завдання.'
          );
        });
    }, TOAST_DURATION_MS);

    setPendingDelete({ task: targetTask, index, timerId });
    triggerToast(
      `Завдання «${targetTask.title}» буде видалено через 4.5 с.`,
      true
    );
  };

  const handleUndoDelete = () => {
    if (!pendingDelete) {
      return;
    }
    window.clearTimeout(pendingDelete.timerId);
    const { task, index } = pendingDelete;
    setPendingDelete(null);
    dismissToast();
    setAllTasks((prev) => {
      if (prev.some((item) => item.id === task.id)) {
        return prev;
      }
      const copy = [...prev];
      copy.splice(Math.max(0, Math.min(index, copy.length)), 0, task);
      return copy;
    });
    const msg = `Видалення «${task.title}» скасовано.`;
    setFeedbackMessage(msg);
    triggerToast(msg, false);
  };

  const filteredTasks = allTasks.filter((task) => {
    if (statusFilter === 'completed' && !task.completed) {
      return false;
    }
    if (statusFilter === 'active' && task.completed) {
      return false;
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const totalFiltered = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_LIMIT;
  const visibleTasks = filteredTasks.slice(pageStart, pageStart + PAGE_LIMIT);
  const hasActiveFilter = statusFilter !== 'all' || priorityFilter !== 'all';

  const selectedFallbackTask =
    allTasks.find((item) => item.id === selectedTaskId) ?? null;

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

      <div className="query-toolbar">
        <label>
          Статус:{' '}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'completed');
              setPage(1);
            }}
          >
            <option value="all">Усі</option>
            <option value="active">Не виконані</option>
            <option value="completed">Виконані</option>
          </select>
        </label>

        <label>
          Пріоритет:{' '}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as 'all' | TaskPriority);
              setPage(1);
            }}
          >
            <option value="all">Усі</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>

        {hasActiveFilter && (
          <button
            type="button"
            className="task-item__btn"
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setPage(1);
            }}
          >
            Скинути фільтри
          </button>
        )}
      </div>

      <TaskDetails
        taskId={selectedTaskId}
        fallbackTask={selectedFallbackTask}
        onClose={() => setSelectedTaskId(null)}
      />

      <TaskList
        tasks={visibleTasks}
        isLoading={isLoading}
        error={error}
        busyTaskId={busyTaskId}
        onRetry={() => setFetchTrigger((prev) => prev + 1)}
        onToggleTask={handleToggleTask}
        onEditTask={(task) => setEditingTask(task)}
        onDeleteTask={handleRequestDeleteTask}
        onSelectTask={(id) => setSelectedTaskId(id)}
      />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalFiltered}
        disabled={isLoading}
        onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            right: '1.25rem',
            bottom: '1.25rem',
            minWidth: '300px',
            maxWidth: '420px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '0.6rem',
            overflow: 'hidden',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '0.8rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.92rem', lineHeight: 1.35 }}>
              {toast.message}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {toast.canUndo && pendingDelete && (
                <button
                  type="button"
                  style={{
                    backgroundColor: '#f59e0b',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.35rem 0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={handleUndoDelete}
                >
                  Скасувати
                </button>
              )}
              <button
                type="button"
                aria-label="Закрити сповіщення"
                style={{
                  background: 'transparent',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                }}
                onClick={dismissToast}
              >
                ×
              </button>
            </div>
          </div>
          <div
            style={{
              height: '4px',
              width: '100%',
              backgroundColor: 'rgba(148, 163, 184, 0.25)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#f59e0b',
                transition: 'width 50ms linear',
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
