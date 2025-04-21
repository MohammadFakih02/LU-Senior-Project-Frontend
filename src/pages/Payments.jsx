// pages/Payments.jsx
import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { Table, Form, Badge, Pagination } from 'react-bootstrap';
import AppContext from '../context/AppContext';

const Payments = () => {
  // Get payments data from context
  const { 
    payments, 
    paymentsLoading, 
    paymentsError, 
    refreshPayments 
  } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.userName?.toLowerCase().includes(searchLower) ||
      payment.paymentMethod?.toLowerCase().includes(searchLower) ||
      payment.status?.toLowerCase().includes(searchLower) ||
      payment.bundleName?.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchTerm)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  if (paymentsLoading) return <div className="p-3">Loading payments...</div>;
  if (paymentsError) return <div className="p-3 text-danger">Error: {paymentsError}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Payment Management</h1>
        <Form.Control
          type="text"
          placeholder="Search payments..."
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ maxHeight: '550px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
        <Table striped bordered hover responsive className="mb-0">
          <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th>Payment ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Due Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Bundle</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((payment) => (
              <tr key={payment.paymentId}>
                <td>{payment.paymentId}</td>
                <td>{payment.userName || '-'}</td>
                <td>${payment.amount?.toFixed(2)}</td>
                <td>{payment.paymentDate ? 
                  new Date(payment.paymentDate).toLocaleString() : '-'}</td>
                <td>{new Date(payment.dueDate).toLocaleString()}</td>
                <td>{payment.paymentMethod}</td>
                <td>
                  <Badge bg={
                    payment.status === 'PAID' ? 'success' :
                    payment.status === 'PENDING' ? 'warning' : 'secondary'
                  }>
                    {payment.status}
                  </Badge>
                </td>
                <td>{payment.bundleName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {filteredPayments.length === 0 && (
          <div className="text-center p-3 text-muted">
            No matching payments found
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPayments.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Payments;