import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CreatePaymentModal = ({
  show,
  onHide,
  selectionData, // Contains { userBundleId, bundleName, bundlePrice, userName }
  paymentMethods = [],
  onConfirmCreate,
  isLoading
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING'); 

  const paymentStatuses = ['PENDING', 'UNPAID', 'PAID'];

  useEffect(() => {
    if (show && selectionData) {
      setAmount(selectionData.bundlePrice?.toString() || '');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setDueDate(''); 
      setSelectedMethod('');
      setSelectedStatus('PENDING');
    } else if (!selectionData && show) {
        console.error("CreatePaymentModal opened without selectionData!");
        onHide(); 
    }
  }, [show, selectionData, onHide]);

  const handleSubmit = () => {
    if (!selectionData?.userBundleId) {
      console.error("UserBundleID missing in CreatePaymentModal", selectionData);
      alert("Required UserBundleID is missing to create the payment.");
      return;
    }
    if (!dueDate) { 
        alert("Due Date is required.");
        return;
    }
    if (!selectedMethod) { 
        alert("Payment Method is required.");
        return;
    }

    const newPaymentData = {
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate + "T00:00:00Z").toISOString() : null, // Added Z for UTC
      dueDate: dueDate ? new Date(dueDate + "T00:00:00Z").toISOString() : null, // Added Z for UTC
      paymentMethod: selectedMethod,
      status: selectedStatus,
      userBundleId: selectionData.userBundleId, 
    };
    onConfirmCreate(newPaymentData);
  };

  const userNameDisplay = selectionData?.userName || 'N/A';
  const bundleNameDisplay = selectionData ? `${selectionData.bundleName} (UserBundleID: ${selectionData.userBundleId})` : 'N/A';


  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      scrollable={true} // Make the modal scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Create Custom Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body /* style={{ maxHeight: '70vh', overflowY: 'auto' }} */ > 
      {/* Optional: You can add explicit maxHeight to Modal.Body if scrollable prop alone isn't enough */}
        <Form.Group className="mb-3">
          <Form.Label>User</Form.Label>
          <Form.Control 
            type="text" 
            value={userNameDisplay}
            disabled 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Selected User Bundle</Form.Label>
          <Form.Control 
            type="text" 
            value={bundleNameDisplay}
            disabled 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control 
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Date (Optional)</Form.Label>
          <Form.Control 
            type="date" 
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Due Date *</Form.Label>
          <Form.Control 
            type="date" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method *</Form.Label>
          <Form.Select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            required
          >
            <option value="">Select method</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Form.Select>
        </Form.Group>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isLoading || !amount || !dueDate || !selectedMethod || !selectionData?.userBundleId}
        >
          {isLoading ? <Spinner size="sm" /> : 'Create Payment'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePaymentModal;