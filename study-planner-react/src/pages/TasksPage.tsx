import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import Pagination from '../components/Pagination';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { useAuth } from '../hooks/useAuth';
import { taskRepository } from '../repositories/taskRepository';
import type { TaskFormData } from '../schemas/taskSchema';
import type { Task, TaskPriority } from '../types/task';
import '../components/TaskList.scss';
import '../components/TaskItem.scss';
import '../layouts/AppLayout.scss';

const PAGE_LIMIT = 10;
const UNDO_DELAY_MS = 4000;

interface PendingDeleteState {
  task: Task;
  index: number;
  timerId: number;
}

export function TasksPage() {
  const { isAuthenticated, accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get('status') ?? 'all';
  const priorityParam = searchParams.get('priority') ?? 'all';

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const [completedKey, setCompletedKey] = useState<string | null>(null);

  const pendingDeleteRef = useRef<PendingDeleteState | null>(null);

  useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  const requestKey = `fetch-${retryTick}`;
  const isLoading = completedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    taskRepository
      .getAll(0, 0, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) {
          return;
        }
        setAllTasks(res.tasks);
        setError(null);
        setCompletedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Помилка завантаження завдань.'
        );
        setCompletedKey(requestKey);
      });

    return () => {
      controller.abort();
    };
  }, [requestKey]);

  useEffect(() => {
    return () => {
      if (pendingDeleteRef.current) {
        window.clearTimeout(pendingDeleteRef.current.timerId);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const updateFilterParam = (key: 'status' | 'priority', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
    setPage(1);
  };

  const handleOpenCreateDialog = () => {
    if (!isAuthenticated) {
      void navigate('/login');
      return;
    }
    setFeedback(null);
    setIsDialogOpen(true);
  };

  const handleCreateTask = async (data: TaskFormData) => {
    if (!isAuthenticated || !accessToken) {
      void navigate('/login');
      return;
    }

    try {
      const created = await taskRepository.create(
        {
          ...data,
          createdBy: user?.username ?? 'authenticated-user',
        },
        accessToken
      );

      setAllTasks((prev) => [created, ...prev]);
      setIsDialogOpen(false);
      const msg = `Завдання «${created.title}» створено (пріоритет: ${created.priority}).`;
      setFeedback(msg);
      showToast(msg);
    } catch (err) {
      setIsDialogOpen(false);
      setFeedback(
        err instanceof Error ? err.message : 'Не вдалося створити завдання.'
      );
    }
  };

  const handleToggleCompleted = async (task: Task) => {
    if (!isAuthenticated || !accessToken) {
      void navigate('/login');
      return;
    }

    setBusyTaskId(task.id);
    setFeedback(null);

    try {
      const updated = await taskRepository.update(
        task.id,
        { completed: !task.completed },
        accessToken,
        task
      );
      setAllTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item))
      );
      const msg = `Статус «${updated.title}» оновлено.`;
      setFeedback(msg);
      showToast(msg);
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Не вдалося оновити завдання.'
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleRequestDeleteTask = (task: Task) => {
    if (!isAuthenticated || !accessToken) {
      void navigate('/login');
      return;
    }

    setFeedback(null);

    if (pendingDelete) {
      window.clearTimeout(pendingDelete.timerId);
      const prevTask = pendingDelete.task;
      void taskRepository.delete(prevTask.id, accessToken).catch(() => {});
      setPendingDelete(null);
    }

    const index = allTasks.findIndex((item) => item.id === task.id);
    setAllTasks((prev) => prev.filter((item) => item.id !== task.id));

    const timerId = window.setTimeout(() => {
      setPendingDelete(null);
      void taskRepository
        .delete(task.id, accessToken)
        .then(() => {
          const msg = `Завдання «${task.title}» видалено.`;
          setFeedback(msg);
          showToast(msg);
        })
        .catch((err: unknown) => {
          setAllTasks((prev) => {
            if (prev.some((item) => item.id === task.id)) {
              return prev;
            }
            const copy = [...prev];
            copy.splice(Math.max(0, Math.min(index, copy.length)), 0, task);
            return copy;
          });
          setFeedback(
            err instanceof Error ? err.message : 'Не вдалося видалити завдання.'
          );
        });
    }, UNDO_DELAY_MS);

    setPendingDelete({ task, index, timerId });
    setToastMessage(
      `Завдання «${task.title}» буде видалено через 4 с.`
    );
  };

  const handleUndoDelete = () => {
    if (!pendingDelete) {
      return;
    }
    window.clearTimeout(pendingDelete.timerId);
    const { task, index } = pendingDelete;
    setPendingDelete(null);
    setToastMessage(null);
    setAllTasks((prev) => {
      if (prev.some((item) => item.id === task.id)) {
        return prev;
      }
      const copy = [...prev];
      copy.splice(Math.max(0, Math.min(index, copy.length)), 0, task);
      return copy;
    });
    setFeedback(`Видалення «${task.title}» скасовано.`);
  };

  const completedCount = allTasks.filter((t) => t.completed).length;
  const activeCount = allTasks.length - completedCount;

  const filteredTasks = allTasks.filter((task) => {
    if (statusParam === 'completed' && !task.completed) {
      return false;
    }
    if (statusParam === 'active' && task.completed) {
      return false;
    }
    if (
      priorityParam !== 'all' &&
      task.priority !== (priorityParam as TaskPriority)
    ) {
      return false;
    }
    return true;
  });

  const totalFiltered = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_LIMIT;
  const visibleTasks = filteredTasks.slice(pageStart, pageStart + PAGE_LIMIT);
  const hasActiveFilter = statusParam !== 'all' || priorityParam !== 'all';

  return (
    <section aria-label="Список завдань">
      <div className="query-toolbar__top">
        <h2>Завдання</h2>
        <button
          type="button"
          className="query-toolbar__create-btn"
          onClick={handleOpenCreateDialog}
        >
          + Нове завдання
        </button>
      </div>

      <div className="task-stats">
        <span className="task-stats__item">Усього: {allTasks.length}</span>
        <span className="task-stats__item">Виконано: {completedCount}</span>
        <span className="task-stats__item">Не виконано: {activeCount}</span>
      </div>

      {feedback && (
        <p role="status" className="task-stats__item">
          {feedback}
        </p>
      )}

      <div className="query-toolbar">
        <label>
          Статус:{' '}
          <select
            value={statusParam}
            onChange={(e) => updateFilterParam('status', e.target.value)}
          >
            <option value="all">Усі</option>
            <option value="active">Не виконані</option>
            <option value="completed">Виконані</option>
          </select>
        </label>

        <label>
          Пріоритет:{' '}
          <select
            value={priorityParam}
            onChange={(e) => updateFilterParam('priority', e.target.value)}
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
            onClick={resetFilters}
          >
            Скинути фільтри
          </button>
        )}
      </div>

      {isLoading && <p className="task-list__empty">Loading...</p>}

      {!isLoading && error && (
        <div className="task-list__empty">
          <p>Помилка завантаження: {error}</p>
          <button type="button" onClick={() => setRetryTick((prev) => prev + 1)}>
            Спробувати ще
          </button>
        </div>
      )}

      {!isLoading && !error && visibleTasks.length === 0 && (
        <div className="task-list__empty">
          <p>Завдань не знайдено.</p>
          {hasActiveFilter && (
            <button
              type="button"
              className="task-item__btn"
              onClick={resetFilters}
            >
              Показати усі
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && visibleTasks.length > 0 && (
        <ul className="task-list">
          {visibleTasks.map((task) => {
            const isBusy = busyTaskId === task.id;
            const itemClass = task.completed
              ? 'task-item task-item--completed'
              : 'task-item';

            return (
              <li key={task.id} className={itemClass}>
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
                    <span>Автор: {task.createdBy}</span>
                  </div>
                </div>

                <div className="task-item__actions">
                  <Link className="task-item__btn" to={`/tasks/${task.id}`}>
                    Деталі
                  </Link>

                  <button
                    type="button"
                    className="task-item__btn"
                    disabled={isBusy}
                    onClick={() => void handleToggleCompleted(task)}
                  >
                    {task.completed ? 'Не виконано' : 'Виконано'}
                  </button>

                  <button
                    type="button"
                    className="task-item__btn task-item__btn--danger"
                    disabled={isBusy}
                    onClick={() => handleRequestDeleteTask(task)}
                  >
                    Видалити
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalFiltered}
        disabled={isLoading}
        onPrevPage={() => setPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />

      <TaskFormDialog
        open={isDialogOpen}
        mode="create"
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateTask}
      />

      {toastMessage && (
        <div
          role="status"
          style={{
            position: 'fixed',
            right: '1.25rem',
            bottom: '1.25rem',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
          }}
        >
          <span>{toastMessage}</span>
          {pendingDelete && (
            <button
              type="button"
              className="task-item__btn"
              onClick={handleUndoDelete}
            >
              Скасувати
            </button>
          )}
          <button
            type="button"
            className="task-item__btn"
            aria-label="Закрити сповіщення"
            onClick={() => setToastMessage(null)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
