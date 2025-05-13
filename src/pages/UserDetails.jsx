import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Row, Col, Badge, Spinner, Alert, Accordion } from 'react-bootstrap';
import AppContext from '../context/AppContext';

const UserDetails = () => {
  const { userId: routeUserId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const { fetchUserById } = useContext(AppContext);

  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const currentFlow = queryParams.get('flow'); 

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await fetchUserById(routeUserId); 
        setUser(userData); 
      } catch (err) {
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (routeUserId) {
      loadUserData();
    }
  }, [routeUserId, fetchUserById]);

  const toggleAccordion = (key) => {
    setActiveAccordionKey(activeAccordionKey === key ? null : key.toString());
  };

  const handleBundleDoubleClick = (selectedBundleSubscription) => {
    if (currentFlow === 'CP' && user) {
      // selectedBundleSubscription contains userBundleId, bundle.name, bundle.price
      if (!selectedBundleSubscription?.userBundleId || !selectedBundleSubscription?.bundle?.name) {
        alert("Error: Selected bundle subscription is missing required UserBundleID or Name.");
        console.error("Selected bundle subscription data is incomplete:", selectedBundleSubscription);
        return;
      }

      navigate('/payments', {
        state: {
          flow: 'createPaymentCompleteCP',
          // Pass information needed by CreatePaymentModal
          selectedUserBundleId: selectedBundleSubscription.userBundleId,
          selectedBundleName: selectedBundleSubscription.bundle.name,
          selectedBundlePrice: selectedBundleSubscription.bundle.price,
          selectedUserName: `${user.firstName} ${user.lastName} (User ID: ${user.userId})`, // For display
        },
      });
    }
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
        <Button variant="secondary" onClick={() => navigate(currentFlow === 'CP' ? '/users?flow=CP' : '/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3">
        <Alert variant="warning">User not found.</Alert>
        <Button variant="secondary" onClick={() => navigate(currentFlow === 'CP' ? '/users?flow=CP' : '/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3">
      {currentFlow === 'CP' && (
        <Alert variant="info">
          You are in Create Payment mode. Double-click a bundle subscription below to select it for payment.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>User Details</h1>
          <Badge bg={user.status === 'ACTIVE' ? 'success' : 'secondary'} className="fs-6">
            {user.status}
          </Badge>
        </div>
        <div>
          <Button variant="secondary" onClick={() => navigate(currentFlow === 'CP' ? '/users?flow=CP' : '/users')} className="me-2">
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
                <strong>User ID (Entity):</strong> {user.userId}
              </div>
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
              {user.bundles.map((bundleSubscription, index) => (
                <Accordion.Item 
                  key={bundleSubscription.userBundleId || index} 
                  eventKey={(bundleSubscription.userBundleId || index).toString()}
                  onDoubleClick={() => handleBundleDoubleClick(bundleSubscription)}
                  style={{ cursor: currentFlow === 'CP' ? 'pointer' : 'default' }}
                >
                  <Accordion.Header onClick={() => toggleAccordion(bundleSubscription.userBundleId || index)}>
                    <div className="d-flex justify-content-between align-items-center w-100 pe-2">
                      <span>
                        {bundleSubscription.bundle.name} (UserBundleID: {bundleSubscription.userBundleId})
                        <Badge bg={bundleSubscription.status === 'ACTIVE' ? 'success' : 'secondary'} className="ms-2">
                          {bundleSubscription.status}
                        </Badge>
                        <Badge bg="info" className="ms-2">
                          ${bundleSubscription.bundle.price}/month
                        </Badge>
                        <span className="ms-2">
                          (Subscribed on: {formatDate(bundleSubscription.subscriptionDate)})
                        </span>
                      </span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>Bundle Name:</strong> {bundleSubscription.bundle.name} (BundleID: {bundleSubscription.bundle.bundleId})
                        </div>
                        <div className="mb-2">
                          <strong>Subscription Date:</strong> {formatDate(bundleSubscription.subscriptionDate)}
                        </div>
                        <div className="mb-2">
                          <strong>Type:</strong> {bundleSubscription.bundle.type}
                        </div>
                        <div className="mb-2">
                          <strong>Speed:</strong> {bundleSubscription.bundle.speed} Mbps
                        </div>
                        <div className="mb-2">
                          <strong>Data Cap:</strong> 
                          {bundleSubscription.bundle.dataCap > 0 
                            ? `${bundleSubscription.bundle.dataCap} GB` 
                            : 'Unlimited'}
                        </div>
                        <div className="mb-2">
                          <strong>Description:</strong> {bundleSubscription.bundle.description}
                        </div>
                      </Col>
                      <Col md={6}>
                        <h5>Bundle Location</h5>
                        <div className="mb-2">
                          <strong>Address:</strong> {bundleSubscription.bundleLocation?.address || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>City:</strong> {bundleSubscription.bundleLocation?.city || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>Street:</strong> {bundleSubscription.bundleLocation?.street || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>Building:</strong> {bundleSubscription.bundleLocation?.building || '-'}
                        </div>
                        <div className="mb-2">
                          <strong>Floor:</strong> {bundleSubscription.bundleLocation?.floor || '-'}
                        </div>
                      </Col>
                    </Row>
                    {currentFlow === 'CP' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => handleBundleDoubleClick(bundleSubscription)}
                      >
                        Select this Bundle Subscription for Payment
                      </Button>
                    )}
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