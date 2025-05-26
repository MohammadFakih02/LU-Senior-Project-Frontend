import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { KeyFill, ArrowLeftCircleFill } from 'react-bootstrap-icons';
import AppContext from '../context/AppContext';

const ChangePasswordPage = () => {
  const { changeAdminPassword, isAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
        setError('You must be logged in to change your password.');
        return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        setError('All password fields are required.');
        return;
    }
    if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changeAdminPassword(oldPassword, newPassword);
      
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      navigate('/users');
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }} sm={{ span: 10, offset: 1 }}>
          <Card className="shadow-lg">
            <Card.Header className="bg-secondary text-white text-center py-3">
              <h2 className="mb-0">
                <KeyFill className="me-2" /> Change Admin Password
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mb-3"
                onClick={() => navigate(-1)} 
              >
                <ArrowLeftCircleFill className="me-2" /> Back
              </Button>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger" className="text-center small py-2">{error}</Alert>}
                <Form.Group className="mb-3" controlId="oldPassword">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="confirmNewPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Changing...</span>
                    </>
                  ) : (
                    'Change Password'
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

export default ChangePasswordPage;