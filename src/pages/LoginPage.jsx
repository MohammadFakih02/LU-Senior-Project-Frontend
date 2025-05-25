import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { ShieldLockFill, LightningChargeFill } from 'react-bootstrap-icons';
import AppContext from '../context/AppContext';

const LoginPage = () => {
  const { loginUser, isAuthenticated, authLoading, currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/users";

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = await loginUser(username, password);
    setIsSubmitting(false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Login failed. Please check your credentials or try again.');
    }
  };
  
  if (authLoading && !currentUser && !isAuthenticated) {
     return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
           <Spinner animation="border" variant="primary" />
        </Container>
     );
  }

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} sm={{ span: 10, offset: 1 }}>
          <Card className="shadow-lg">
            <Card.Header className="bg-dark text-white text-center py-3">
              <h2 className="mb-0">
                <LightningChargeFill className="me-2 text-warning" /> Admin Dashboard
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <ShieldLockFill size={48} className="text-primary" />
                <h4 className="mt-2">Login</h4>
              </div>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger" className="text-center small">{error}</Alert>}
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting || authLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Logging in...</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;