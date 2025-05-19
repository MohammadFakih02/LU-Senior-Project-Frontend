import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import AppContext from '../context/AppContext'; // Assuming AppContext is in ../../context
import { Whatsapp } from 'react-bootstrap-icons'; // Import Whatsapp icon
import { generateWhatsAppLink } from '../utils/whatsappHelper'; // Corrected import path


const CreatePaymentModal = ({
  show,
  onHide,
  selectionData, // Contains { userBundleId, bundleName, bundlePrice, userName (which is "Name (User ID: X)"), userId }
  paymentMethods = [],
  onConfirmCreate,
  isLoading
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [isFetchingWhatsappUser, setIsFetchingWhatsappUser] = useState(false);

  const { fetchUserById, showErrorToast } = useContext(AppContext);

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
        if (!selectionData?.userId) {
            console.warn("CreatePaymentModal: selectionData is missing userId, WhatsApp notification will not work correctly.");
        }
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
      paymentDate: paymentDate ? new Date(paymentDate + "T00:00:00Z").toISOString() : null,
      dueDate: dueDate ? new Date(dueDate + "T00:00:00Z").toISOString() : null,
      paymentMethod: selectedMethod,
      status: selectedStatus,
      userBundleId: selectionData.userBundleId,
    };
    onConfirmCreate(newPaymentData);
  };

  const handleNotifyViaWhatsapp = async () => {
    if (!selectionData?.userId) {
        showErrorToast("User ID not found in selection. Cannot send WhatsApp notification.");
        console.error("Missing userId in selectionData for WhatsApp:", selectionData);
        return;
    }
    if (!dueDate || !amount) {
        showErrorToast("Please fill in Amount and Due Date before sending notification.");
        return;
    }

    setIsFetchingWhatsappUser(true);
    try {
        const user = await fetchUserById(selectionData.userId);
        if (user && user.phone) {
            // Extract only the name part from selectionData.userName for the message
            const nameForMessage = selectionData.userName ? selectionData.userName.split(' (User ID:')[0].trim() : 'customer';

            const paymentDetailsForMsg = {
                amount: amount,
                dueDate: dueDate,
                bundleName: selectionData.bundleName, // This is already just the bundle name
                userName: nameForMessage, // Use the cleaned name
            };
            const link = generateWhatsAppLink(
                user.phone,
                paymentDetailsForMsg,
                'creation_notification'
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

  // For display in the modal, show only the name part of selectionData.userName
  const userNameDisplay = selectionData?.userName ? selectionData.userName.split(' (User ID:')[0].trim() : 'N/A';
  // For display, show only selectionData.bundleName
  const bundleNameDisplay = selectionData?.bundleName || 'N/A';


  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      scrollable={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create Custom Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>User</Form.Label>
          <Form.Control
            type="text"
            value={userNameDisplay} // Shows only name
            disabled
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Selected User Bundle</Form.Label>
          <Form.Control
            type="text"
            value={bundleNameDisplay} // Shows only bundle name
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
        <Button variant="secondary" onClick={onHide} disabled={isLoading || isFetchingWhatsappUser}>
          Cancel
        </Button>
        <Button
            variant="success"
            onClick={handleNotifyViaWhatsapp}
            disabled={isLoading || isFetchingWhatsappUser || !selectionData?.userId || !dueDate || !amount}
            className="d-flex align-items-center"
        >
            {isFetchingWhatsappUser ? <Spinner size="sm" className="me-2" /> : <Whatsapp className="me-2" />}
            Notify User
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading || isFetchingWhatsappUser || !amount || !dueDate || !selectedMethod || !selectionData?.userBundleId}
        >
          {isLoading ? <Spinner size="sm" /> : 'Create Payment'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePaymentModal;