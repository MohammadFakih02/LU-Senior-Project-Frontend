// App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LayoutSidebar from './components/LayoutSidebar';
import Users from './pages/Users';
import Bundles from './pages/Bundles';// Add this import

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutSidebar/>,
    children: [
      {
        path: 'users',
        element: <Users/>
      },
      {
        path: 'bundles',
        element: <Bundles/>
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