import Header from './components/Header';
import TaskFilters from './components/TaskFilters';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import Toast from './components/Toast';
import { TaskProvider } from './context/TaskProvider';
import { useTaskContext } from './hooks/useTaskContext';
import './index.scss';

function PlannerWorkspace() {
  const { editingTask, toast } = useTaskContext();

  return (
    <>
      <main className="app">
        <Header />
        <TaskForm key={editingTask ? `edit-${editingTask.id}` : 'create'} />
        <TaskStats />
        <TaskFilters />
        <TaskList />
      </main>
      <Toast key={toast ? `toast-${toast.id}` : 'toast-empty'} />
    </>
  );
}

function App() {
  return (
    <TaskProvider>
      <PlannerWorkspace />
    </TaskProvider>
  );
}

export default App;
