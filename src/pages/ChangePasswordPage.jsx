import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { KeyFill, ArrowLeftCircleFill } from 'react-bootstrap-icons';
import AppContext from '../context/AppContext';

const ChangePasswordPage = () => {
  const { changeAdminPassword, isAuthenticated } = useContext(AppContext); // Added isAuthenticated for quick check
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous local errors
    console.log("ChangePasswordPage: handleSubmit called");

    if (!isAuthenticated) {
        setError('You must be logged in to change your password.');
        console.log("ChangePasswordPage: User not authenticated (checked on page)");
        // Toast from AppContext will also show if changeAdminPassword is called
        return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        setError('All password fields are required.');
        console.log("ChangePasswordPage: All fields are required");
        return;
    }
    if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        console.log("ChangePasswordPage: New password too short");
        return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation password do not match.');
      console.log("ChangePasswordPage: New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    console.log("ChangePasswordPage: Calling changeAdminPassword");
    
    // changeAdminPassword from AppContext will show its own toasts
    const success = await changeAdminPassword(oldPassword, newPassword, confirmNewPassword);
    
    console.log("ChangePasswordPage: changeAdminPassword returned", success);
    setIsSubmitting(false);

    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Optional: navigate('/some-success-page'); or just rely on the success toast
    } else {
      // If changeAdminPassword returned false, a toast was already shown.
      // We can set a local error for more persistent feedback if needed,
      // but it might be redundant if the toast provided enough detail from the API.
      // For now, we'll rely on the toast from AppContext to avoid duplicate error messages.
      // If the API doesn't give a good message, we might add a generic one here:
      // setError('Password change failed. Please check details and try again.');
      console.log("ChangePasswordPage: Password change failed (success is false). Toast should have details.");
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