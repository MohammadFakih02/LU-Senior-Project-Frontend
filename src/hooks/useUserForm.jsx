import { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

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
  navigate,
  getValues
}) => {
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

  useEffect(() => {
    if (!isEditMode || !userId) {
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userData = await fetchUserById(userId);

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
          googleMapsUrl: userData.location?.googleMapsUrl || "",
        });

        setUserStatus(userData.status || "ACTIVE");

        if (userData.bundles?.length > 0) {
          setSelectedBundles(
            userData.bundles.map((bundle, index) => ({
              tempId: `${bundle.bundle.bundleId}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              bundleId: bundle.bundle.bundleId,
              address: bundle.bundleLocation?.address || "",
              city: bundle.bundleLocation?.city || "",
              street: bundle.bundleLocation?.street || "",
              building: bundle.bundleLocation?.building || "",
              floor: bundle.bundleLocation?.floor || "",
              googleMapsUrl: bundle.bundleLocation?.googleMapsUrl || "",
              status: bundle.status || "ACTIVE"
            }))
          );
        } else {
          setSelectedBundles([]);
        }
      } catch (error) {
        setApiError(error.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isEditMode, userId, fetchUserById, reset, setUserStatus, setSelectedBundles, setApiError]);

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

  const prepareSubmit = useCallback((data) => {
    if (!validateBundleLocations()) {
      showErrorToast("Please fix bundle location errors");
      return;
    }
    setFormData(data);
    setShowSaveConfirm(true);
  }, [validateBundleLocations, showErrorToast]);

  const onSubmit = useCallback(async () => {
    setShowSaveConfirm(false);
    setIsSubmitting(true);
    setApiError("");
    clearErrors();
    setValidationErrors({});

    if (!validateBundleLocations()) {
         showErrorToast("Bundle validation failed. Please re-check.");
         setIsSubmitting(false);
         return;
    }

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
        googleMapsUrl: formData.googleMapsUrl || null,
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
          googleMapsUrl: bundle.googleMapsUrl || null,
        },
      })),
    };

    try {
      if (isEditMode) {
        await updateUser(userId, userData);
      } else {
        await createUser(userData);
      }

      navigate("/users");
    } catch (error) {
       console.error("Submission error:", error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
           const bundleMatch = err.field.match(/^bundleSubscriptions\[(\d+)\].location\.(\w+)$/);
           if(bundleMatch) {
              const index = parseInt(bundleMatch[1], 10);
              const field = bundleMatch[2];
              const bundleTempId = selectedBundles[index]?.tempId;
              if(bundleTempId) {
                 setValidationErrors(prev => ({
                    ...prev,
                    [`${field}-${bundleTempId}`]: err.message
                 }));
              } else {
                 console.warn(`Server error for bundle index ${index} not found in state.`);
              }
           } else if (err.field === 'location.address') {
               setError('address', { type: 'server', message: err.message });
           } else if (err.field === 'location.city') {
               setError('city', { type: 'server', message: err.message });
           }
           else {
             setError(err.field, {
               type: "server",
               message: err.message,
             });
           }
        });
      } else {
        const errorMsg = error.response?.data?.message || error.message || "An unexpected error occurred";
        setApiError(errorMsg);
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
    setError,
    validateBundleLocations,
    setValidationErrors
  ]);

   const openGoogleMaps = useCallback((locationData, existingUrl) => {
    let urlToOpen = '';

    const googleMapsUrlRegex = /^(https?:\/\/)?(www\.)?google\.com\/maps\/.+/i;

    if (existingUrl && googleMapsUrlRegex.test(existingUrl)) {
        urlToOpen = existingUrl;
    } else {
        const {  city } = locationData;
        const queryParts = [];
        if (city) queryParts.push(city);

        const queryString = queryParts.join(', ');

        if (queryString) {
            urlToOpen = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryString)}`;
        } else {
             urlToOpen = `https://www.google.com/maps`;
             showWarningToast("No address data available to generate search query. Opening general Google Maps.");
        }
    }

    if (urlToOpen) {
        window.open(urlToOpen, '_blank');
    }
   }, [showWarningToast]);

  const handlePrimaryLocationMapPick = useCallback(() => {
    const {
        address,
        city,
        street,
        building,
        floor,
        googleMapsUrl
    } = getValues(); // Get all form values as an object
    const primaryLocationData = { address, city, street, building, floor, googleMapsUrl };
    openGoogleMaps(primaryLocationData, primaryLocationData.googleMapsUrl);
  }, [getValues, openGoogleMaps]);


  const handleBundleLocationMapPick = useCallback((tempId) => {
    const bundle = selectedBundles.find(b => b.tempId === tempId);
    if (bundle) {
      const bundleLocationData = {
        address: bundle.address,
        city: bundle.city,
        street: bundle.street,
        building: bundle.building,
        floor: bundle.floor,
      };
      openGoogleMaps(bundleLocationData, bundle.googleMapsUrl);
    }
  }, [selectedBundles, openGoogleMaps]);


  const handleAddBundle = useCallback((bundleId) => {
    setClickedBundle(bundleId);
    setTimeout(() => setClickedBundle(null), 300);

    const newBundle = {
      tempId: `${bundleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bundleId,
      address: "",
      city: "",
      street: "",
      building: "",
      floor: "",
      googleMapsUrl: "",
      status: "ACTIVE"
    };
    setSelectedBundles(prev => [...prev, newBundle]);
    setActiveAccordionKey(newBundle.tempId);
    showInfoToast("Bundle added! Configure its location below");
  }, [showInfoToast]);

  const handleRemoveBundle = useCallback((tempId) => {
    setSelectedBundles(prev => {
        const updatedBundles = prev.filter(b => b.tempId !== tempId);
        if (activeAccordionKey === tempId) {
             setActiveAccordionKey(null);
        }
        return updatedBundles;
    });

    setValidationErrors(prev => {
      const newErrors = {...prev};
      Object.keys(newErrors).forEach(key => {
        if (key.includes(tempId)) {
           delete newErrors[key];
        }
      });
      return newErrors;
    });

    showWarningToast("Bundle removed");
  }, [activeAccordionKey, setValidationErrors, showWarningToast]);

  const handleBundleLocationChange = useCallback((tempId, field, value) => {
    setSelectedBundles(prev => prev.map(b =>
      b.tempId === tempId ? {...b, [field]: value} : b
    ));

    if ((field === 'address' || field === 'city') && value) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        if (newErrors[`${field}-${tempId}`]) {
           delete newErrors[`${field}-${tempId}`];
        }
        return newErrors;
      });
    }
  }, [setValidationErrors]);


  const handleBundleStatusChange = useCallback((tempId, newStatus) => {
    setSelectedBundles(prev => prev.map(b =>
      b.tempId === tempId ? {...b, status: newStatus} : b
    ));
  }, []);

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
      setFormData(null);
      setIsSubmitting(false);
    }
  }, []);

  const handleSetBundleLocationToPrimary = useCallback((bundleTempId) => {
    const {
      address: primaryAddress,
      city: primaryCity,
      street: primaryStreet,
      building: primaryBuilding,
      floor: primaryFloor,
      googleMapsUrl: primaryGoogleMapsUrl,
    } = getValues(); // Gets all registered form values

    setSelectedBundles(prevBundles =>
      prevBundles.map(b => {
        if (b.tempId === bundleTempId) {
          return {
            ...b,
            address: primaryAddress || "",
            city: primaryCity || "",
            street: primaryStreet || "",
            building: primaryBuilding || "",
            floor: primaryFloor || "",
            googleMapsUrl: primaryGoogleMapsUrl || "",
          };
        }
        return b;
      })
    );

    // Clear validation errors for this bundle's address and city if they now have values
    setValidationErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      if (primaryAddress) delete newErrors[`address-${bundleTempId}`];
      if (primaryCity) delete newErrors[`city-${bundleTempId}`];
      return newErrors;
    });

    showInfoToast("Bundle location set to user's primary location.");
  }, [getValues, setSelectedBundles, setValidationErrors, showInfoToast]);


  const renderBundleLocationFields = useCallback((bundle) => (
    <Row className="g-3">
      <Col md={12} className="mb-3">
        <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleSetBundleLocationToPrimary(bundle.tempId)}
        >
            Use Primary Location
        </Button>
      </Col>

      <Col md={12}>
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
      <Col md={12}>
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
      <Col md={12}>
        <Form.Group controlId={`bundleStreet-${bundle.tempId}`}>
          <Form.Label>Street</Form.Label>
          <Form.Control
            type="text"
            value={bundle.street}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'street', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleBuilding-${bundle.tempId}`}>
          <Form.Label>Building</Form.Label>
          <Form.Control
            type="text"
            value={bundle.building}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'building', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleFloor-${bundle.tempId}`}>
          <Form.Label>Floor</Form.Label>
          <Form.Control
            type="text"
            value={bundle.floor}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'floor', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group controlId={`bundleGoogleMapsUrl-${bundle.tempId}`}>
          <Form.Label>Google Maps URL (Optional)</Form.Label>
          <Form.Control
            type="text"
            value={bundle.googleMapsUrl}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'googleMapsUrl', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={12} className="d-flex justify-content-end align-items-center mt-2"> {/* Changed to justify-content-end as only one button remains here */}
        <Button variant="outline-secondary" size="sm" onClick={() => handleBundleLocationMapPick(bundle.tempId)}>
          Pick on Map / View Map
        </Button>
      </Col>

    </Row>
  ), [handleBundleLocationChange, handleBundleLocationMapPick, validationErrors, handleSetBundleLocationToPrimary]);


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
    renderBundleLocationFields,
    handlePrimaryLocationMapPick,
  };
};

export default useUserForm;