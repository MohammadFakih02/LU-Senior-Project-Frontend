import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Form, Row, Col, Alert, Badge, Spinner, Accordion, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppContext from '../context/AppContext';

const UserForm = () => {
  const { 
    bundles,
    bundlesLoading,
    createUser,
    updateUser,
    fetchUserById
  } = useContext(AppContext);
  
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!userId;
  const [apiError, setApiError] = useState('');
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [clickedBundle, setClickedBundle] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
  } = useForm();

  useEffect(() => {
    if (!isEditMode || !userId) return;
    
    const loadUserData = async () => {
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
        });
        
        if (userData.bundles && userData.bundles.length > 0) {
          setSelectedBundles(userData.bundles.map((bundle, index) => ({
            tempId: `${bundle.bundle.bundleId}-${index}-${Date.now()}`,
            bundleId: bundle.bundle.bundleId,
            address: bundle.bundleLocation?.address || '',
            city: bundle.bundleLocation?.city || '',
            street: bundle.bundleLocation?.street || '',
            building: bundle.bundleLocation?.building || '',
            floor: bundle.bundleLocation?.floor || ''
          })));
        }
      } catch (error) {
        setApiError(error.message || 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [isEditMode, userId, reset, fetchUserById]);

  const onSubmit = async (data) => {
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: {
          address: data.address,
          city: data.city,
          street: data.street,
          building: data.building,
          floor: data.floor
        },
        bundleSubscriptions: selectedBundles.map(bundle => ({
          bundleId: bundle.bundleId,
          location: {
            address: bundle.address,
            city: bundle.city,
            street: bundle.street,
            building: bundle.building,
            floor: bundle.floor
          }
        }))
      };

      if (isEditMode) {
        await updateUser(userId, userData);
        toast.success('User updated successfully!');
      } else {
        await createUser(userData);
        toast.success('User created successfully!');
      }
      
      setTimeout(() => navigate('/users'), 1500);
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleAddBundle = (bundleId) => {
    setClickedBundle(bundleId);
    setTimeout(() => setClickedBundle(null), 300);
    
    const newBundle = {
      tempId: `${bundleId}-${Date.now()}`,
      bundleId,
      address: '',
      city: '',
      street: '',
      building: '',
      floor: ''
    };
    setSelectedBundles([...selectedBundles, newBundle]);
    setActiveAccordionKey(newBundle.tempId);
    
    toast.info('Bundle added! Configure its location below', { autoClose: 3000 });
  };

  const handleRemoveBundle = (tempId) => {
    setSelectedBundles(selectedBundles.filter(b => b.tempId !== tempId));
    if (activeAccordionKey === tempId) setActiveAccordionKey(null);
    toast.warning('Bundle removed', { autoClose: 3000 });
  };

  const handleBundleLocationChange = (tempId, field, value) => {
    setSelectedBundles(selectedBundles.map(b => 
      b.tempId === tempId ? { ...b, [field]: value } : b
    ));
  };

  const toggleAccordion = (key) => {
    setActiveAccordionKey(activeAccordionKey === key ? null : key);
  };

  const confirmRemoveBundle = (tempId) => {
    setBundleToDelete(tempId);
    setShowDeleteConfirm(true);
  };

  if (isLoading || bundlesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="p-3">
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to remove this bundle subscription?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            handleRemoveBundle(bundleToDelete);
            setShowDeleteConfirm(false);
          }}>Remove</Button>
        </Modal.Footer>
      </Modal>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
        <Button as={Link} to="/users" variant="secondary" size="sm">Back to Users</Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {apiError && <Alert variant="danger" className="mb-4">{apiError}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-4">
              <Col md={6}>
                <h4 className="mb-3">User Information</h4>
                
                <Form.Group controlId="firstName" className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    isInvalid={!!errors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="lastName" className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    isInvalid={!!errors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    {...register('phone')}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <h4 className="mb-3">Primary Location</h4>
                
                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('address', { required: 'Address is required' })}
                    isInvalid={!!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">{errors.address?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="city" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('city', { required: 'City is required' })}
                    isInvalid={!!errors.city}
                  />
                  <Form.Control.Feedback type="invalid">{errors.city?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="street" className="mb-3">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('street')}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="building">
                      <Form.Label>Building</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('building')}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="floor">
                      <Form.Label>Floor</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('floor')}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            <hr className="my-4" />

            <h4 className="mb-3">Bundle Subscriptions</h4>
            
            <div className="mb-4">
              <Form.Label>Available Bundles</Form.Label>
              <Row xs={1} md={2} lg={3} className="g-3">
                {bundles.map(bundle => (
                  <Col key={bundle.bundleId}>
                    <Card 
                      className={`h-100 shadow-sm ${clickedBundle === bundle.bundleId ? 'click-animation' : ''}`}
                      onClick={() => handleAddBundle(bundle.bundleId)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: clickedBundle === bundle.bundleId ? '2px solid var(--bs-primary)' : '',
                        transform: clickedBundle === bundle.bundleId ? 'scale(0.95)' : 'scale(1)'
                      }}
                    >
                      <Card.Header className="d-flex justify-content-between align-items-center bg-dark text-white py-2">
                        <h6 className="mb-0">{bundle.name}</h6>
                        <Badge bg={bundle.type === 'prepaid' ? 'success' : 'primary'}>
                          {bundle.type}
                        </Badge>
                      </Card.Header>
                      <Card.Body className="py-2">
                        <Card.Text className="text-muted small mb-2">
                          {bundle.description}
                        </Card.Text>
                        <div className="small">
                          <div className="d-flex justify-content-between">
                            <span>Price:</span>
                            <strong>${bundle.price}/mo</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Data:</span>
                            <strong>{bundle.dataCap === 0 ? 'Unlimited' : `${bundle.dataCap}GB`}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Speed:</span>
                            <strong>{bundle.speed}Mbps</strong>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {selectedBundles.length > 0 && (
                <div className="mt-3">
                  <Form.Label>Configured Bundle Locations</Form.Label>
                  <Accordion activeKey={activeAccordionKey}>
                    {selectedBundles.map((bundle) => {
                      const bundleInfo = bundles.find(b => b.bundleId === bundle.bundleId);
                      const sameBundleCount = selectedBundles.filter(b => b.bundleId === bundle.bundleId).length;
                      
                      return (
                        <Accordion.Item key={bundle.tempId} eventKey={bundle.tempId}>
                          <Accordion.Header onClick={() => toggleAccordion(bundle.tempId)}>
                            <div className="d-flex justify-content-between align-items-center w-100 pe-2">
                              <span>
                                {bundleInfo?.name || `Bundle ${bundle.bundleId}`}
                                {sameBundleCount > 1 && (
                                  <Badge bg="secondary" className="ms-2">
                                    Instance {selectedBundles
                                      .filter(b => b.bundleId === bundle.bundleId)
                                      .findIndex(b => b.tempId === bundle.tempId) + 1}
                                  </Badge>
                                )}
                              </span>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmRemoveBundle(bundle.tempId);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <Row className="g-3">
                              <Col md={6}>
                                <Form.Group controlId={`bundleAddress-${bundle.tempId}`}>
                                  <Form.Label>Address</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={bundle.address}
                                    onChange={(e) => handleBundleLocationChange(bundle.tempId, 'address', e.target.value)}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group controlId={`bundleCity-${bundle.tempId}`}>
                                  <Form.Label>City</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={bundle.city}
                                    onChange={(e) => handleBundleLocationChange(bundle.tempId, 'city', e.target.value)}
                                    required
                                  />
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
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end">
              <Button 
                variant={isEditMode ? 'warning' : 'primary'} 
                type="submit"
                className="px-4"
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <style>{`
        .click-animation {
          animation: pulse 0.3s ease;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); box-shadow: 0 0 10px rgba(13, 110, 253, 0.5); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default UserForm;