import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LayoutSidebar from './components/LayoutSidebar';
import Users from './pages/User';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutSidebar/>,
    children: [
      {
        path: 'users',
        element:<Users/>
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