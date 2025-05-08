import { Form, Row, Col, Button } from "react-bootstrap";

const PrimaryLocationSection = ({ register, errors, onMapPickClick }) => (
  <Col md={6}>
    <h4 className="mb-3">User Location</h4>

    <Row className="g-3">
      <Col md={12}>
        <Form.Group controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            {...register("address", {
              required: "Address is required",
              minLength: { value: 5, message: "Minimum 5 characters required" }
            })}
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
            {...register("city", {
              required: "City is required",
              minLength: { value: 2, message: "Minimum 2 characters required" }
            })}
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
          <Form.Control type="text" {...register("street")} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="building">
          <Form.Label>Building</Form.Label>
          <Form.Control type="text" {...register("building")} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="floor">
          <Form.Label>Floor</Form.Label>
          <Form.Control type="text" {...register("floor")} />
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group controlId="googleMapsUrl">
          <Form.Label>Google Maps URL (Optional)</Form.Label>
          <Form.Control
            type="text"
            {...register("googleMapsUrl")}
          />
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