import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { taskFormSchema } from '../schemas/taskSchema';
import type { TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';
import '../components/TaskForm.scss';
import '../layouts/AppLayout.scss';

export interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  task?: Task;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
}

export function TaskFormDialog({
  open,
  mode,
  task,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === 'edit' && task) {
      reset({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'General',
        priority: 'medium',
      });
    }

    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, mode, task, reset, onClose, isSubmitting]);

  if (!open) {
    return null;
  }

  const { ref: registerTitleRef, ...titleRegisterProps } = register('title');

  return (
    <div
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-dialog-title"
    >
      <div className="dialog-panel">
        <div className="dialog-panel__header">
          <h2 id="task-dialog-title" className="dialog-panel__title">
            {mode === 'edit' ? 'Редагувати завдання' : 'Створити завдання'}
          </h2>
          <button
            type="button"
            className="dialog-panel__close"
            aria-label="Закрити діалог"
            disabled={isSubmitting}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className="task-form"
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
          })}
          noValidate
        >
          <div className="task-form__field">
            <label className="task-form__label" htmlFor="dialog-task-title">
              Назва *
            </label>
            <input
              id="dialog-task-title"
              type="text"
              className="task-form__input"
              disabled={isSubmitting}
              ref={(element) => {
                registerTitleRef(element);
                titleInputRef.current = element;
              }}
              {...titleRegisterProps}
            />
            {errors.title && (
              <p className="task-form__error" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="task-form__field">
            <label className="task-form__label" htmlFor="dialog-task-desc">
              Опис
            </label>
            <textarea
              id="dialog-task-desc"
              rows={2}
              className="task-form__textarea"
              disabled={isSubmitting}
              {...register('description')}
            />
          </div>

          <div className="task-form__row">
            <div className="task-form__field">
              <label className="task-form__label" htmlFor="dialog-task-cat">
                Категорія *
              </label>
              <input
                id="dialog-task-cat"
                type="text"
                className="task-form__input"
                disabled={isSubmitting}
                {...register('category')}
              />
              {errors.category && (
                <p className="task-form__error" role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="task-form__field">
              <label className="task-form__label" htmlFor="dialog-task-prio">
                Пріоритет
              </label>
              <select
                id="dialog-task-prio"
                className="task-form__select"
                disabled={isSubmitting}
                {...register('priority')}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>

          <div className="task-form__actions">
            <button
              type="submit"
              className="task-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </button>
            <button
              type="button"
              className="task-form__cancel"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
