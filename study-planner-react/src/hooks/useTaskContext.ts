import { useContext } from 'react';
import { TaskContext } from '../context/taskContext';
import type { TaskContextValue } from '../context/taskContext';

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext повинен використовуватися всередині TaskProvider.');
  }
  return context;
}
