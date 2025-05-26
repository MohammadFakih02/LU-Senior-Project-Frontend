import { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Card, Alert, Spinner, Row, Col, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import AppContext from "../context/AppContext";
import useUserForm from "../hooks/useUserForm";
import UserInfoSection from "../components/userform/UserInfoSection";
import PrimaryLocationSection from "../components/userform/PrimaryLocationSection";
import BundleSubscriptionsSection from "../components/userform/BundleSubscriptionsSection";
import ConfirmationModal from "../components/userform/ConfirmationModal";
import { commonAreaCodes } from "../components/userform/formConstants"; // Import for area code validation
import "./styles/UserForm.css";

// Validation Patterns
const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const areaCodePattern = /^\+\d{1,3}$/;
const digitsOnlyPattern = /^\d+$/;
const optionalDigitsOnlyPattern = /^\d*$/;
const locationAddressStreetPattern = /^[A-Za-z0-9À-ÖØ-öø-ÿ\s.,#/-]+$/;
const locationCityPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/; // Can be same as namePattern
const locationBuildingFloorPattern = /^[A-Za-z0-9\s-]+$/;
const googleMapsUrlPattern = /^(https?:\/\/)?(www\.)?(google\.([a-z.]{2,6})\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)(\/.*)?$/i;

const MAX_USER_BUNDLES = 10; // Define the maximum number of bundles a user can have

const UserForm = () => {
  const {
    bundles,
    bundlesLoading,
    createUser,
    updateUser,
    fetchUserById,
    showErrorToast,
    showWarningToast, // Already available from AppContext
    showInfoToast,
    refreshPayments,
  } = useContext(AppContext);

  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!userId;

  const { register, handleSubmit, reset, formState: { errors }, setError, clearErrors, getValues, formState } = useForm({
     defaultValues: {
         firstName: '',
         lastName: '',
         email: '',
         areaCode: '',
         phoneNumber: '',
         landLine: '',
         address: '',
         city: '',
         street: '',
         building: '',
         floor: '',
         googleMapsUrl: '',
     },
  });

  const userInfoValidations = {
    firstName: {
      required: 'First name is required',
      maxLength: { value: 45, message: 'First name must be at most 45 characters' },
      pattern: { value: namePattern, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
    },
    lastName: {
      required: 'Last name is required',
      maxLength: { value: 45, message: 'Last name must be at most 45 characters' },
      pattern: { value: namePattern, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
    },
    email: {
      required: 'Email is required',
      maxLength: { value: 60, message: 'Email must be at most 60 characters' },
      pattern: { value: emailPattern, message: 'Invalid email address' }
    },
    areaCode: {
      required: 'Area code is required',
      pattern: {
        value: areaCodePattern,
        message: 'Invalid area code format (e.g., +1, +44).',
      },
      maxLength: { value: 4, message: 'Area code must be at most 4 characters' },
      validate: value => commonAreaCodes.some(code => code.value === value) || 'Please select a valid area code from the list.'
    },
    phoneNumber: {
      required: 'Phone number is required',
      pattern: {
        value: digitsOnlyPattern,
        message: 'Phone number must contain only digits',
      },
      maxLength: { value: 40, message: 'Phone number must be at most 40 characters' }
    },
    landLine: {
      maxLength: { value: 45, message: 'Landline must be at most 45 characters' },
      pattern: { value: optionalDigitsOnlyPattern, message: 'Landline must contain only digits' }
    },
  };

  const primaryLocationValidations = {
    address: {
      required: "Address is required",
      maxLength: { value: 255, message: "Address must be at most 255 characters" },
      pattern: { value: locationAddressStreetPattern, message: "Address can only contain letters, numbers, spaces, and .,#/-" }
    },
    city: {
      required: "City is required",
      maxLength: { value: 45, message: "City must be at most 45 characters" },
      pattern: { value: locationCityPattern, message: "City can only contain letters, spaces, hyphens, and apostrophes" }
    },
    street: {
      required: "Street is required",
      maxLength: { value: 45, message: "Street must be at most 45 characters" },
      pattern: { value: locationAddressStreetPattern, message: "Street can only contain letters, numbers, spaces, and .,#/-" }
    },
    building: {
      required: "Building is required",
      maxLength: { value: 45, message: "Building must be at most 45 characters" },
      pattern: { value: locationBuildingFloorPattern, message: "Building can only contain letters, numbers, spaces, and hyphens" }
    },
    floor: {
      maxLength: { value: 45, message: "Floor must be at most 45 characters" },
      pattern: { value: locationBuildingFloorPattern, message: "Floor can only contain letters, numbers, spaces, and hyphens" }
    },
    googleMapsUrl: {
        maxLength: {
            value: 255,
            message: "Google Maps URL must be at most 255 characters"
        },
        pattern: {
            value: googleMapsUrlPattern,
            message: "Invalid Google Maps URL format. Must be a valid google.com/maps, goo.gl/maps, or maps.app.goo.gl URL."
        },
    },
  };

  const {
    apiError,
    selectedBundles, 
    isLoading,
    activeAccordionKey,
    showDeleteConfirm,
    showSaveConfirm,
    bundleToDelete,
    clickedBundle,
    userStatus,
    isSubmitting,
    setApiError,
    setUserStatus,
    handleAddBundle,
    handleRemoveBundle,
    handleBundleStatusChange,
    toggleAccordion,
    confirmRemoveBundle,
    prepareSubmit,
    onSubmit,
    handleModalClose,
    renderBundleLocationFields,
    handlePrimaryLocationMapPick,
  } = useUserForm({
    isEditMode,
    userId,
    fetchUserById,
    createUser,
    updateUser,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    reset,
    setError,
    clearErrors,
    navigate,
    getValues,
    refreshPayments,
  });

  if (isLoading || bundlesLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="user-form-container">
      <ConfirmationModal
        show={showDeleteConfirm}
        title="Confirm Bundle Removal"
        body="Are you sure you want to remove this bundle subscription? This action cannot be undone."
        onCancel={() => handleModalClose('delete')}
        onConfirm={() => {
          handleRemoveBundle(bundleToDelete);
          handleModalClose('delete');
        }}
        confirmVariant="danger"
        confirmText="Remove Bundle"
      />

      <ConfirmationModal
        show={showSaveConfirm}
        title={isEditMode ? "Confirm Changes" : "Confirm Creation"}
        body={isEditMode ? "Are you sure you want to update this user?" : "Are you sure you want to create this new user?"}
        onCancel={() => handleModalClose('save')}
        onConfirm={onSubmit}
        confirmVariant="primary"
        confirmText={isSubmitting ? (
          <>
            <Spinner as="span" animation="border" size="sm" className="me-2" />
            {isEditMode ? "Updating..." : "Creating..."}
          </>
        ) : (
          isEditMode ? "Update User" : "Create User"
        )}
        confirmDisabled={isSubmitting}
      />

      <div className="user-form-header">
        <h1>{isEditMode ? "Edit User" : "Create New User"}</h1>
        <Button as={Link} to="/users" variant="secondary" size="sm">
          Back to Users
        </Button>
      </div>

      <Card className="user-form-card">
        <Card.Body className="user-form-card-body">
          {apiError && (
            <Alert variant="danger" className="mb-4" onClose={() => setApiError("")} dismissible>
              {apiError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit(
            (data) => {
              console.log("RHF: Form is valid. Data:", data);
              console.log("RHF: formState.errors at validation success:", formState.errors);
              prepareSubmit(data);
            },
            (errorPayload) => {
              console.log("RHF: Form is invalid. Errors from RHF:", errorPayload);
              console.log("RHF: formState.errors at validation failure:", formState.errors);
              showErrorToast("Please correct the highlighted form errors.");
            }
          )}>
            <Row className="g-4">
              <UserInfoSection
                register={register}
                errors={errors}
                isEditMode={isEditMode}
                userStatus={userStatus}
                setUserStatus={setUserStatus}
                validations={userInfoValidations}
              />

              <PrimaryLocationSection
                register={register}
                errors={errors}
                onMapPickClick={handlePrimaryLocationMapPick}
                validations={primaryLocationValidations}
              />
            </Row>

            <hr className="my-4" />
            {(!bundles || bundles.length === 0) && !bundlesLoading && (
              <Alert variant="info" className="mb-3">
                No Bundles have been found.
              </Alert>
            )}

            <BundleSubscriptionsSection
              bundles={bundles}
              selectedBundles={selectedBundles}
              clickedBundle={clickedBundle}
              activeAccordionKey={activeAccordionKey}
              handleAddBundle={handleAddBundle}
              confirmRemoveBundle={confirmRemoveBundle}
              handleBundleStatusChange={handleBundleStatusChange}
              toggleAccordion={toggleAccordion}
              renderBundleLocationFields={renderBundleLocationFields}
              maxUserBundles={MAX_USER_BUNDLES} // Pass the limit
              showWarningToast={showWarningToast} // Pass the toast function
            />

            <div className="d-flex justify-content-end mt-4">
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
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm;