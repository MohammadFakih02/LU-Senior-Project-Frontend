import { Form, Row, Col, Button } from "react-bootstrap";

const PrimaryLocationSection = ({ register, errors, onMapPickClick, validations }) => (
  <Col md={6}>
    <h4 className="mb-3">User Location</h4>

    <Row className="g-3">
      <Col md={12}>
        <Form.Group controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            {...register("address", validations.address)}
            isInvalid={!!errors.address}
          />
          <Form.Control.Feedback type="invalid">
            {errors.address?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group controlId="city">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            {...register("city", validations.city)}
            isInvalid={!!errors.city}
          />
          <Form.Control.Feedback type="invalid">
            {errors.city?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group controlId="street">
          <Form.Label>Street</Form.Label>
          <Form.Control
            type="text"
            {...register("street", validations.street)}
            isInvalid={!!errors.street}
          />
          <Form.Control.Feedback type="invalid">
            {errors.street?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="building">
          <Form.Label>Building</Form.Label>
          <Form.Control
            type="text"
            {...register("building", validations.building)}
            isInvalid={!!errors.building}
          />
          <Form.Control.Feedback type="invalid">
            {errors.building?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="floor">
          <Form.Label>Floor</Form.Label>
          <Form.Control
            type="text"
            {...register("floor", validations.floor)}
            isInvalid={!!errors.floor}
          />
          <Form.Control.Feedback type="invalid">
            {errors.floor?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group controlId="googleMapsUrl">
          <Form.Label>Google Maps URL (Optional)</Form.Label>
          <Form.Control
            type="text"
            {...register("googleMapsUrl", validations.googleMapsUrl)}
            isInvalid={!!errors.googleMapsUrl}
          />
          <Form.Control.Feedback type="invalid">
            {errors.googleMapsUrl?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={12} className="d-flex justify-content-end mb-4">
        <Button variant="outline-secondary" size="sm" onClick={onMapPickClick}>
          Pick on Map / View Map
        </Button>
      </Col>
    </Row>
  </Col>
);

export default PrimaryLocationSection;