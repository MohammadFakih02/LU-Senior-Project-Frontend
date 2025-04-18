import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useForm } from 'react-hook-form';

const BundleForm = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!bundleId;
  const [apiError, setApiError] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm();

  useEffect(() => {
    if (!isEditMode) return;

    const fetchBundle = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/bundles/${bundleId}`);
        reset(response.data);
      } catch (error) {
        setApiError('Failed to load bundle data');
      }
    };

    fetchBundle();
  }, [bundleId, reset, isEditMode]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/bundles/${bundleId}`, data);
      } else {
        await axios.post("http://localhost:8080/api/bundles", data);
      }
      navigate('/bundles');
    } catch (error) {
      setApiError(error.response?.data?.message || 'An error occurred');
    }
  };

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
          {apiError && <Alert variant="danger" className="mb-4">{apiError}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('name', { required: 'Name is required' })}
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
                    {...register('description')}
                    className="rounded-1"
                  />
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
                    {...register('price', { required: 'Price is required' })}
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
                    {...register('dataCap')}
                    className="rounded-1"
                  />
                </Form.Group>

                <Form.Group controlId="speed" className="mt-3">
                  <Form.Label>Speed (Mbps)</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('speed')}
                    className="rounded-1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant={isEditMode ? 'warning' : 'primary'} 
                type="submit"
                className="px-4 rounded-1"
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