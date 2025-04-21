// pages/Payments.jsx
import { useState, useContext } from 'react';
import { Table, Form, Badge, Pagination, Stack, Button, Dropdown } from 'react-bootstrap';
import AppContext from '../context/AppContext';
import "../components/Payment.css"

const Payments = () => {
  const { 
    payments, 
    paymentsLoading, 
    paymentsError, 
    refreshPayments 
  } = useContext(AppContext);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState([]);

  // Filter options
  const statusOptions = ['PAID', 'PENDING', 'UNPAID'];
  const bundleOptions = [...new Set(payments.map(p => p.bundleName))].filter(Boolean);
  const methodOptions = [...new Set(payments.map(p => p.paymentMethod))].filter(Boolean);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const headerConfig = [
    { key: 'paymentId', label: 'Payment ID' },
    { key: 'userName', label: 'User' },
    { key: 'amount', label: 'Amount' },
    { key: 'paymentDate', label: 'Payment Date' },
    { key: 'dueDate', label: 'Due Date' }
  ];

  // Sorting logic
  const sortedPayments = [...payments].sort((a, b) => {
    if (!sortKey) return 0;
    
    const getValue = (payment, key) => {
      switch (key) {
        case 'paymentId': return payment.paymentId;
        case 'userName': return payment.userName?.toLowerCase() || '';
        case 'amount': return payment.amount;
        case 'paymentDate': return payment.paymentDate ? new Date(payment.paymentDate) : new Date(0);
        case 'dueDate': return new Date(payment.dueDate);
        default: return '';
      }
    };

    const valueA = getValue(a, sortKey);
    const valueB = getValue(b, sortKey);
    
    if (typeof valueA === 'number') {
      return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
    }
    if (valueA instanceof Date) {
      return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
    }
    return valueA.localeCompare(valueB) * (sortDirection === 'asc' ? 1 : -1);
  });

  // Filtering logic
  const filteredPayments = sortedPayments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      payment.userName?.toLowerCase().includes(searchLower) ||
      payment.paymentMethod?.toLowerCase().includes(searchLower) ||
      payment.status?.toLowerCase().includes(searchLower) ||
      payment.bundleName?.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchTerm)
    );

    return matchesSearch &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(payment.status)) &&
      (selectedBundles.length === 0 || (payment.bundleName && selectedBundles.includes(payment.bundleName))) &&
      (selectedMethods.length === 0 || selectedMethods.includes(payment.paymentMethod));
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Filter handlers
  const toggleFilter = (value, filterType) => {
    const setters = {
      status: setSelectedStatuses,
      bundle: setSelectedBundles,
      method: setSelectedMethods
    };

    setters[filterType](prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedBundles([]);
    setSelectedMethods([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Sort indicator
  const getSortIndicator = (key) => 
    sortKey === key ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';

  // Dropdown component
  const MultiSelectDropdown = ({ 
    options, 
    selected, 
    onToggle, 
    label, 
    variant = 'outline-primary' 
  }) => (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle variant={variant} className="me-2">
        {label} {selected.length > 0 && `(${selected.length})`}
      </Dropdown.Toggle>
      <Dropdown.Menu 
        style={{ maxHeight: '300px', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map(option => (
          <Dropdown.ItemText 
            key={option} 
            className="px-3 py-1"
            onClick={(e) => e.preventDefault()}
          >
            <Form.Check
              label={option}
              checked={selected.includes(option)}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(option);
              }}
            />
          </Dropdown.ItemText>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

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

      {/* Filter Controls */}
      <div className="mb-4">
        <Stack direction="horizontal" gap={3} className="flex-wrap">
          <MultiSelectDropdown
            options={statusOptions}
            selected={selectedStatuses}
            onToggle={(value) => toggleFilter(value, 'status')}
            label="Status"
          />

          <MultiSelectDropdown
            options={bundleOptions}
            selected={selectedBundles}
            onToggle={(value) => toggleFilter(value, 'bundle')}
            label="Bundle"
            variant="outline-secondary"
          />

          <MultiSelectDropdown
            options={methodOptions}
            selected={selectedMethods}
            onToggle={(value) => toggleFilter(value, 'method')}
            label="Method"
            variant="outline-success"
          />

          <Button 
            variant="outline-danger"
            onClick={clearAllFilters}
            disabled={!selectedStatuses.length && !selectedBundles.length && !selectedMethods.length}
          >
            Clear Filters
          </Button>
        </Stack>
      </div>

      {/* Payment Table */}
      <div style={{ maxHeight: '550px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
        <Table striped bordered hover responsive className="mb-0">
        <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
            <tr>
              {['paymentId', 'userName', 'amount', 'paymentDate', 'dueDate'].map((key) => (
                <th 
                  key={key}
                  onClick={() => handleSort(key)}
                  style={{ cursor: 'pointer', minWidth: 120 }}
                >
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  {getSortIndicator(key)}
                </th>
              ))}
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
                <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : '-'}</td>
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