// pages/Bundles.js
import { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusLg } from 'react-bootstrap-icons';
import '../components/BundleCreationButton.css';
import { useContext } from 'react';
import AppContext from '../context/AppContext';

const Bundles = () => {
  const {
    bundles, 
    bundlesLoading,
    bundlesError,
  } = useContext(AppContext);


  if (bundlesLoading) return <div>Loading bundles...</div>;
  if (bundlesError) return <div>Error: {bundlesError}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Internet Bundles</h1>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">

        {/* Existing Bundles */}
        {bundles.map((bundle) => (
          <Col key={bundle.bundleId}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-dark text-white">
                <h5 className="mb-0">{bundle.name}</h5>
                <Badge bg={bundle.type === 'prepaid' ? 'success' : 'primary'}>
                  {bundle.type}
                </Badge>
              </Card.Header>
              <Card.Body>
                <Card.Text className="text-muted small">
                  {bundle.description}
                </Card.Text>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Price:</span>
                    <strong>${bundle.price}/mo</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Data Cap:</span>
                    <strong>{bundle.datacap}GB</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Speed:</span>
                    <strong>{bundle.speed}Mbps</strong>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end gap-2">
                <Button variant="info" size="sm">View</Button>
    
                // In the Edit button link, change bundleId to id:
                <Button 
                variant="warning" 
                size="sm"
                as={Link} 
                to={`/bundles/edit/${bundle.id || bundle.bundleId}`}
                >
                  Edit
                </Button>
                </Card.Footer>
            </Card>
          </Col>
        ))}
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