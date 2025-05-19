import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import AppContext from '../context/AppContext'; // Assuming AppContext is in ../../context
import { Whatsapp } from 'react-bootstrap-icons'; // Import Whatsapp icon
import { generateWhatsAppLink } from '../utils/whatsappHelper'; // Corrected import path


const PaymentConfirmationModal = ({
  show,
  onHide,
  payment, // Expect payment to have: userId, userName, bundleName, dueDate, amount, status
  methods = [],
  onConfirm,
  isLoading
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [editableAmount, setEditableAmount] = useState(0);
  const [isFetchingWhatsappUser, setIsFetchingWhatsappUser] = useState(false);

  const { fetchUserById, showErrorToast } = useContext(AppContext);

  useEffect(() => {
    if (show && payment) {
      setEditableAmount(payment.amount || 0);
      setSelectedMethod(payment.paymentMethod || '');
      if (!payment.userId) {
          console.warn("PaymentConfirmationModal: payment object is missing userId. WhatsApp notification may not work.");
      }
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

  const handleNotifyViaWhatsapp = async () => {
    if (!payment?.userId) {
        showErrorToast("User ID not found for this payment.");
        return;
    }
    if (payment.status === 'PAID') {
        showErrorToast("Payment is already PAID. Notification not sent.");
        return;
    }

    setIsFetchingWhatsappUser(true);
    try {
        const userDetails = await fetchUserById(payment.userId);
        if (userDetails && userDetails.phone) {
            const detailsForMsg = {
                amount: editableAmount, // Use current amount from modal
                dueDate: payment.dueDate,
                bundleName: payment.bundleName,
                userName: payment.userName,
            };
            const link = generateWhatsAppLink(
                userDetails.phone,
                detailsForMsg,
                'reminder'
            );
            if (link) {
                window.open(link, '_blank');
            } else {
                showErrorToast("Could not generate WhatsApp link. User phone number might be invalid.");
            }
        } else {
            showErrorToast("User phone number not found or user details could not be fetched.");
        }
    } catch (error) {
        showErrorToast("Failed to fetch user details for WhatsApp notification.");
        console.error("WhatsApp user fetch error:", error);
    } finally {
        setIsFetchingWhatsappUser(false);
    }
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
            <option value="" disabled>Select method</option>
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
        {payment?.bundleName && (
            <Form.Group className="mb-3">
            <Form.Label>Bundle</Form.Label>
            <Form.Control 
                type="text" 
                value={payment.bundleName} 
                disabled 
            />
            </Form.Group>
        )}
        {payment?.dueDate && (
            <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control 
                type="text" 
                value={new Date(payment.dueDate).toLocaleDateString()} 
                disabled 
            />
            </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading || isFetchingWhatsappUser}>
          Cancel
        </Button>
         <Button
            variant="success"
            onClick={handleNotifyViaWhatsapp}
            disabled={isLoading || isFetchingWhatsappUser || !payment?.userId || payment?.status === 'PAID'}
            className="d-flex align-items-center"
        >
            {isFetchingWhatsappUser ? <Spinner size="sm" className="me-2" /> : <Whatsapp className="me-2" />}
            Notify User
        </Button>
        <Button 
          variant="warning" 
          onClick={() => handleSubmit(false)}
          disabled={isLoading || isFetchingWhatsappUser}
        >
          {isLoading ? <Spinner size="sm" /> : 'Update Amount'}
        </Button>
        <Button 
          variant="primary" 
          onClick={() => handleSubmit(true)}
          disabled={isLoading || isFetchingWhatsappUser}
        >
          {isLoading ? <Spinner size="sm" /> : 'Mark Paid'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;