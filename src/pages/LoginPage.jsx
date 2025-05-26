import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Stack } from 'react-bootstrap'; // Added Stack
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
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
           <Spinner animation="border" variant="primary" />
        </Container>
     );
  }

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-4">
      <Row className="w-100 justify-content-center">
        <Col xs={11} sm={9} md={7} lg={5} xl={4}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-dark text-white text-center py-3">
              <Stack direction="horizontal" gap={2} className="justify-content-center align-items-center">
                <LightningChargeFill className="text-warning fs-5" />
                <span className="h5 mb-0 fw-bold">Admin Dashboard</span>
              </Stack>
            </Card.Header>
            <Card.Body className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <ShieldLockFill size={52} className="text-primary mb-2" />
                <h4 className="mt-1 fw-bold">Login</h4>
              </div>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger" className="text-center small py-2">{error}</Alert>}
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
                  className="w-100 py-2"
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