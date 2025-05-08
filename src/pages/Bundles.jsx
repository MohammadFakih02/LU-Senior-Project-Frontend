// pages/Bundles.js
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
    showErrorToast
  } = useContext(AppContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (bundle) => {
    setBundleToDelete(bundle);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bundleToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/bundles/${bundleToDelete.bundleId}`);
      await refreshBundles();
      showSuccessToast(`Bundle "${bundleToDelete.name}" deleted successfully`);
    } catch (error) {
      showErrorToast(error.response?.data?.message || `Failed to delete bundle "${bundleToDelete.name}"`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setBundleToDelete(null);
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
            />
          </Col>
        ))}

        {/* Add New Bundle Card */}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the bundle "{bundleToDelete?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
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