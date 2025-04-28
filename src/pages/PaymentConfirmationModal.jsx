import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const PaymentConfirmationModal = ({
  show,
  onHide,
  payment,
  methods = [],
  onConfirm,
  isLoading
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [editableAmount, setEditableAmount] = useState(0);

  useEffect(() => {
    if (show) {
      setEditableAmount(payment?.amount || 0);
      setSelectedMethod(payment?.paymentMethod || '');
    }
  }, [show, payment]);

  const handleSubmit = (isFullPayment = true) => {
    onConfirm({
      status: isFullPayment ? 'PAID' : payment?.status,
      paymentMethod: isFullPayment ? (selectedMethod || payment?.paymentMethod) : payment?.paymentMethod,
      paymentDate: isFullPayment ? new Date().toISOString() : payment?.paymentDate,
      amount: Number(editableAmount)
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Payment Operations</Modal.Title>
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
            <option value="">{payment?.paymentMethod || 'Select method'}</option>
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>User</Form.Label>
          <Form.Control 
            type="text" 
            value={payment?.userName || 'Unknown'} 
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
          onClick={() => handleSubmit(false)}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : 'Update Amount'}
        </Button>
        <Button 
          variant="primary" 
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : 'Mark Paid'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;