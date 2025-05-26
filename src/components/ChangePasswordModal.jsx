import React, { useState, useContext, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { KeyFill } from 'react-bootstrap-icons';
import AppContext from '../context/AppContext';

const ChangePasswordModal = ({ show, handleClose }) => {
  const { changeAdminPassword, showSuccessToast } = useContext(AppContext);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
  };

  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show]);


  const internalHandleClose = () => {
    handleClose(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      showSuccessToast('Password changed successfully!');
      resetForm();
      handleClose();
    } catch (err) {
      const errorMessage = err.message || "Failed to change password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={internalHandleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <KeyFill className="me-2" /> Change Admin Password
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger" className="text-center small py-2">{error}</Alert>}
          <Form.Group className="mb-3" controlId="modalOldPassword">
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

          <Form.Group className="mb-3" controlId="modalNewPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="modalConfirmNewPassword">
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
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;