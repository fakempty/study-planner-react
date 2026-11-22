import { httpClient } from '../api/httpClient';
import type { Task, TaskPriority } from '../types/task';

interface ApiTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

interface TodosResponse {
  todos: ApiTodo[];
  total: number;
  skip: number;
  limit: number;
}

export interface PaginatedTasksResult {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  completed?: boolean;
}

const clientMetadataMap = new Map<
  number,
  { description: string; category: string; priority: TaskPriority }
>();

function inferPriorityFromId(id: number): TaskPriority {
  const remainder = Math.abs(id) % 3;
  if (remainder === 0) {
    return 'high';
  }
  if (remainder === 1) {
    return 'low';
  }
  return 'medium';
}

function toTask(apiTodo: ApiTodo): Task {
  const meta = clientMetadataMap.get(apiTodo.id);
  return {
    id: apiTodo.id,
    title: apiTodo.todo,
    description: meta?.description ?? '',
    completed: apiTodo.completed,
    priority: meta?.priority ?? inferPriorityFromId(apiTodo.id),
    category: meta?.category ?? 'General',
  };
}

export const taskRepository = {
  async getAll(
    limit: number,
    skip: number,
    signal?: AbortSignal
  ): Promise<PaginatedTasksResult> {
    const data = await httpClient<TodosResponse>(
      `/todos?limit=${limit}&skip=${skip}`,
      { signal }
    );

    return {
      tasks: data.todos.map(toTask),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    };
  },

  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    const apiTodo = await httpClient<ApiTodo>(`/todos/${id}`, { signal });
    return toTask(apiTodo);
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const created = await httpClient<ApiTodo>('/todos/add', {
      method: 'POST',
      body: {
        todo: input.title,
        completed: false,
        userId: 1,
      },
    });

    const uniqueId = created.id ?? Date.now();
    clientMetadataMap.set(uniqueId, {
      description: input.description,
      category: input.category,
      priority: input.priority,
    });

    return {
      id: uniqueId,
      title: input.title,
      description: input.description,
      completed: Boolean(created.completed),
      priority: input.priority,
      category: input.category,
    };
  },

  async update(
    id: number,
    input: UpdateTaskInput,
    currentTask?: Task
  ): Promise<Task> {
    const nextTitle = input.title ?? currentTask?.title ?? '';
    const nextCompleted = input.completed ?? currentTask?.completed ?? false;
    const nextDescription =
      input.description ?? currentTask?.description ?? '';
    const nextCategory = input.category ?? currentTask?.category ?? 'General';
    const nextPriority =
      input.priority ?? currentTask?.priority ?? inferPriorityFromId(id);

    clientMetadataMap.set(id, {
      description: nextDescription,
      category: nextCategory,
      priority: nextPriority,
    });

    if (id <= 254) {
      await httpClient<ApiTodo>(`/todos/${id}`, {
        method: 'PATCH',
        body: {
          todo: nextTitle,
          completed: nextCompleted,
        },
      });
    }

    return {
      id,
      title: nextTitle,
      description: nextDescription,
      completed: nextCompleted,
      priority: nextPriority,
      category: nextCategory,
    };
  },

  async delete(id: number): Promise<void> {
    if (id <= 254) {
      await httpClient<ApiTodo>(`/todos/${id}`, {
        method: 'DELETE',
      });
    }
    clientMetadataMap.delete(id);
  },
};
