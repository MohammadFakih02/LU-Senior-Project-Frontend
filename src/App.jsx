import { createHashRouter, RouterProvider } from 'react-router-dom';
import LayoutSidebar from './components/LayoutSidebar';
import Users from './pages/Users';
import Bundles from './pages/Bundles';
import BundleForm from './pages/BundleForm';
import UserForm from './pages/UserForm';
import UserDetails from './pages/UserDetails';
import Payments from './pages/Payments';

const router = createHashRouter([
  {
    path: '/',
    element: <LayoutSidebar/>,
    children: [
      {
        path: 'users',
        element: <Users/>
      },
      {
        path: 'users/edit/:userId',
        element: <UserForm/>
      },
      {
        path: 'users/create/',
        element: <UserForm/>
      },
      {
        path: 'users/:userId',
        element: <UserDetails />
      },
      {
        path: 'bundles',
        element: <Bundles/>
      },
      {
        path: 'bundles/create',
        element: <BundleForm />
      },
      {
        path: 'bundles/edit/:bundleId',
        element: <BundleForm />
      },
      {
        path: 'payments',
        element: <Payments/>
      },
      {
        path: '*',
        element: <div>Select a page from the sidebar</div>,
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;