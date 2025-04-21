import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { Table, Form, Badge, Pagination } from 'react-bootstrap';
import AppContext from '../context/AppContext';

const Payments = () => {
  const { 
    payments, 
    paymentsLoading, 
    paymentsError, 
    refreshPayments 
  } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Sorting handler
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Sorting logic
  const sortedPayments = [...payments].sort((a, b) => {
    if (!sortKey) return 0;
    
    let valueA, valueB;
    
    switch (sortKey) {
      case 'paymentId':
        valueA = a.paymentId;
        valueB = b.paymentId;
        return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
      
      case 'userName':
        valueA = a.userName?.toLowerCase() || '';
        valueB = b.userName?.toLowerCase() || '';
        return valueA.localeCompare(valueB) * (sortDirection === 'asc' ? 1 : -1);
      
      case 'amount':
        valueA = a.amount;
        valueB = b.amount;
        return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
      
      case 'paymentDate':
        valueA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
        valueB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
        return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
      
      case 'dueDate':
        valueA = new Date(a.dueDate);
        valueB = new Date(b.dueDate);
        return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
      
      default:
        return 0;
    }
  });

  // Filtering logic (now uses sortedPayments)
  const filteredPayments = sortedPayments.filter(payment => {
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

  const getSortIndicator = (key) => {
    if (sortKey === key) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

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
            <th onClick={() => handleSort('paymentId')} style={{ cursor: 'pointer' }}>
              Payment ID {getSortIndicator('paymentId')}
            </th>
            <th onClick={() => handleSort('userName')} style={{ cursor: 'pointer' }}>
              User {getSortIndicator('userName')}
            </th>
            <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
              Amount {getSortIndicator('amount')}
            </th>
            <th onClick={() => handleSort('paymentDate')} style={{ cursor: 'pointer' }}>
              Payment Date {getSortIndicator('paymentDate')}
            </th>
            <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>
              Due Date {getSortIndicator('dueDate')}
            </th>
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