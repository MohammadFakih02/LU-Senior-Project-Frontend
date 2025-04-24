// PaymentConfirmationModal.jsx
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const PaymentConfirmationModal = ({
  show,
  onHide,
  payment, // Might be null initially
  methods,
  onConfirm,
  isLoading
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [editableAmount, setEditableAmount] = useState(0);
  const [isAmountOnlyUpdate, setIsAmountOnlyUpdate] = useState(false);
  useEffect(() => {
    setEditableAmount(payment?.amount || 0);
  }, [payment]);

  // Safe access with default values
  const safePayment = payment || {
    amount: 0,
    userName: 'N/A',
    paymentMethod: ''
  };

  const handleSubmit = () => {
    onConfirm({
      status: 'PAID',
      paymentMethod: selectedMethod || safePayment.paymentMethod,
      paymentDate: new Date().toISOString(),
      amount: Number(editableAmount) // Pass the edited amount
    });
  };
  const handleAmountUpdate = () => {
    setIsAmountOnlyUpdate(true);
    onConfirm({
      amount: Number(editableAmount),
      // Explicitly keep existing status/method
      status: safePayment.status,
      paymentMethod: safePayment.paymentMethod
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control 
          type="number" 
          step="0.01"
          value={editableAmount}
          onChange={(e) => setEditableAmount(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            <option value="">Select method</option>
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>User</Form.Label>
          <Form.Control 
            type="text" 
            value={safePayment.userName || 'Unknown'} 
            disabled 
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
      <Button variant="secondary" onClick={onHide} disabled={isLoading}>
        Cancel
      </Button>
      <Button 
        variant="warning" 
        onClick={handleAmountUpdate}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          'Update Amount Only'
        )}
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSubmit} 
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          'Mark as Paid'
        )}
      </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;