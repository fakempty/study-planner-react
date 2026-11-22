import { useCallback, useEffect, useState } from 'react';
import { taskRepository } from '../../repositories/taskRepository';
import type { Task } from '../../types/task';
import './TaskDetails.scss';

interface TaskDetailsProps {
  taskId: number | null;
  fallbackTask: Task | null;
  onClose: () => void;
}

export function TaskDetails({
  taskId,
  fallbackTask,
  onClose,
}: TaskDetailsProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const loadDetails = useCallback(
    async (id: number, signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const fetched = await taskRepository.getById(id, signal);
        setDetailTask({
          ...fetched,
          description: fallbackTask?.description || fetched.description,
          category: fallbackTask?.category || fetched.category,
          priority: fallbackTask?.priority || fetched.priority,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (fallbackTask) {
          setDetailTask(fallbackTask);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'Не вдалося завантажити деталі завдання.'
          );
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [fallbackTask]
  );

  useEffect(() => {
    if (taskId === null) {
      return;
    }

    const controller = new AbortController();
    void loadDetails(taskId, controller.signal);

    return () => {
      controller.abort();
    };
  }, [taskId, reloadCounter, loadDetails]);

  if (taskId === null) {
    return null;
  }

  return (
    <section className="task-details" aria-label="Деталі завдання">
      <div className="task-details__header">
        <h2 className="task-details__title">Деталі завдання #{taskId}</h2>
        <button
          type="button"
          className="task-details__close"
          onClick={onClose}
        >
          Закрити
        </button>
      </div>

      {isLoading && <p className="task-details__status">Loading...</p>}

      {!isLoading && error && (
        <div>
          <p className="task-details__error">Помилка завантаження: {error}</p>
          <button
            type="button"
            className="task-details__retry"
            onClick={() => setReloadCounter((prev) => prev + 1)}
          >
            Спробувати ще
          </button>
        </div>
      )}

      {!isLoading && !error && detailTask && (
        <div className="task-details__meta">
          <p>
            <strong>Назва:</strong> {detailTask.title}
          </p>
          <p>
            <strong>Опис:</strong> {detailTask.description || '—'}
          </p>
          <p>
            <strong>Категорія:</strong> {detailTask.category}
          </p>
          <p>
            <strong>Пріоритет:</strong> {detailTask.priority}
          </p>
          <p>
            <strong>Стан виконання:</strong>{' '}
            {detailTask.completed ? 'Виконано' : 'Не виконано'}
          </p>
        </div>
      )}
    </section>
  );
}
