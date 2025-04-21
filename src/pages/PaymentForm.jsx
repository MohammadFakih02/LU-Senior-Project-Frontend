import { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, FloatingLabel, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AppContext from '../context/AppContext';
import { toast } from 'react-toastify';

const PaymentForm = () => {
  const { paymentId } = useParams();
  const { currentUser, userBundles, refreshPayments } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    paymentMethod: 'Credit Card',
    userBundleId: '',
    status: 'PENDING'
  });

  useEffect(() => {
    if (paymentId) {
      axios.get(`/api/payments/${paymentId}`)
        .then(res => {
          const payment = res.data;
          setFormData({
            amount: payment.amount,
            dueDate: payment.dueDate,
            paymentMethod: payment.paymentMethod,
            userBundleId: payment.userBundleId,
            status: payment.status
          });
        })
        .catch(err => toast.error(err.response?.data?.message || 'Error loading payment'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiCall = paymentId 
        ? axios.put(`/api/payments/${paymentId}`, formData)
        : axios.post('/api/payments', formData);
      
      await apiCall;
      refreshPayments();
      toast.success(`Payment ${paymentId ? 'updated' : 'created'} successfully`);
      navigate('/payments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving payment');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="p-4">
      <h2>{paymentId ? 'Edit Payment' : 'Create New Payment'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="g-3 mb-3">
          <Col md={6}>
            <FloatingLabel label="Amount">
              <Form.Control 
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </FloatingLabel>
          </Col>
          
          <Col md={6}>
            <FloatingLabel label="Due Date">
              <Form.Control 
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </FloatingLabel>
          </Col>

          <Col md={6}>
            <FloatingLabel label="Payment Method">
              <Form.Select
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option>Credit Card</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Digital Wallet</option>
              </Form.Select>
            </FloatingLabel>
          </Col>

          <Col md={6}>
            <FloatingLabel label="User Bundle">
              <Form.Select
                value={formData.userBundleId}
                onChange={e => setFormData({...formData, userBundleId: e.target.value})}
                required
              >
                <option value="">Select Bundle</option>
                {userBundles.map(bundle => (
                  <option key={bundle.id} value={bundle.id}>
                    {bundle.user.name} - {bundle.bundle.name}
                  </option>
                ))}
              </Form.Select>
            </FloatingLabel>
          </Col>
        </Row>

        <div className="d-flex gap-2 justify-content-end">
          <Button variant="secondary" onClick={() => navigate('/payments')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {paymentId ? 'Update Payment' : 'Create Payment'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PaymentForm;