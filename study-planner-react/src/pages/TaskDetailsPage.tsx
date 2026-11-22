import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { useAuth } from '../hooks/useAuth';
import { taskRepository } from '../repositories/taskRepository';
import type { TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';
import '../components/TaskDetails/TaskDetails.scss';

export function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuth();

  const numericId = Number(taskId);
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const [completedKey, setCompletedKey] = useState<string | null>(null);

  const requestKey = isValidId ? `${numericId}-${retryTick}` : null;
  const isLoading = requestKey !== null && completedKey !== requestKey;

  useEffect(() => {
    if (!isValidId || requestKey === null) {
      return;
    }

    const controller = new AbortController();

    taskRepository
      .getById(numericId, controller.signal)
      .then((fetched) => {
        if (controller.signal.aborted) {
          return;
        }
        setTask(fetched);
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
          err instanceof Error ? err.message : 'Не вдалося отримати завдання.'
        );
        setCompletedKey(requestKey);
      });

    return () => {
      controller.abort();
    };
  }, [isValidId, numericId, requestKey]);

  const handleOpenEdit = () => {
    if (!isAuthenticated) {
      void navigate('/login');
      return;
    }
    setFeedback(null);
    setIsEditOpen(true);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!task || !isAuthenticated || !accessToken) {
      void navigate('/login');
      return;
    }

    const updated = await taskRepository.update(
      task.id,
      data,
      accessToken,
      task
    );
    setTask(updated);
    setIsEditOpen(false);
    setFeedback(`Завдання «${updated.title}» оновлено.`);
  };

  if (!isValidId) {
    return (
      <section className="task-details">
        <p className="task-details__error">Некоректний ідентифікатор завдання.</p>
        <Link to="/tasks">Повернутися до списку</Link>
      </section>
    );
  }

  return (
    <section className="task-details" aria-label="Деталі завдання">
      <div className="task-details__header">
        <h2 className="task-details__title">Завдання #{numericId}</h2>
        <div className="task-item__actions">
          <button
            type="button"
            className="task-item__btn"
            onClick={handleOpenEdit}
          >
            Редагувати
          </button>
          <Link className="task-details__close" to="/tasks">
            Назад до списку
          </Link>
        </div>
      </div>

      {feedback && (
        <p role="status" className="task-stats__item">
          {feedback}
        </p>
      )}

      {isLoading && <p className="task-details__status">Loading...</p>}

      {!isLoading && error && (
        <div>
          <p className="task-details__error">Помилка завантаження: {error}</p>
          <button
            type="button"
            className="task-details__retry"
            onClick={() => setRetryTick((prev) => prev + 1)}
          >
            Спробувати ще
          </button>
        </div>
      )}

      {!isLoading && !error && task && (
        <div className="task-details__meta">
          <p>
            <strong>Назва:</strong> {task.title}
          </p>
          <p>
            <strong>Опис:</strong> {task.description || '—'}
          </p>
          <p>
            <strong>Категорія:</strong> {task.category}
          </p>
          <p>
            <strong>Пріоритет:</strong> {task.priority}
          </p>
          <p>
            <strong>Стан виконання:</strong>{' '}
            {task.completed ? 'Виконано' : 'Не виконано'}
          </p>
          <p>
            <strong>Створив (client-owned metadata):</strong> {task.createdBy}
          </p>
          <p>
            <strong>Дата створення (client-owned metadata):</strong>{' '}
            {task.createdAt}
          </p>
        </div>
      )}

      {task && (
        <TaskFormDialog
          open={isEditOpen}
          mode="edit"
          task={task}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleUpdateTask}
        />
      )}
    </section>
  );
}
