import { useState, useEffect, useCallback } from "react";
import { Row, Col, Form } from "react-bootstrap";

const useUserForm = ({ 
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
  navigate
}) => {
  // State declarations
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [clickedBundle, setClickedBundle] = useState(null);
  const [userStatus, setUserStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formData, setFormData] = useState(null);

  // Load user data in edit mode
  useEffect(() => {
    if (!isEditMode || !userId) return;

    const loadUserData = async () => {
      try {
        const userData = await fetchUserById(userId);
        
        // Reset form with user data
        reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          address: userData.location?.address,
          city: userData.location?.city,
          street: userData.location?.street,
          building: userData.location?.building,
          floor: userData.location?.floor,
        });

        setUserStatus(userData.status || "ACTIVE");

        // Set bundle subscriptions if they exist
        if (userData.bundles?.length > 0) {
          setSelectedBundles(
            userData.bundles.map((bundle, index) => ({
              tempId: `${bundle.bundle.bundleId}-${index}-${Date.now()}`,
              bundleId: bundle.bundle.bundleId,
              address: bundle.bundleLocation?.address || "",
              city: bundle.bundleLocation?.city || "",
              street: bundle.bundleLocation?.street || "",
              building: bundle.bundleLocation?.building || "",
              floor: bundle.bundleLocation?.floor || "",
              status: bundle.status || "ACTIVE"
            }))
          );
        }
      } catch (error) {
        showErrorToast(error.message || "Failed to load user data");
        setApiError(error.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isEditMode, userId, fetchUserById, reset, showErrorToast]);

  // Validate bundle locations
  const validateBundleLocations = useCallback(() => {
    const bundleErrors = {};
    let isValid = true;

    selectedBundles.forEach((bundle) => {
      if (!bundle.address) {
        bundleErrors[`address-${bundle.tempId}`] = "Address is required";
        isValid = false;
      }
      if (!bundle.city) {
        bundleErrors[`city-${bundle.tempId}`] = "City is required";
        isValid = false;
      }
    });

    setValidationErrors(bundleErrors);
    return isValid;
  }, [selectedBundles]);

  // Prepare form submission
  const prepareSubmit = useCallback((data) => {
    if (!validateBundleLocations()) {
      showErrorToast("Please fix bundle location errors");
      return;
    }
    setFormData(data);
    setShowSaveConfirm(true);
  }, [validateBundleLocations, showErrorToast]);

  // Handle form submission
  const onSubmit = useCallback(async () => {
    setShowSaveConfirm(false);
    setIsSubmitting(true);
    setApiError("");
    setValidationErrors({});
    clearErrors();

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        status: userStatus,
        location: {
          address: formData.address,
          city: formData.city,
          street: formData.street,
          building: formData.building,
          floor: formData.floor,
        },
        bundleSubscriptions: selectedBundles.map((bundle) => ({
          bundleId: bundle.bundleId,
          status: bundle.status,
          location: {
            address: bundle.address,
            city: bundle.city,
            street: bundle.street,
            building: bundle.building,
            floor: bundle.floor,
          },
        })),
      };

      if (isEditMode) {
        await updateUser(userId, userData);
      } else {
        await createUser(userData);
      }

      setTimeout(() => navigate("/users"), 1000);
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          setError(err.field, {
            type: "server",
            message: err.message,
          });
        });
        showErrorToast("Please fix the form errors");
      } else {
        const errorMsg = error.response?.data?.message || error.message || "An unexpected error occurred";
        setApiError(errorMsg);
        showErrorToast(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData, 
    isEditMode, 
    userId, 
    userStatus, 
    selectedBundles, 
    updateUser, 
    createUser, 
    navigate, 
    showErrorToast, 
    clearErrors, 
    setError
  ]);

  // Bundle management functions
  const handleAddBundle = useCallback((bundleId) => {
    setClickedBundle(bundleId);
    setTimeout(() => setClickedBundle(null), 300);

    const newBundle = {
      tempId: `${bundleId}-${Date.now()}`,
      bundleId,
      address: "",
      city: "",
      street: "",
      building: "",
      floor: "",
      status: "ACTIVE"
    };
    setSelectedBundles(prev => [...prev, newBundle]);
    setActiveAccordionKey(newBundle.tempId);
    showInfoToast("Bundle added! Configure its location below");
  }, [showInfoToast]);

  const handleRemoveBundle = useCallback((tempId) => {
    setSelectedBundles(prev => prev.filter(b => b.tempId !== tempId));
    if (activeAccordionKey === tempId) setActiveAccordionKey(null);
    
    // Clear related validation errors
    const newErrors = {...validationErrors};
    Object.keys(newErrors).forEach(key => {
      if (key.includes(tempId)) delete newErrors[key];
    });
    setValidationErrors(newErrors);
    showWarningToast("Bundle removed");
  }, [activeAccordionKey, validationErrors, showWarningToast]);

  const handleBundleLocationChange = useCallback((tempId, field, value) => {
    setSelectedBundles(prev => prev.map(b => 
      b.tempId === tempId ? {...b, [field]: value} : b
    ));
    
    // Clear error if field is corrected
    if (validationErrors[`${field}-${tempId}`]) {
      const newErrors = {...validationErrors};
      delete newErrors[`${field}-${tempId}`];
      setValidationErrors(newErrors);
    }
  }, [validationErrors]);

  const handleBundleStatusChange = useCallback((tempId, newStatus) => {
    setSelectedBundles(prev => prev.map(b => 
      b.tempId === tempId ? {...b, status: newStatus} : b
    ));
  }, []);

  // UI interaction functions
  const toggleAccordion = useCallback((key) => {
    setActiveAccordionKey(prev => prev === key ? null : key);
  }, []);

  const confirmRemoveBundle = useCallback((tempId) => {
    setBundleToDelete(tempId);
    setShowDeleteConfirm(true);
  }, []);

  const handleModalClose = useCallback((type) => {
    if (type === 'delete') {
      setShowDeleteConfirm(false);
      setBundleToDelete(null);
    } else {
      setShowSaveConfirm(false);
    }
  }, []);

  // Render function for bundle location fields
  const renderBundleLocationFields = useCallback((bundle) => (
    <Row className="g-3">
      <Col md={6}>
        <Form.Group controlId={`bundleAddress-${bundle.tempId}`}>
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            value={bundle.address}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'address', e.target.value)}
            isInvalid={!!validationErrors[`address-${bundle.tempId}`]}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`address-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleCity-${bundle.tempId}`}>
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            value={bundle.city}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'city', e.target.value)}
            isInvalid={!!validationErrors[`city-${bundle.tempId}`]}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`city-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleStreet-${bundle.tempId}`}>
          <Form.Label>Street</Form.Label>
          <Form.Control
            type="text"
            value={bundle.street}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'street', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId={`bundleBuilding-${bundle.tempId}`}>
          <Form.Label>Building</Form.Label>
          <Form.Control
            type="text"
            value={bundle.building}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'building', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group controlId={`bundleFloor-${bundle.tempId}`}>
          <Form.Label>Floor</Form.Label>
          <Form.Control
            type="text"
            value={bundle.floor}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'floor', e.target.value)}
          />
        </Form.Group>
      </Col>
    </Row>
  ), [handleBundleLocationChange, validationErrors]);

  // Return all state and handlers
  return {
    apiError,
    validationErrors,
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
    handleBundleLocationChange,
    handleBundleStatusChange,
    toggleAccordion,
    confirmRemoveBundle,
    prepareSubmit,
    onSubmit,
    handleModalClose,
    renderBundleLocationFields
  };
};

export default useUserForm;