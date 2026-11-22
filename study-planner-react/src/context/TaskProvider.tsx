import {
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
import type { Task, TaskFilter } from '../types/task';
import { TaskContext, UNDO_DURATION_MS } from './taskContext';
import type { TaskContextValue, TaskFormValues, ToastMessage } from './taskContext';

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

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
    } catch {
      // Ігноруємо помилки доступу до сховища
    }
  }, [state.tasks]);

  useEffect(() => {
    const activeCount = state.tasks.filter((task) => !task.completed).length;
    document.title = `Study Planner — ${activeCount} active tasks`;
  }, [state.tasks]);

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
