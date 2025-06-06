import { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

// Renamed existing pattern and added specific Google Maps pattern
const GENERAL_URL_REGEX_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const GOOGLE_MAPS_URL_REGEX_PATTERN = /^(https?:\/\/)?(www\.)?(google\.([a-z.]{2,6})\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)(\/.*)?$/i;

// Patterns for bundle location validation
const LOCATION_ADDRESS_STREET_REGEX_PATTERN = /^[A-Za-z0-9À-ÖØ-öø-ÿ\s.,#/-]+$/;
const LOCATION_CITY_REGEX_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const LOCATION_BUILDING_FLOOR_REGEX_PATTERN = /^[A-Za-z0-9\s-]+$/;


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
  getValues,
  refreshPayments,
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
        let initialAreaCode = "";
        let initialPhoneNumber = "";

        if (userData.phone) {
          const phoneStr = String(userData.phone);
          const phonePatternMatch = phoneStr.match(/^(\+\d{1,3})(\d+)$/);

          if (phonePatternMatch && phonePatternMatch[1] && phonePatternMatch[2]) {
            initialAreaCode = phonePatternMatch[1];
            initialPhoneNumber = phonePatternMatch[2];
          } else {
            if (phoneStr.startsWith('+')) {
              initialAreaCode = phoneStr;
            } else {
              initialPhoneNumber = phoneStr;
            }
          }
        }

        reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          areaCode: initialAreaCode,
          phoneNumber: initialPhoneNumber,
          landLine: userData.landLine || "",
          address: userData.location?.address || "",
          city: userData.location?.city || "",
          street: userData.location?.street || "",
          building: userData.location?.building || "",
          floor: userData.location?.floor || "",
          googleMapsUrl: userData.location?.googleMapsUrl || "",
        });

        setUserStatus(userData.status || "ACTIVE");

        if (userData.bundles?.length > 0) {
          const mappedBundles = userData.bundles.map((bundleSubscription, index) => ({
            isExisting: true,
            tempId: `${bundleSubscription.bundle.bundleId}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            bundleId: bundleSubscription.bundle.bundleId,
            address: bundleSubscription.bundleLocation?.address || "",
            city: bundleSubscription.bundleLocation?.city || "",
            street: bundleSubscription.bundleLocation?.street || "",
            building: bundleSubscription.bundleLocation?.building || "",
            floor: bundleSubscription.bundleLocation?.floor || "",
            googleMapsUrl: bundleSubscription.bundleLocation?.googleMapsUrl || "",
            status: bundleSubscription.status || "ACTIVE",
            subscriptionDate: bundleSubscription.subscriptionDate
          }));
          setSelectedBundles(mappedBundles);
        } else {
          setSelectedBundles([]);
        }
      } catch (error) {
        setApiError(error.message || "Failed to load user data");
        showErrorToast("Error loading user data. " + (error.message || ""));
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isEditMode, userId, fetchUserById, reset, showErrorToast]);

  const validateBundleLocations = useCallback(() => {
    const bundleErrors = {};
    let isValid = true;

    selectedBundles.forEach((bundle) => {
      // Address Validation
      if (!bundle.address) {
        bundleErrors[`address-${bundle.tempId}`] = "Address is required";
        isValid = false;
      } else if (bundle.address.length > 255) {
        bundleErrors[`address-${bundle.tempId}`] = "Address must be at most 255 characters";
        isValid = false;
      } else if (!LOCATION_ADDRESS_STREET_REGEX_PATTERN.test(bundle.address)) {
        bundleErrors[`address-${bundle.tempId}`] = "Address can only contain letters, numbers, spaces, and .,#/-";
        isValid = false;
      }

      // City Validation
      if (!bundle.city) {
        bundleErrors[`city-${bundle.tempId}`] = "City is required";
        isValid = false;
      } else if (bundle.city.length > 45) {
        bundleErrors[`city-${bundle.tempId}`] = "City must be at most 45 characters";
        isValid = false;
      } else if (!LOCATION_CITY_REGEX_PATTERN.test(bundle.city)) {
        bundleErrors[`city-${bundle.tempId}`] = "City can only contain letters, spaces, hyphens, and apostrophes";
        isValid = false;
      }

      // Street Validation
      if (!bundle.street) {
        bundleErrors[`street-${bundle.tempId}`] = "Street is required";
        isValid = false;
      } else if (bundle.street.length > 45) {
        bundleErrors[`street-${bundle.tempId}`] = "Street must be at most 45 characters";
        isValid = false;
      } else if (!LOCATION_ADDRESS_STREET_REGEX_PATTERN.test(bundle.street)) {
        bundleErrors[`street-${bundle.tempId}`] = "Street can only contain letters, numbers, spaces, and .,#/-";
        isValid = false;
      }

      // Building Validation
      if (!bundle.building) {
        bundleErrors[`building-${bundle.tempId}`] = "Building is required";
        isValid = false;
      } else if (bundle.building.length > 45) {
        bundleErrors[`building-${bundle.tempId}`] = "Building must be at most 45 characters";
        isValid = false;
      } else if (!LOCATION_BUILDING_FLOOR_REGEX_PATTERN.test(bundle.building)) {
        bundleErrors[`building-${bundle.tempId}`] = "Building can only contain letters, numbers, spaces, and hyphens";
        isValid = false;
      }

      // Floor Validation (Optional)
      if (bundle.floor) {
        if (bundle.floor.length > 45) {
          bundleErrors[`floor-${bundle.tempId}`] = "Floor must be at most 45 characters";
          isValid = false;
        } else if (!LOCATION_BUILDING_FLOOR_REGEX_PATTERN.test(bundle.floor)) {
          bundleErrors[`floor-${bundle.tempId}`] = "Floor can only contain letters, numbers, spaces, and hyphens";
          isValid = false;
        }
      }

      // Google Maps URL Validation (Optional)
      if (bundle.googleMapsUrl) {
        if (bundle.googleMapsUrl.length > 255) {
          bundleErrors[`googleMapsUrl-${bundle.tempId}`] = "URL must be at most 255 characters";
          isValid = false;
        } else if (!GOOGLE_MAPS_URL_REGEX_PATTERN.test(bundle.googleMapsUrl)) {
          bundleErrors[`googleMapsUrl-${bundle.tempId}`] = "Invalid Google Maps URL format. Must be a valid google.com/maps, goo.gl/maps, or maps.app.goo.gl URL.";
          isValid = false;
        }
      }
    });
    setValidationErrors(bundleErrors);
    return isValid;
  }, [selectedBundles]);

  const prepareSubmit = useCallback((data) => {
    clearErrors();
    setValidationErrors({});
    setApiError("");

    if (!validateBundleLocations()) {
      showErrorToast("Please fix errors in Bundle Subscriptions.");
      return;
    }
    setFormData(data);
    setShowSaveConfirm(true);
  }, [validateBundleLocations, showErrorToast, clearErrors]);

  const onSubmit = useCallback(async () => {
    setShowSaveConfirm(false);
    setIsSubmitting(true);
    setApiError("");

    if (!validateBundleLocations()) {
         showErrorToast("Bundle validation failed. Please re-check.");
         setIsSubmitting(false);
         return;
    }

    const combinedPhone = (formData.areaCode && formData.phoneNumber)
                          ? `${formData.areaCode}${formData.phoneNumber}`
                          : null;

    const userPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: combinedPhone,
      landLine: formData.landLine || null,
      status: userStatus,
      location: {
        address: formData.address,
        city: formData.city,
        street: formData.street,
        building: formData.building,
        floor: formData.floor || null,
        googleMapsUrl: formData.googleMapsUrl || null,
      },
      bundleSubscriptions: selectedBundles.map((bundle) => ({
        bundleId: bundle.bundleId,
        status: bundle.status,
        subscriptionDate: bundle.subscriptionDate || new Date().toISOString().split('T')[0],
        location: {
          address: bundle.address,
          city: bundle.city,
          street: bundle.street,
          building: bundle.building,
          floor: bundle.floor || null,
          googleMapsUrl: bundle.googleMapsUrl || null,
        },
      })),
    };

    try {
      let response;
      if (isEditMode) {
        response = await updateUser(userId, userPayload);
      } else {
        response = await createUser(userPayload);
      }

      let newSubscriptionAdded = false;
      if (userPayload.bundleSubscriptions && userPayload.bundleSubscriptions.length > 0) {
        if (!isEditMode) {
          newSubscriptionAdded = true;
        } else {
          for (const sub of selectedBundles) {
            if (!sub.isExisting) {
              newSubscriptionAdded = true;
              break;
            }
          }
        }
      }
      
      if (newSubscriptionAdded) {
        showInfoToast("Payment automatically created for new bundle subscription(s).");
        if (refreshPayments) {
          refreshPayments({ showToast: false });
        }
      }

      navigate(`/users/${response.userId || userId}`);

    } catch (error) {
      if (error.response?.data?.errors) {
        let hasRHFError = false;
        let hasBundleError = false;
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
                 hasBundleError = true;
              } else {
                 setApiError(prev => `${prev} Server error for bundle: ${err.field} - ${err.message}. `);
              }
           } else if (err.field.startsWith('location.')) {
              const RHFField = err.field.split('.')[1];
              setError(RHFField, { type: 'server', message: err.message });
              hasRHFError = true;
           }
           else if (err.field === "areaCode" || err.field === "phoneNumber") {
             setError(err.field, { type: "server", message: err.message });
             hasRHFError = true;
           }
            else {
             setError(err.field, {
               type: "server",
               message: err.message,
             });
             hasRHFError = true;
           }
        });

        if (hasRHFError && !hasBundleError) {
            showErrorToast("Please correct the highlighted form errors.");
        } else if (hasBundleError && !hasRHFError) {
            showErrorToast("Please correct errors in Bundle Subscriptions.");
        } else if (hasBundleError && hasRHFError) {
            showErrorToast("Please correct errors in the form and Bundle Subscriptions.");
        } else if (!hasRHFError && !hasBundleError && error.response.data.message) {
            setApiError(error.response.data.message);
            showErrorToast(error.response.data.message);
        } else if (!hasRHFError && !hasBundleError) {
            setApiError("Validation errors occurred. Please check your input.");
            showErrorToast("Validation errors occurred. Please check your input.");
        }

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
    showInfoToast,
    setError,
    validateBundleLocations,
    refreshPayments,
  ]);

   const openGoogleMaps = useCallback((locationData, existingUrl) => {
    let urlToOpen = '';
    
    if (existingUrl && GOOGLE_MAPS_URL_REGEX_PATTERN.test(existingUrl)) { // Check specific Google Maps URL first
        urlToOpen = existingUrl;
    } else if (existingUrl && GENERAL_URL_REGEX_PATTERN.test(existingUrl)) { // Fallback to any valid URL
        urlToOpen = existingUrl;
    }
    else {
        const { address, city, street, building } = locationData;
        const queryParts = [];
        if (street && building && city) queryParts.push(`${building} ${street}`, city);
        else if (street && city) queryParts.push(street, city);
        else if (address && city) queryParts.push(address, city);
        else if (address) queryParts.push(address);
        else if (city) queryParts.push(city);

        const queryString = queryParts.join(', ');

        if (queryString) {
            urlToOpen = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryString)}`;
        } else {
             urlToOpen = `https://www.google.com/maps`;
             showWarningToast("No address data to generate search query. Opening general Google Maps.");
        }
    }

    if (urlToOpen) {
        if (!/^https?:\/\//i.test(urlToOpen)) {
            urlToOpen = 'https://' + urlToOpen;
        }
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    }
   }, [showWarningToast]);

  const handlePrimaryLocationMapPick = useCallback(() => {
    const {
        address,
        city,
        street,
        building,
        googleMapsUrl
    } = getValues();
    const primaryLocationData = { address, city, street, building };
    openGoogleMaps(primaryLocationData, googleMapsUrl);
  }, [getValues, openGoogleMaps]);


  const handleBundleLocationMapPick = useCallback((tempId) => {
    const bundle = selectedBundles.find(b => b.tempId === tempId);
    if (bundle) {
      const bundleLocationData = {
        address: bundle.address,
        city: bundle.city,
        street: bundle.street,
        building: bundle.building,
      };
      openGoogleMaps(bundleLocationData, bundle.googleMapsUrl);
    }
  }, [selectedBundles, openGoogleMaps]);


  const handleAddBundle = useCallback((bundleId) => {
    setClickedBundle(bundleId);
    setTimeout(() => setClickedBundle(null), 300);

    const newBundle = {
      isExisting: false,
      tempId: `${bundleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bundleId,
      address: "",
      city: "",
      street: "",
      building: "",
      floor: "",
      googleMapsUrl: "",
      status: "ACTIVE",
      subscriptionDate: new Date().toISOString().split('T')[0]
    };
    setSelectedBundles(prev => [...prev, newBundle]);
    setActiveAccordionKey(newBundle.tempId);
    showInfoToast("Bundle added! Configure its location below.");
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

    showWarningToast("Bundle subscription removed.");
  }, [activeAccordionKey, showWarningToast]);

  const handleBundleLocationChange = useCallback((tempId, field, value) => {
    setSelectedBundles(prev => prev.map(b =>
      b.tempId === tempId ? {...b, [field]: value} : b
    ));

    if (validationErrors[`${field}-${tempId}`]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[`${field}-${tempId}`];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleBundleStatusChange = useCallback((tempId, newStatus) => {
    setSelectedBundles(prev => prev.map(b =>
      b.tempId === tempId ? {...b, status: newStatus} : b
    ));
  }, []);

  const toggleAccordion = useCallback((key) => {
    setActiveAccordionKey(prev => prev === key ? null : String(key));
  }, []);

  const confirmRemoveBundle = useCallback((tempId) => {
    setBundleToDelete(tempId);
    setShowDeleteConfirm(true);
  }, []);

  const handleModalClose = useCallback((type) => {
    if (type === 'delete') {
      setShowDeleteConfirm(false);
      setBundleToDelete(null);
    } else if (type === 'save') {
      setShowSaveConfirm(false);
    }
  }, []);

  const handleSetBundleLocationToPrimary = useCallback((bundleTempId) => {
    const primaryLocationValues = getValues();

    setSelectedBundles(prevBundles =>
      prevBundles.map(b => {
        if (b.tempId === bundleTempId) {
          return {
            ...b,
            address: primaryLocationValues.address || "",
            city: primaryLocationValues.city || "",
            street: primaryLocationValues.street || "",
            building: primaryLocationValues.building || "",
            floor: primaryLocationValues.floor || "",
            googleMapsUrl: primaryLocationValues.googleMapsUrl || "",
          };
        }
        return b;
      })
    );

    // Clear validation errors for this bundle if primary location data is valid for those fields
    setValidationErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      const fieldsToClearForBundle = ['address', 'city', 'street', 'building', 'floor', 'googleMapsUrl'];
      fieldsToClearForBundle.forEach(field => {
          const primaryValue = primaryLocationValues[field];
          let fieldIsValidBasedOnPrimary = false;

          if (field === 'address' || field === 'street') {
            fieldIsValidBasedOnPrimary = primaryValue && LOCATION_ADDRESS_STREET_REGEX_PATTERN.test(primaryValue);
          } else if (field === 'city') {
            fieldIsValidBasedOnPrimary = primaryValue && LOCATION_CITY_REGEX_PATTERN.test(primaryValue);
          } else if (field === 'building' || field === 'floor') {
            fieldIsValidBasedOnPrimary = (!primaryValue && field === 'floor') || (primaryValue && LOCATION_BUILDING_FLOOR_REGEX_PATTERN.test(primaryValue));
          } else if (field === 'googleMapsUrl') {
            fieldIsValidBasedOnPrimary = !primaryValue || (primaryValue && GOOGLE_MAPS_URL_REGEX_PATTERN.test(primaryValue));
          }
          
          // Required fields must have a value
          const isRequired = ['address', 'city', 'street', 'building'].includes(field);
          if (isRequired && !primaryValue) {
            fieldIsValidBasedOnPrimary = false; // Will be caught by main validation anyway
          }


          if (fieldIsValidBasedOnPrimary || (isRequired && primaryValue) || (!isRequired && !primaryValue)) {
             delete newErrors[`${field}-${bundleTempId}`];
          }
      });
      return newErrors;
    });

    showInfoToast("Bundle location set to user's primary location.");
  }, [getValues, showInfoToast]);

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
            required
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
            required
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
            isInvalid={!!validationErrors[`street-${bundle.tempId}`]}
            required
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`street-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleBuilding-${bundle.tempId}`}>
          <Form.Label>Building</Form.Label>
          <Form.Control
            type="text"
            value={bundle.building}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'building', e.target.value)}
            isInvalid={!!validationErrors[`building-${bundle.tempId}`]}
            required
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`building-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleFloor-${bundle.tempId}`}>
          <Form.Label>Floor (Optional)</Form.Label>
          <Form.Control
            type="text"
            value={bundle.floor}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'floor', e.target.value)}
            isInvalid={!!validationErrors[`floor-${bundle.tempId}`]}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`floor-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group controlId={`bundleGoogleMapsUrl-${bundle.tempId}`}>
          <Form.Label>Google Maps URL (Optional)</Form.Label>
          <Form.Control
            type="text"
            value={bundle.googleMapsUrl}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'googleMapsUrl', e.target.value)}
            isInvalid={!!validationErrors[`googleMapsUrl-${bundle.tempId}`]}
            placeholder="e.g., https://maps.google.com/..."
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`googleMapsUrl-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={12} className="d-flex justify-content-end align-items-center mt-2">
        <Button variant="outline-secondary" size="sm" onClick={() => handleBundleLocationMapPick(bundle.tempId)}>
          Pick on Map / View Map
        </Button>
      </Col>

    </Row>
  ), [handleBundleLocationChange, handleBundleLocationMapPick, validationErrors, handleSetBundleLocationToPrimary]);


  return {
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
  };
};

export default useUserForm;