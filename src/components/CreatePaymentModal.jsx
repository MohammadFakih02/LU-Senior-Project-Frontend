import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import AppContext from '../context/AppContext';
import { Whatsapp } from 'react-bootstrap-icons';
import { generateWhatsAppLink } from '../utils/whatsappHelper';


const CreatePaymentModal = ({
  show,
  onHide,
  selectionData,
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
  const fixedPaymentMethods = ['Cash', 'Card', 'Other'];

  useEffect(() => {
    if (show && selectionData) {
      setAmount(selectionData.bundlePrice?.toString() || '');
      setPaymentDate('');
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

  useEffect(() => {
    if (selectedStatus !== 'PAID') {
      setSelectedMethod('');
    }
    // If status is PENDING or UNPAID, clear and effectively nullify paymentDate
    if (selectedStatus === 'PENDING' || selectedStatus === 'UNPAID') {
      setPaymentDate('');
    }
  }, [selectedStatus]);

  const handleSubmit = () => {
    if (!selectionData?.userBundleId) {
      console.error("UserBundleID missing in CreatePaymentModal", selectionData);
      showErrorToast("Required UserBundleID is missing to create the payment.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!dueDate) {
      showErrorToast("Due Date is required.");
      return;
    }
    const localDueDate = new Date(dueDate);
    if (localDueDate < today) {
      showErrorToast("Due Date must be in the present or future.");
      return;
    }

    if (selectedStatus === 'PAID' && !selectedMethod) {
      showErrorToast("Payment Method is required when status is PAID.");
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0.01) {
      showErrorToast("Amount must be a number greater than 0.00.");
      return;
    }

    const newPaymentData = {
      amount: numericAmount,
      paymentDate: paymentDate ? new Date(paymentDate + "T00:00:00Z").toISOString() : null,
      dueDate: dueDate ? new Date(dueDate + "T00:00:00Z").toISOString() : null,
      paymentMethod: selectedStatus === 'PAID' ? selectedMethod : null,
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
     const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0.01) {
      showErrorToast("Amount for notification must be a number greater than 0.00.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const localDueDate = new Date(dueDate);
    if (localDueDate < today) {
      showErrorToast("Due Date for notification must be in the present or future.");
      return;
    }


    setIsFetchingWhatsappUser(true);
    try {
        const user = await fetchUserById(selectionData.userId);
        if (user && user.phone) {
            const nameForMessage = selectionData.userName ? selectionData.userName.split(' (User ID:')[0].trim() : 'customer';

            const paymentDetailsForMsg = {
                amount: amount,
                dueDate: dueDate,
                bundleName: selectionData.bundleName,
                userName: nameForMessage,
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

  const userNameDisplay = selectionData?.userName ? selectionData.userName.split(' (User ID:')[0].trim() : 'N/A';
  const bundleNameDisplay = selectionData?.bundleName || 'N/A';
  const todayDateString = new Date().toISOString().split('T')[0];


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
            min="0.01"
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
            disabled={selectedStatus === 'PENDING' || selectedStatus === 'UNPAID' || isLoading}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Due Date *</Form.Label>
          <Form.Control
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={todayDateString}
            required
          />
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

        <Form.Group className="mb-3">
          <Form.Label>Payment Method {selectedStatus === 'PAID' ? '*' : '(Optional)'}</Form.Label>
          <Form.Select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            disabled={selectedStatus !== 'PAID' || isLoading}
            required={selectedStatus === 'PAID'}
          >
            <option value="">Select method</option>
            {fixedPaymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
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
            disabled={
                isLoading || 
                isFetchingWhatsappUser || 
                !selectionData?.userId || 
                !dueDate || 
                !amount || 
                Number(amount) < 0.01 || 
                (dueDate && new Date(dueDate) < new Date(new Date().toISOString().split('T')[0]))
            }
            className="d-flex align-items-center"
        >
            {isFetchingWhatsappUser ? <Spinner size="sm" className="me-2" /> : <Whatsapp className="me-2" />}
            Notify User
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            isFetchingWhatsappUser ||
            !amount || Number(amount) < 0.01 ||
            !dueDate || (dueDate && new Date(dueDate) < new Date(new Date().toISOString().split('T')[0])) ||
            (selectedStatus === 'PAID' && !selectedMethod) ||
            !selectionData?.userBundleId
          }
        >
          {isLoading ? <Spinner size="sm" /> : 'Create Payment'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePaymentModal;