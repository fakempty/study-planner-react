import { createContext } from 'react';
import type { PendingDelete } from '../reducers/taskReducer';
import type { Task, TaskFilter, TaskPriority } from '../types/task';

export const UNDO_DURATION_MS = 5000;

export interface ToastMessage {
  id: number;
  text: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  undoable?: boolean;
}

export interface TaskFormValues {
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
