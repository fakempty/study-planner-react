import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TaskPriority } from '../types/task';

interface TaskFormProps {
  onAddTask: (taskData: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
  }) => void;
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('React');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Назва завдання є обовʼязковою.');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || 'Загальне',
      priority,
    });

    setTitle('');
    setDescription('');
    setCategory('React');
    setPriority('medium');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="task-title">Назва *</label>
        <input
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

      <div>
        <label htmlFor="task-description">Опис</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Короткий опис завдання"
          rows={2}
        />
      </div>

      <div>
        <label htmlFor="task-category">Категорія</label>
        <input
          id="task-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="React, TypeScript, Алгоритми..."
        />
      </div>

      <div>
        <label htmlFor="task-priority">Пріоритет</label>
        <select
          id="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit">Додати</button>
    </form>
  );
}

export default TaskForm;
