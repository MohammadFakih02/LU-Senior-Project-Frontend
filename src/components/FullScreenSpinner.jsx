import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const FullScreenSpinner = ({ message = "Loading..." }) => (
  <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
    <div className="text-center">
      <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  </Container>
);

export default FullScreenSpinner;