// First, create a new component for 404 errors (e.g., `NotFound.jsx`)
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

function NotFound() {
  return (
    <Alert variant="danger" className="m-4">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/#/" className="btn btn-primary">
        Go Home
      </Link>
    </Alert>
  );
}

export default NotFound;