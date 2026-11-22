import { useState } from 'react';
import Header from './components/Header';
import TaskFilters from './components/TaskFilters';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import { initialTasks } from './data/initialTasks';
import type { Task, TaskFilter, TaskPriority } from './types/task';
import './index.scss';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');

  const handleAddTask = (newTaskData: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
  }) => {
    const nextId =
      tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

    const newTask: Task = {
      id: nextId,
      title: newTaskData.title,
      description: newTaskData.description,
      category: newTaskData.category,
      priority: newTaskData.priority,
      completed: false,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleToggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'completed') {
      return task.completed;
    }
    if (filter === 'active') {
      return !task.completed;
    }
    return true;
  });

  return (
    <main className="app">
      <Header />
      <TaskForm onAddTask={handleAddTask} />
      <TaskStats tasks={tasks} />
      <TaskFilters activeFilter={filter} onFilterChange={setFilter} />
      <TaskList
        tasks={visibleTasks}
        totalTasksCount={tasks.length}
        activeFilter={filter}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </main>
  );
}

export default App;
