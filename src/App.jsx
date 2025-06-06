import { ToastContainer } from 'react-toastify';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import LayoutSidebar from './components/LayoutSidebar';
import Users from './pages/Users';
import Bundles from './pages/Bundles';
import BundleForm from './pages/BundleForm';
import UserForm from './pages/UserForm';
import UserDetails from './pages/UserDetails';
import Payments from './pages/Payments';
import NotFound from './pages/NotFound';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <LayoutSidebar />,
        children: [
          {
            index: true,
            element: <Navigate to="/users" replace />,
          },
          {
            path: 'users',
            element: <Users />,
          },
          {
            path: 'users/edit/:userId',
            element: <UserForm />,
          },
          {
            path: 'users/create',
            element: <UserForm />,
          },
          {
            path: 'users/:userId',
            element: <UserDetails />,
          },
          {
            path: 'bundles',
            element: <Bundles />,
          },
          {
            path: 'bundles/create',
            element: <BundleForm />,
          },
          {
            path: 'bundles/edit/:bundleId',
            element: <BundleForm />,
          },
          {
            path: 'payments',
            element: <Payments />,
          },
          {
            path: '*', // This should ideally be the last route in this group
            element: <NotFound />,
          },
        ],
      },
    ],
  },
   {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;