import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import AppContext from '../context/AppContext';

const BundleForm = () => {
    const { 
        bundles,
        bundlesLoading,
        bundlesError,
        createBundle, 
        updateBundle 
    } = useContext(AppContext);
    
    const { bundleId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!bundleId;
    const [apiError, setApiError] = useState('');

    const { 
        register, 
        handleSubmit, 
        formState: { errors }, 
        reset,
    } = useForm({
      defaultValues: {
        name: '',
        description: '',
        type: '',
        price: undefined,
        dataCap: undefined,
        speed: undefined, 
      }
    });

    const onSubmit = async (data) => {
      setApiError('');
      try {
        const payload = {
          ...data,
          price: data.price, 
          dataCap: (data.dataCap === undefined || data.dataCap === null || isNaN(data.dataCap)) ? 0 : data.dataCap,
          speed: data.speed, 
        };

        if (isEditMode) {
          await updateBundle(existingBundle.id || existingBundle.bundleId, payload);
        } else {
          await createBundle(payload);
        }
        navigate('/bundles');
      } catch (error) {
        console.error("Bundle form submission error:", error);
        setApiError(error.response?.data?.message || error.message || 'An error occurred');
      }
    };
    
    const existingBundle = bundles.find(b => b.id === Number(bundleId)) || bundles.find(b => b.bundleId === Number(bundleId));

    useEffect(() => {
      if (!isEditMode || !bundleId) {
        reset({
            name: '',
            description: '',
            type: '',
            price: undefined,
            dataCap: undefined,
            speed: undefined,
        });
        return;
      }
      
      if (bundlesLoading) return;
    
      if (existingBundle) {
        reset({
          name: existingBundle.name || '',
          description: existingBundle.description || '',
          type: existingBundle.type || '',
          price: existingBundle.price,
          dataCap: existingBundle.dataCap ?? existingBundle.datacap ?? undefined, 
          speed: existingBundle.speed ?? undefined 
        });
      } else if (!bundlesLoading && bundlesError) {
        setApiError(`Failed to load bundles list: ${bundlesError}`);
      } else if (!bundlesLoading && !existingBundle) {
        setApiError('Bundle data not found. It may have been deleted or the ID is incorrect.');
      }
    }, [bundlesLoading, bundlesError, existingBundle, isEditMode, reset, bundleId]);

    if (bundlesLoading) return <div>Loading...</div>;
    if (!isEditMode && bundlesError) return <div>Error loading bundle options: {bundlesError}</div>;
    if (isEditMode && !existingBundle && !bundlesLoading) return (
      <div>
        <Alert variant="danger">
          {apiError || 'Bundle not found.'}
        </Alert>
        <Button as={Link} to="/bundles" variant="secondary" size="sm">
            Back to Bundles
        </Button>
      </div>
    );

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">{isEditMode ? 'Edit Bundle' : 'Create New Bundle'}</h1>
                <Button as={Link} to="/bundles" variant="secondary" size="sm">
                    Back to Bundles
                </Button>
            </div>

            <Card className="shadow-sm">
                <Card.Body>
                    {apiError && !Object.keys(errors).length && <Alert variant="danger" className="mb-4" onClose={() => setApiError('')} dismissible>{apiError}</Alert>}

                    <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('name', { 
                        required: 'Name is required',
                        minLength: { value: 1, message: "Name is required" }, 
                        maxLength: { value: 45, message: "Name must be at most 45 characters" }
                    })}
                    isInvalid={!!errors.name}
                    className="rounded-1"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="description" className="mt-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('description', {
                        required: 'Description is required',
                        maxLength: { value: 500, message: "Description must be at most 500 characters"}
                    })}
                    isInvalid={!!errors.description}
                    className="rounded-1"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="type" className="mt-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    {...register('type', { required: 'Type is required' })}
                    isInvalid={!!errors.type}
                    className="rounded-1"
                  >
                    <option value="">Select type</option>
                    <option value="FIBER">Fiber</option>
                    <option value="DSL">DSL</option>
                    <option value="CABLE">Cable</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="price">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    {...register('price', { 
                        required: 'Price is required',
                        valueAsNumber: true,
                        validate: value => value > 0 || 'Price must be greater than 0'
                    })}
                    isInvalid={!!errors.price}
                    className="rounded-1"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="dataCap" className="mt-3">
                  <Form.Label>Data Cap (GB)</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('dataCap', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Data Cap must be a non-negative number' }
                    })}
                    isInvalid={!!errors.dataCap}
                    className="rounded-1"
                  />
                   <Form.Control.Feedback type="invalid">
                    {errors.dataCap?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="speed" className="mt-3">
                  <Form.Label>Speed (Mbps)</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('speed', {
                        required: 'Speed is required',
                        valueAsNumber: true,
                        min: { value: 1, message: 'Speed must be a positive number (greater than 0)' }
                    })}
                    isInvalid={!!errors.speed}
                    className="rounded-1"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.speed?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant={isEditMode ? 'warning' : 'primary'} 
                type="submit"
                className="px-4 rounded-1"
                disabled={Object.keys(errors).length > 0 || bundlesLoading}
              >
                {isEditMode ? 'Update Bundle' : 'Create Bundle'}
              </Button>
            </div>
          </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default BundleForm;