import { Form, Row, Col, Button } from "react-bootstrap";
import { commonAreaCodes } from "./formConstants"; // Import the list

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

    {/* Phone Number Input Group */}
    <div className="form-group-custom">
      <Form.Label htmlFor="areaCode">Phone</Form.Label>
      <Row>
        <Col xs={4} sm={4} md={4} lg={3}>
          <Form.Group controlId="areaCode" className="mb-0">
            <Form.Control
              type="tel"
              placeholder="+1"
              {...register("areaCode", validations.areaCode)}
              isInvalid={!!errors.areaCode}
              list="area-codes-datalist" // Link to the datalist
            />
            <datalist id="area-codes-datalist">
              {commonAreaCodes.map((code) => (
                <option key={code.value} value={code.value}>
                  {code.label}
                </option>
              ))}
            </datalist>
            <Form.Control.Feedback type="invalid">
              {errors.areaCode?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={8} sm={8} md={8} lg={9}>
          <Form.Group controlId="phoneNumber" className="mb-0">
            <Form.Control
              type="tel"
              placeholder="5551234567"
              {...register("phoneNumber", validations.phoneNumber)}
              isInvalid={!!errors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </div>

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