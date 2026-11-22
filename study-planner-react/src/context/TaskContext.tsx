import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { initialTasks } from '../data/initialTasks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  initTaskState,
  taskReducer,
  TASKS_STORAGE_KEY,
} from '../reducers/taskReducer';
import type { PendingDelete } from '../reducers/taskReducer';
import type { Task, TaskFilter, TaskPriority } from '../types/task';

export const UNDO_DURATION_MS = 5000;

export interface ToastMessage {
  id: number;
  text: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  undoable?: boolean;
}

interface TaskFormValues {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
}

export interface TaskContextValue {
  tasks: Task[];
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  editingTask: Task | null;
  startEditingTask: (task: Task) => void;
  cancelEditingTask: () => void;
  addTask: (values: TaskFormValues) => void;
  updateTask: (id: number, values: TaskFormValues) => void;
  toggleTask: (id: number) => void;
  requestDelete: (id: number) => void;
  undoDelete: () => void;
  resetTasks: () => void;
  pendingDelete: PendingDelete | null;
  toast: ToastMessage | null;
  dismissToast: () => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(
    taskReducer,
    initialTasks,
    initTaskState
  );
  const [filter, setFilter] = useLocalStorage<TaskFilter>(
    'study_planner_filter_v1',
    'all'
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (
      text: string,
      variant: ToastMessage['variant'] = 'info',
      undoable = false
    ) => {
      setToast({
        id: Date.now() + Math.random(),
        text,
        variant,
        undoable,
      });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Синхронізація tasks у localStorage (єдине джерело правди — state.tasks)
  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
    } catch {
      showToast('Не вдалося зберегти завдання у localStorage.', 'error');
    }
  }, [state.tasks, showToast]);

  // Синхронізація document.title з кількістю невиконаних завдань
  useEffect(() => {
    const activeCount = state.tasks.filter((task) => !task.completed).length;
    document.title = `Study Planner — ${activeCount} active tasks`;
  }, [state.tasks]);

  // Таймер 5 секунд для Undoable Delete з обов'язковим очищенням через clearTimeout
  useEffect(() => {
    if (!state.pendingDelete) {
      return;
    }

    const { taskId, taskTitle } = state.pendingDelete;
    const timerId = window.setTimeout(() => {
      dispatch({ type: 'confirmDelete', payload: { id: taskId } });
      showToast(`Завдання «${taskTitle}» видалено остаточно.`, 'warning');
    }, UNDO_DURATION_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [state.pendingDelete, showToast]);

  // Автоматичне приховування звичайних (не undo) toast-повідомлень
  useEffect(() => {
    if (!toast || toast.undoable) {
      return;
    }

    const hideId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(hideId);
    };
  }, [toast]);

  const addTask = useCallback(
    (values: TaskFormValues) => {
      dispatch({ type: 'add', payload: values });
      showToast(`Завдання «${values.title}» додано.`, 'success');
    },
    [showToast]
  );

  const updateTask = useCallback(
    (id: number, values: TaskFormValues) => {
      dispatch({ type: 'update', payload: { id, ...values } });
      setEditingTask(null);
      showToast(`Завдання «${values.title}» оновлено.`, 'success');
    },
    [showToast]
  );

  const toggleTask = useCallback((id: number) => {
    dispatch({ type: 'toggle', payload: { id } });
  }, []);

  const requestDelete = useCallback(
    (id: number) => {
      const target = state.tasks.find((task) => task.id === id);
      if (!target) {
        showToast('Завдання не знайдено.', 'error');
        return;
      }

      if (editingTask?.id === id) {
        setEditingTask(null);
      }

      dispatch({ type: 'requestDelete', payload: { id } });
      showToast(
        `Завдання «${target.title}» буде видалено через 5 с.`,
        'warning',
        true
      );
    },
    [state.tasks, editingTask, showToast]
  );

  const undoDelete = useCallback(() => {
    dispatch({ type: 'undoDelete' });
    showToast('Видалення скасовано.', 'info');
  }, [showToast]);

  const resetTasks = useCallback(() => {
    dispatch({ type: 'reset', payload: { initialTasks } });
    setEditingTask(null);
    showToast('Дані скинуто до початкового списку.', 'info');
  }, [showToast]);

  const startEditingTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const cancelEditingTask = useCallback(() => {
    setEditingTask(null);
  }, []);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks: state.tasks,
      filter,
      setFilter,
      editingTask,
      startEditingTask,
      cancelEditingTask,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      resetTasks,
      pendingDelete: state.pendingDelete,
      toast,
      dismissToast,
    }),
    [
      state.tasks,
      state.pendingDelete,
      filter,
      setFilter,
      editingTask,
      startEditingTask,
      cancelEditingTask,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      resetTasks,
      toast,
      dismissToast,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
