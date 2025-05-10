import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Badge, Spinner, Alert, Accordion } from 'react-bootstrap';
import AppContext from '../context/AppContext';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { fetchUserById } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, fetchUserById]);

  const toggleAccordion = (key) => {
    setActiveAccordionKey(activeAccordionKey === key ? null : key);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3">
        <Alert variant="warning">User not found</Alert>
        <Button variant="secondary" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>User Details</h1>
          <Badge bg={user.status === 'ACTIVE' ? 'success' : 'secondary'} className="fs-6">
            {user.status}
          </Badge>
        </div>
        <div>
          <Button variant="secondary" onClick={() => navigate('/users')} className="me-2">
            Back to Users
          </Button>
          <Button variant="warning" as={Link} to={`/users/edit/${user.userId}`}>
            Edit User
          </Button>
        </div>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4 className="mb-3">Basic Information</h4>
              <div className="mb-3">
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong> {user.phone || '-'}
              </div>
            </Col>
            <Col md={6}>
              <h4 className="mb-3">Primary Location</h4>
              <div className="mb-3">
                <strong>Address:</strong> {user.location?.address || '-'}
              </div>
              <div className="mb-3">
                <strong>City:</strong> {user.location?.city || '-'}
              </div>
              <div className="mb-3">
                <strong>Street:</strong> {user.location?.street || '-'}
              </div>
              <div className="mb-3">
                <strong>Building:</strong> {user.location?.building || '-'}
              </div>
              <div className="mb-3">
                <strong>Floor:</strong> {user.location?.floor || '-'}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {user.bundles && user.bundles.length > 0 && (
        <Card className="shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Bundle Subscriptions</h4>
            <Accordion activeKey={activeAccordionKey}>
              {user.bundles.map((bundle, index) => (
                <Accordion.Item key={index} eventKey={index}>
                  <Accordion.Header onClick={() => toggleAccordion(index)}>
                    <div className="d-flex justify-content-between align-items-center w-100 pe-2">
                      <span>
                        {bundle.bundle.name} 
                        <Badge bg={bundle.status === 'ACTIVE' ? 'success' : 'secondary'} className="ms-2">
                          {bundle.status}
                        </Badge>
                        <Badge bg="info" className="ms-2">
                          ${bundle.bundle.price}/month
                        </Badge>
                        <span className="ms-2">
                          (Subscribed on: {formatDate(bundle.subscriptionDate)})
                        </span>
                      </span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>Subscription Date:</strong> {formatDate(bundle.subscriptionDate)}
                        </div>
                        <div className="mb-2">
                          <strong>Type:</strong> {bundle.bundle.type}
                        </div>
                        <div className="mb-2">
                          <strong>Speed:</strong> {bundle.bundle.speed} Mbps
                        </div>
                        <div className="mb-2">
                          <strong>Data Cap:</strong> 
                          {bundle.bundle.dataCap > 0 
                            ? `${bundle.bundle.dataCap} GB` 
                            : 'Unlimited'}
                        </div>
                        <div className="mb-2">
                          <strong>Description:</strong> {bundle.bundle.description}
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5>Bundle Location</h5>
                        <div className="mb-2">
                          <strong>Address:</strong> {bundle.bundleLocation?.address || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>City:</strong> {bundle.bundleLocation?.city || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>Street:</strong> {bundle.bundleLocation?.street || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>Building:</strong> {bundle.bundleLocation?.building || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>Floor:</strong> {bundle.bundleLocation?.floor || '-'}
                        </div>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default UserDetails;