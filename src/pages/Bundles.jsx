import { Row, Col, Spinner, Alert, Card, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PlusLg, Trash } from 'react-bootstrap-icons';
import './styles/BundleCreationButton.css';
import { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import BundleCard from '../components/BundleCard';
import axios from 'axios';

const Bundles = () => {
  const {
    bundles,
    bundlesLoading,
    bundlesError,
    refreshBundles,
    showSuccessToast,
    showErrorToast,
    users, // Added users
    payments, // Added payments
  } = useContext(AppContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteWarningMessages, setDeleteWarningMessages] = useState([]);

  const handleDeleteClick = (bundle) => {
    const warnings = [];
    // Check for active user bundles
    const activeUsersWithBundle = users.filter(user =>
      user.bundleNames && user.bundleNames.includes(bundle.name)
    );
    if (activeUsersWithBundle.length > 0) {
      warnings.push(
        `This bundle is currently active for ${activeUsersWithBundle.length} user(s). Deleting it might affect their subscriptions.`
      );
    }

    // Check for unpaid/pending payments for this bundle
    const relevantPayments = payments.filter(
      (payment) => payment.bundleId === bundle.bundleId && payment.status !== 'PAID'
    );
    if (relevantPayments.length > 0) {
      const unpaidCount = relevantPayments.filter(p => p.status === 'UNPAID').length;
      const pendingCount = relevantPayments.filter(p => p.status === 'PENDING').length;
      let paymentWarning = 'There are payments associated with this bundle:';
      if (unpaidCount > 0) paymentWarning += ` ${unpaidCount} UNPAID`;
      if (pendingCount > 0) paymentWarning += `${unpaidCount > 0 ? ' and' : ''} ${pendingCount} PENDING`;
      paymentWarning += '.';
      warnings.push(paymentWarning);
    }

    setDeleteWarningMessages(warnings);
    setBundleToDelete(bundle);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBundleToDelete(null);
    setDeleteWarningMessages([]); // Clear warnings on close
  };

  const handleConfirmDelete = async () => {
    if (!bundleToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/bundles/${bundleToDelete.bundleId}`);
      await refreshBundles({ showToast: false });
      showSuccessToast(`Bundle "${bundleToDelete.name}" deleted successfully`);
    } catch (error) {
      showErrorToast(error.response?.data?.message || `Failed to delete bundle "${bundleToDelete.name}"`);
    } finally {
      setIsDeleting(false);
      handleCloseDeleteModal(); // Use the new close handler
    }
  };

  if (bundlesLoading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (bundlesError)
    return (
      <div className="p-3">
        <Alert variant="danger">{bundlesError}</Alert>
        <Button variant="secondary" onClick={refreshBundles}>
          Retry
        </Button>
      </div>
    );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Internet Bundles</h1>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {bundles.map((bundle) => (
          <Col key={bundle.bundleId}>
            <BundleCard
              bundle={bundle}
              variant="large"
              showActions={true}
              onDelete={() => handleDeleteClick(bundle)}
              expandableDescription={true}
              descriptionMaxLines={3}
            />
          </Col>
        ))}

        <Col>
          <Card
            as={Link}
            to="/bundles/create"
            className="h-100 shadow-sm add-card"
            style={{ textDecoration: 'none' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <PlusLg className="text-muted mb-2" size={28} />
              <Card.Title className="text-muted">Add New Bundle</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {bundles.length === 0 && (
        <div className="text-center p-5 text-muted">
          No bundles found
        </div>
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the bundle "{bundleToDelete?.name}"? This action cannot be undone.</p>
          {deleteWarningMessages.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <strong>Warning:</strong>
              <ul>
                {deleteWarningMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              'Delete Bundle'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Bundles;