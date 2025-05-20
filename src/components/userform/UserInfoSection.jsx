import { Form, Col, Button } from "react-bootstrap";

const UserInfoSection = ({ register, errors, isEditMode, userStatus, setUserStatus, validations }) => (
  <Col md={6}>
    <h4 className="mb-3">User Information</h4>

    {isEditMode && (
      <Form.Group controlId="status" className="status-button-group">
        <Form.Label>Status</Form.Label>
        <div>
          <Button
            variant={userStatus === "ACTIVE" ? "success" : "outline-success"}
            className="status-button"
            onClick={() => setUserStatus("ACTIVE")}
            active={userStatus === "ACTIVE"}
          >
            Active
          </Button>
          <Button
            variant={userStatus === "INACTIVE" ? "secondary" : "outline-secondary"}
            onClick={() => setUserStatus("INACTIVE")}
            active={userStatus === "INACTIVE"}
          >
            Inactive
          </Button>
        </div>
      </Form.Group>
    )}

    <Form.Group controlId="firstName" className="form-group-custom">
      <Form.Label>First Name</Form.Label>
      <Form.Control
        type="text"
        {...register("firstName", validations.firstName)}
        isInvalid={!!errors.firstName}
      />
      <Form.Control.Feedback type="invalid">
        {errors.firstName?.message}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group controlId="lastName" className="form-group-custom">
      <Form.Label>Last Name</Form.Label>
      <Form.Control
        type="text"
        {...register("lastName", validations.lastName)}
        isInvalid={!!errors.lastName}
      />
      <Form.Control.Feedback type="invalid">
        {errors.lastName?.message}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group controlId="email" className="form-group-custom">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        {...register("email", validations.email)}
        isInvalid={!!errors.email}
      />
      <Form.Control.Feedback type="invalid">
        {errors.email?.message}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group controlId="phone" className="form-group-custom">
      <Form.Label>Phone</Form.Label>
      <Form.Control
        type="tel"
        {...register("phone", validations.phone)}
        isInvalid={!!errors.phone}
      />
      <Form.Control.Feedback type="invalid">
        {errors.phone?.message}
      </Form.Control.Feedback>
    </Form.Group>

    <Form.Group controlId="landLine" className="form-group-custom">
      <Form.Label>Landline (Optional)</Form.Label>
      <Form.Control
        type="tel"
        {...register("landLine", validations.landLine)}
        isInvalid={!!errors.landLine}
      />
      <Form.Control.Feedback type="invalid">
        {errors.landLine?.message}
      </Form.Control.Feedback>
    </Form.Group>
  </Col>
);

export default UserInfoSection;