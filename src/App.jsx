import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LayoutSidebar from './components/LayoutSidebar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutSidebar/>,
    children: [
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