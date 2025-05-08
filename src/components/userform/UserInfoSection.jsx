import { Form, Row, Col, Button } from "react-bootstrap";

const UserInfoSection = ({ register, errors, isEditMode, userStatus, setUserStatus }) => (
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
        {...register("firstName", {
          required: "First name is required",
          minLength: { value: 2, message: "Minimum 2 characters required" },
          maxLength: { value: 50, message: "Maximum 50 characters allowed" }
        })}
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
        {...register("lastName", {
          required: "Last name is required",
          minLength: { value: 2, message: "Minimum 2 characters required" },
          maxLength: { value: 50, message: "Maximum 50 characters allowed" }
        })}
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
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
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
        {...register("phone", {
          pattern: {
            value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
            message: "Invalid phone number format"
          }
        })}
        isInvalid={!!errors.phone}
      />
      <Form.Control.Feedback type="invalid">
        {errors.phone?.message}
      </Form.Control.Feedback>
    </Form.Group>
  </Col>
);

export default UserInfoSection;