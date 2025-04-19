import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import AppContext from '../context/AppContext';

const UserForm = () => {
  const { 
    users,
    bundles,
    bundlesLoading,
    createUser,
    updateUser
  } = useContext(AppContext);
  
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!userId;
  const [apiError, setApiError] = useState('');
  const [selectedBundles, setSelectedBundles] = useState([]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
  } = useForm();

  // Find the existing user
  const existingUser = users.find(u => u.id === Number(userId));

  useEffect(() => {
    if (!isEditMode || !userId) return;
    
    if (existingUser) {
      reset({
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        phone: existingUser.phone,
        address: existingUser.location?.address,
        city: existingUser.location?.city,
        street: existingUser.location?.street,
        building: existingUser.location?.building,
        floor: existingUser.location?.floor,
      });
      
      // Set selected bundles if editing
      if (existingUser.bundleSubscriptions) {
        setSelectedBundles(existingUser.bundleSubscriptions.map(sub => ({
          bundleId: sub.bundleId,
          address: sub.location?.address || '',
          city: sub.location?.city || '',
          street: sub.location?.street || '',
          building: sub.location?.building || '',
          floor: sub.location?.floor || ''
        })));
      }
    }
  }, [existingUser, isEditMode, reset, userId]);

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
      } else {
        await createUser(userData);
      }
      navigate('/users');
    } catch (error) {
      setApiError(error.message || 'An error occurred');
    }
  };

  const handleAddBundle = (bundleId) => {
    if (!selectedBundles.some(b => b.bundleId === bundleId)) {
      setSelectedBundles([...selectedBundles, {
        bundleId,
        address: '',
        city: '',
        street: '',
        building: '',
        floor: ''
      }]);
    }
  };

  const handleRemoveBundle = (bundleId) => {
    setSelectedBundles(selectedBundles.filter(b => b.bundleId !== bundleId));
  };

  const handleBundleLocationChange = (bundleId, field, value) => {
    setSelectedBundles(selectedBundles.map(b => 
      b.bundleId === bundleId ? { ...b, [field]: value } : b
    ));
  };

  if (bundlesLoading) return <div>Loading...</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
        <Button as={Link} to="/users" variant="secondary" size="sm">
          Back to Users
        </Button>
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
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="lastName" className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    isInvalid={!!errors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName?.message}
                  </Form.Control.Feedback>
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
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
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
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="city" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('city', { required: 'City is required' })}
                    isInvalid={!!errors.city}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.city?.message}
                  </Form.Control.Feedback>
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
              <div className="d-flex flex-wrap gap-2 mb-3">
                {bundles.map(bundle => (
                  <Button
                    key={bundle.id || bundle.bundleId}
                    variant={selectedBundles.some(b => b.bundleId === (bundle.id || bundle.bundleId)) ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => selectedBundles.some(b => b.bundleId === (bundle.id || bundle.bundleId)) 
                      ? handleRemoveBundle(bundle.id || bundle.bundleId)
                      : handleAddBundle(bundle.id || bundle.bundleId)
                    }
                  >
                    {bundle.name}
                  </Button>
                ))}
              </div>

              {selectedBundles.length > 0 && (
                <div className="mt-3">
                  <Form.Label>Bundle Locations</Form.Label>
                  {selectedBundles.map((bundle, index) => {
                    const bundleInfo = bundles.find(b => (b.id || b.bundleId) === bundle.bundleId);
                    return (
                      <Card key={index} className="mb-3">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <span>{bundleInfo?.name || `Bundle ${bundle.bundleId}`}</span>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleRemoveBundle(bundle.bundleId)}
                          >
                            Remove
                          </Button>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group controlId={`bundleAddress-${index}`}>
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={bundle.address}
                                  onChange={(e) => handleBundleLocationChange(bundle.bundleId, 'address', e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId={`bundleCity-${index}`}>
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={bundle.city}
                                  onChange={(e) => handleBundleLocationChange(bundle.bundleId, 'city', e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group controlId={`bundleStreet-${index}`}>
                                <Form.Label>Street</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={bundle.street}
                                  onChange={(e) => handleBundleLocationChange(bundle.bundleId, 'street', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId={`bundleBuilding-${index}`}>
                                <Form.Label>Building</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={bundle.building}
                                  onChange={(e) => handleBundleLocationChange(bundle.bundleId, 'building', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group controlId={`bundleFloor-${index}`}>
                                <Form.Label>Floor</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={bundle.floor}
                                  onChange={(e) => handleBundleLocationChange(bundle.bundleId, 'floor', e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    );
                  })}
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
    </div>
  );
};

export default UserForm;