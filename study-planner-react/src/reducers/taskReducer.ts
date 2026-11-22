import type { Task, TaskPriority } from '../types/task';

export const TASKS_STORAGE_KEY = 'study_planner_tasks_v1';

export interface PendingDelete {
  taskId: number;
  taskTitle: string;
}

export interface TaskState {
  tasks: Task[];
  pendingDelete: PendingDelete | null;
}

export type TaskAction =
  | {
      type: 'add';
      payload: {
        title: string;
        description: string;
        category: string;
        priority: TaskPriority;
      };
    }
  | {
      type: 'toggle';
      payload: { id: number };
    }
  | {
      type: 'update';
      payload: {
        id: number;
        title: string;
        description: string;
        category: string;
        priority: TaskPriority;
      };
    }
  | {
      type: 'requestDelete';
      payload: { id: number };
    }
  | {
      type: 'confirmDelete';
      payload: { id: number };
    }
  | {
      type: 'undoDelete';
    }
  | {
      type: 'reset';
      payload: { initialTasks: Task[] };
    };

export function initTaskState(fallbackTasks: Task[]): TaskState {
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      return { tasks: fallbackTasks, pendingDelete: null };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { tasks: fallbackTasks, pendingDelete: null };
    }
    return {
      tasks: parsed as Task[],
      pendingDelete: null,
    };
  } catch {
    return { tasks: fallbackTasks, pendingDelete: null };
  }
}

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add': {
      const nextId =
        state.tasks.length > 0
          ? Math.max(...state.tasks.map((task) => task.id)) + 1
          : 1;

      const newTask: Task = {
        id: nextId,
        title: action.payload.title,
        description: action.payload.description,
        category: action.payload.category,
        priority: action.payload.priority,
        completed: false,
      };

      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case 'toggle': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    }

    case 'update': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                title: action.payload.title,
                description: action.payload.description,
                category: action.payload.category,
                priority: action.payload.priority,
              }
            : task
        ),
      };
    }

    case 'requestDelete': {
      const target = state.tasks.find((task) => task.id === action.payload.id);
      if (!target) {
        return state;
      }

      const remainingTasks =
        state.pendingDelete && state.pendingDelete.taskId !== target.id
          ? state.tasks.filter((task) => task.id !== state.pendingDelete?.taskId)
          : state.tasks;

      return {
        tasks: remainingTasks,
        pendingDelete: {
          taskId: target.id,
          taskTitle: target.title,
        },
      };
    }

    case 'confirmDelete': {
      return {
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
        pendingDelete:
          state.pendingDelete?.taskId === action.payload.id
            ? null
            : state.pendingDelete,
      };
    }

    case 'undoDelete': {
      return {
        ...state,
        pendingDelete: null,
      };
    }

    case 'reset': {
      return {
        tasks: action.payload.initialTasks,
        pendingDelete: null,
      };
    }

    default:
      return state;
  }
}
