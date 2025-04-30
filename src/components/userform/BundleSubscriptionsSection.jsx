import { Accordion, Badge, Button, Form, Row, Col } from "react-bootstrap";
import BundleCard from "../BundleCard";

const BundleSubscriptionsSection = ({
  bundles,
  selectedBundles,
  clickedBundle,
  activeAccordionKey,
  validationErrors,
  handleAddBundle,
  confirmRemoveBundle,
  handleBundleLocationChange,
  handleBundleStatusChange,
  toggleAccordion
}) => {
  const renderBundleLocationFields = (bundle) => (
    <Row className="g-3">
      <Col md={6}>
        <Form.Group controlId={`bundleAddress-${bundle.tempId}`}>
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            value={bundle.address}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'address', e.target.value)}
            isInvalid={!!validationErrors[`address-${bundle.tempId}`]}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`address-${bundle.tempId}`]}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`bundleCity-${bundle.tempId}`}>
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            value={bundle.city}
            onChange={(e) => handleBundleLocationChange(bundle.tempId, 'city', e.target.value)}
            isInvalid={!!validationErrors[`city-${bundle.tempId}`]}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors[`city-${bundle.tempId}`]}
          </Form.Control.Feedback>
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
  );

  return (
    <div className="mb-4">
      <h4 className="mb-3">Bundle Subscriptions</h4>

      <div className="mb-4">
        <Form.Label>Available Bundles</Form.Label>
        <Row xs={1} md={2} lg={3} className="g-3">
          {bundles.map((bundle) => (
            <Col key={bundle.bundleId}>
              <BundleCard
                bundle={bundle}
                variant="small"
                onClick={() => handleAddBundle(bundle.bundleId)}
                isClicked={clickedBundle === bundle.bundleId}
                showActions={false}
              />
            </Col>
          ))}
        </Row>
      </div>

      {selectedBundles.length > 0 && (
        <div className="mt-3">
          <Form.Label>Configured Bundle Locations</Form.Label>
          <Accordion activeKey={activeAccordionKey}>
            {selectedBundles.map((bundle) => {
              const bundleInfo = bundles.find((b) => b.bundleId === bundle.bundleId);
              const sameBundleCount = selectedBundles.filter(
                (b) => b.bundleId === bundle.bundleId
              ).length;

              return (
                <Accordion.Item key={bundle.tempId} eventKey={bundle.tempId}>
                  <Accordion.Header onClick={() => toggleAccordion(bundle.tempId)}>
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div className="d-flex flex-column">
                        <span className="fw-semibold">
                          {bundleInfo?.name || `Bundle ${bundle.bundleId}`}
                        </span>
                        {sameBundleCount > 1 && (
                          <Badge bg="secondary" className="mt-1">
                            Instance{" "}
                            {selectedBundles
                              .filter((b) => b.bundleId === bundle.bundleId)
                              .findIndex((b) => b.tempId === bundle.tempId) + 1}
                          </Badge>
                        )}
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="ms-3 me-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmRemoveBundle(bundle.tempId)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Accordion.Header>

                  <Accordion.Body>
                    <Row className="g-3 mb-3">
                      <Col md={12}>
                        <Form.Group controlId={`bundleStatus-${bundle.tempId}`}>
                          <Form.Label>Bundle Status</Form.Label>
                          <div>
                            <Button
                              variant={bundle.status === "ACTIVE" ? "success" : "outline-success"}
                              className="me-2"
                              onClick={() => handleBundleStatusChange(bundle.tempId, "ACTIVE")}
                              size="sm"
                            >
                              Active
                            </Button>
                            <Button
                              variant={bundle.status === "INACTIVE" ? "secondary" : "outline-secondary"}
                              onClick={() => handleBundleStatusChange(bundle.tempId, "INACTIVE")}
                              size="sm"
                            >
                              Inactive
                            </Button>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    {renderBundleLocationFields(bundle)}
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default BundleSubscriptionsSection;
