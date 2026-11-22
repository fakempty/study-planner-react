import Header from './components/Header';
import TaskFilters from './components/TaskFilters';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import Toast from './components/Toast';
import { TaskProvider } from './context/TaskContext';
import './index.scss';

function App() {
  return (
    <TaskProvider>
      <main className="app">
        <Header />
        <TaskForm />
        <TaskStats />
        <TaskFilters />
        <TaskList />
      </main>
      <Toast />
    </TaskProvider>
  );
}

export default App;
