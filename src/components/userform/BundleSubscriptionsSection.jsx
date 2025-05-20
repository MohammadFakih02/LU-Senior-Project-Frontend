import { Accordion, Badge, Button, Form, Row, Col } from "react-bootstrap";
import BundleCard from "../BundleCard";

const BundleSubscriptionsSection = ({
  bundles,
  selectedBundles,
  clickedBundle,
  activeAccordionKey,
  handleAddBundle,
  confirmRemoveBundle,
  handleBundleStatusChange,
  toggleAccordion,
  renderBundleLocationFields
}) => {

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
                      <div
                        className="ms-3 me-2 btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmRemoveBundle(bundle.tempId);
                        }}
                        style={{ cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            confirmRemoveBundle(bundle.tempId);
                          }
                        }}
                      >
                        Remove
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