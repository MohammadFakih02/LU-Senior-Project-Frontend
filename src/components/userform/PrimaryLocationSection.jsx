import { Form, Row, Col } from "react-bootstrap";

const PrimaryLocationSection = ({ register, errors }) => (
  <Col md={6}>
    <h4 className="mb-3">Primary Location</h4>

    <Form.Group controlId="address" className="form-group-custom">
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

    <Form.Group controlId="city" className="form-group-custom">
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

    <Form.Group controlId="street" className="form-group-custom">
      <Form.Label>Street</Form.Label>
      <Form.Control type="text" {...register("street")} />
    </Form.Group>

    <Row className="mb-3">
      <Col>
        <Form.Group controlId="building">
          <Form.Label>Building</Form.Label>
          <Form.Control type="text" {...register("building")} />
        </Form.Group>
      </Col>
      <Col>
        <Form.Group controlId="floor">
          <Form.Label>Floor</Form.Label>
          <Form.Control type="text" {...register("floor")} />
        </Form.Group>
      </Col>
    </Row>
  </Col>
);

export default PrimaryLocationSection;