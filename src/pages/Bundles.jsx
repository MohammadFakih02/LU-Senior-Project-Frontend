// pages/Bundles.js
import { Row, Col, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PlusLg } from 'react-bootstrap-icons';
import './styles/BundleCreationButton.css';
import { useContext } from 'react';
import AppContext from '../context/AppContext';
import BundleCard from '../components/BundleCard';

const Bundles = () => {
  const {
    bundles, 
    bundlesLoading,
    bundlesError,
    refreshBundles
  } = useContext(AppContext);

  if (bundlesLoading)
    return (  
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (bundlesError)
    return (
      <div className="p-3">
        <Alert variant="danger">{bundlesError}</Alert>
        <Button variant="secondary" onClick={refreshBundles}>
          Retry
        </Button>
      </div>
    );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Internet Bundles</h1>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {bundles.map((bundle) => (
          <Col key={bundle.bundleId}>
            <BundleCard 
              bundle={bundle}
              variant="large"
              showActions={true}
            />
          </Col>
        ))}
        
        {/* Add New Bundle Card */}
        <Col>
          <Card 
            as={Link} 
            to="/bundles/create" 
            className="h-100 shadow-sm add-card"
            style={{ textDecoration: 'none' }}
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <PlusLg className="text-muted mb-2" size={28} />
              <Card.Title className="text-muted">Add New Bundle</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {bundles.length === 0 && (
        <div className="text-center p-5 text-muted">
          No bundles found
        </div>
      )}
    </div>
  );
};

export default Bundles;