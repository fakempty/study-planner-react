import { Outlet, createBrowserRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AUTH_TOKEN_STORAGE_KEY } from './context/authContext';
import { AuthProvider } from './context/AuthProvider';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { TasksPage } from './pages/TasksPage';
import './index.scss';

function requireUserLoader() {
  const token = window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) {
    throw redirect('/login');
  }
  return null;
}

const router = createBrowserRouter([
  {
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    children: [
      {
        path: '/',
        loader: () => redirect('/tasks'),
      },
      {
        path: '/tasks',
        element: <TasksPage />,
      },
      {
        path: '/tasks/:taskId',
        element: <TaskDetailsPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/profile',
        loader: requireUserLoader,
        element: <ProfilePage />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
