import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import AppContext from '../context/AppContext';
import { Whatsapp } from 'react-bootstrap-icons';
import { generateWhatsAppLink } from '../utils/whatsappHelper';


const PaymentConfirmationModal = ({
  show,
  onHide,
  payment,
  onConfirm,
  isLoading
}) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [editableAmount, setEditableAmount] = useState(0);
  const [isFetchingWhatsappUser, setIsFetchingWhatsappUser] = useState(false);

  const { fetchUserById, showErrorToast } = useContext(AppContext);
  const fixedPaymentMethods = ['Cash', 'Card', 'Other'];

  useEffect(() => {
    if (show && payment) {
      setEditableAmount(payment.amount || 0);
      setSelectedMethod(payment.paymentMethod || '');
      if (!payment.userId) {
          console.warn("PaymentConfirmationModal: payment object is missing userId. WhatsApp notification may not work.");
      }
    }
  }, [show, payment]);

  const handleSubmit = (isMarkingPaid = true) => {
    const numericAmount = Number(editableAmount);
    if (isNaN(numericAmount) || numericAmount < 0.01) {
        showErrorToast("Amount must be a number greater than 0.");
        return;
    }

    if (isMarkingPaid) {
      if (!selectedMethod) {
        showErrorToast("Payment Method is required to mark as PAID.");
        return;
      }
      onConfirm({
        status: 'PAID',
        paymentMethod: selectedMethod,
        paymentDate: new Date().toISOString(),
        amount: numericAmount
      });
    } else {
      onConfirm({
        status: payment?.status,
        paymentMethod: payment?.paymentMethod,
        paymentDate: payment?.paymentDate,
        amount: numericAmount
      });
    }
  };

  const handleNotifyViaWhatsapp = async () => {
    if (!payment?.userId) {
        showErrorToast("User ID not found for this payment.");
        return;
    }
    if (payment.status === 'PAID') {
        showErrorToast("Payment is already PAID. Reminder notification not typically sent.");
        // We could allow sending it anyway, but for now, let's restrict.
        // return;
    }
    const numericAmount = Number(editableAmount);
     if (isNaN(numericAmount) || numericAmount < 0.01) {
        showErrorToast("Amount for notification must be a number greater than 0.");
        return;
    }


    setIsFetchingWhatsappUser(true);
    try {
        const userDetails = await fetchUserById(payment.userId);
        if (userDetails && userDetails.phone) {
            const detailsForMsg = {
                amount: editableAmount,
                dueDate: payment.dueDate,
                bundleName: payment.bundleName,
                userName: payment.userName,
            };
            const link = generateWhatsAppLink(
                userDetails.phone,
                detailsForMsg,
                payment.status === 'PAID' ? 'payment_confirmation' : 'reminder'
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
            min="0.01"
            value={editableAmount}
            onChange={(e) => setEditableAmount(e.target.value)}
            disabled={isLoading || isFetchingWhatsappUser}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method {payment?.status !== 'PAID' ? '(Required if Marking Paid)' : ''}</Form.Label>
          <Form.Select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            disabled={isLoading || isFetchingWhatsappUser}
          >
            <option value="">Select method</option>
            {fixedPaymentMethods.map(method => (
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
        {payment?.status && (
             <Form.Group className="mb-3">
             <Form.Label>Current Status</Form.Label>
             <Form.Control
                 type="text"
                 value={payment.status}
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
            disabled={isLoading || isFetchingWhatsappUser || !payment?.userId || Number(editableAmount) < 0.01}
            className="d-flex align-items-center"
        >
            {isFetchingWhatsappUser ? <Spinner size="sm" className="me-2" /> : <Whatsapp className="me-2" />}
            Notify User
        </Button>
        {payment?.status !== 'PAID' && (
            <Button
            variant="warning"
            onClick={() => handleSubmit(false)}
            disabled={isLoading || isFetchingWhatsappUser || Number(editableAmount) < 0.01}
            >
            {isLoading ? <Spinner size="sm" /> : 'Update Amount'}
            </Button>
        )}
        {payment?.status !== 'PAID' && (
            <Button
            variant="primary"
            onClick={() => handleSubmit(true)}
            disabled={isLoading || isFetchingWhatsappUser || !selectedMethod || Number(editableAmount) < 0.01}
            >
            {isLoading ? <Spinner size="sm" /> : 'Mark Paid'}
            </Button>
        )}
        {payment?.status === 'PAID' && (
             <Button
             variant="primary"
             onClick={() => handleSubmit(true)}
             disabled={isLoading || isFetchingWhatsappUser || !selectedMethod || Number(editableAmount) < 0.01}
             >
             {isLoading ? <Spinner size="sm" /> : 'Update Payment'}
             </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;