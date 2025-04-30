import { Button, Spinner } from "react-bootstrap";

const SubmitButton = ({ isEditMode, isSubmitting }) => (
  <Button
    variant={isEditMode ? "warning" : "primary"}
    type="submit"
    className="px-4"
    disabled={isSubmitting}
  >
    {isSubmitting ? (
      <>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className="me-2"
        />
        {isEditMode ? "Saving..." : "Creating..."}
      </>
    ) : (
      isEditMode ? "Save Changes" : "Create User"
    )}
  </Button>
);

export default SubmitButton;