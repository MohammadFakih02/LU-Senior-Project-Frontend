import { Modal, Button } from "react-bootstrap";

const ConfirmationModal = ({
  show,
  title,
  body,
  onCancel,
  onConfirm,
  confirmVariant = "primary",
  confirmText,
  confirmDisabled = false,
}) => (
  <Modal show={show} onHide={onCancel} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{body}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onCancel} disabled={confirmDisabled}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} disabled={confirmDisabled}>
        {confirmText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmationModal;