import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { TaskPriority } from '../types/task';
import './TaskForm.scss';

function TaskForm() {
  const { addTask, updateTask, editingTask, cancelEditingTask } =
    useTaskContext();

  const [title, setTitle] = useState(() => editingTask?.title ?? '');
  const [description, setDescription] = useState(
    () => editingTask?.description ?? ''
  );
  const [category, setCategory] = useState(
    () => editingTask?.category ?? 'React'
  );
  const [priority, setPriority] = useState<TaskPriority>(
    () => editingTask?.priority ?? 'medium'
  );
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Назва завдання є обовʼязковою.');
      return;
    }

    const formData = {
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || 'Загальне',
      priority,
    };

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
      setTitle('');
      setDescription('');
      setCategory('React');
      setPriority('medium');
    }

    setError('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <h2 className="task-form__heading">
        {editingTask ? 'Редагування завдання' : 'Нове завдання'}
      </h2>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-title">
          Назва *
        </label>
        <input
          className="task-form__input"
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) {
              setError('');
            }
          }}
          placeholder="Наприклад, Повторити hooks"
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-description">
          Опис
        </label>
        <textarea
          className="task-form__textarea"
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Короткий опис завдання"
          rows={2}
        />
      </div>

      <div className="task-form__row">
        <div className="task-form__field">
          <label className="task-form__label" htmlFor="task-category">
            Категорія
          </label>
          <input
            className="task-form__input"
            id="task-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="React, TypeScript, Алгоритми..."
          />
        </div>

        <div className="task-form__field">
          <label className="task-form__label" htmlFor="task-priority">
            Пріоритет
          </label>
          <select
            className="task-form__select"
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="task-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="task-form__actions">
        <button className="task-form__submit" type="submit">
          {editingTask ? 'Зберегти зміни' : 'Додати'}
        </button>

        {editingTask && (
          <button
            type="button"
            className="task-form__cancel"
            onClick={cancelEditingTask}
          >
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
