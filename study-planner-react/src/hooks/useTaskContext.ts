import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import type { TaskContextValue } from '../context/TaskContext';

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext повинен використовуватися всередині TaskProvider.');
  }
  return context;
}
