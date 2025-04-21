import { useEffect, useState, useContext } from 'react';
import { Table, Button, Form, Badge, Pagination, Spinner, Alert, Card, Stack, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import AppContext from '../context/AppContext';
import { ArrowClockwise } from 'react-bootstrap-icons';

const Users = () => {
  const { 
    users, 
    usersLoading, 
    usersError, 
    refreshUsers 
  } = useContext(AppContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const usersPerPage = 10;
  
  // New state for sorting and filtering
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState([]);

  // Filter options
  const statusOptions = [...new Set(users.map(u => u.status))].filter(Boolean);
  const cityOptions = [...new Set(users.map(u => u.location?.city).filter(Boolean))];
  const bundleOptions = [...new Set(users.flatMap(u => u.bundleNames || []).filter(Boolean))];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUsers();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sorting logic
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortKey) return 0;
    
    const getValue = (user, key) => {
      switch (key) {
        case 'id': return user.id;
        case 'name': return `${user.firstName} ${user.lastName}`.toLowerCase();
        case 'email': return user.email?.toLowerCase() || '';
        case 'phone': return user.phone?.toLowerCase() || '';
        case 'city': return user.location?.city?.toLowerCase() || '';
        case 'status': return user.status?.toLowerCase() || '';
        default: return '';
      }
    };

    const valueA = getValue(a, sortKey);
    const valueB = getValue(b, sortKey);
    
    if (typeof valueA === 'number') {
      return (valueA - valueB) * (sortDirection === 'asc' ? 1 : -1);
    }
    return valueA.localeCompare(valueB) * (sortDirection === 'asc' ? 1 : -1);
  });

  // Filtering logic
  const filteredUsers = sortedUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.location?.city?.toLowerCase().includes(searchLower) ||
      (user.bundleNames?.some(b => b.toLowerCase().includes(searchLower)) ||
      user.status?.toLowerCase().includes(searchLower)
    ));

    return matchesSearch &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(user.status)) &&
      (selectedCities.length === 0 || (user.location?.city && selectedCities.includes(user.location.city))) &&
      (selectedBundles.length === 0 || (user.bundleNames && user.bundleNames.some(b => selectedBundles.includes(b))));
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Sort handler
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter toggle handler
  const toggleFilter = (value, filterType) => {
    const setters = {
      status: setSelectedStatuses,
      city: setSelectedCities,
      bundle: setSelectedBundles
    };

    setters[filterType](prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedCities([]);
    setSelectedBundles([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Sort indicator
  const getSortIndicator = (key) => 
    sortKey === key ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';

  // Multi-select dropdown component
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatuses, selectedCities, selectedBundles]);

  if (usersLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (usersError) return (
    <div className="p-3">
      <Alert variant="danger">{usersError}</Alert>
      <Button variant="secondary" onClick={refreshUsers}>
        Retry
      </Button>
    </div>
  );

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">User Management</h1>
        <Form.Control
          type="text"
          placeholder="Search users..."
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
            options={cityOptions}
            selected={selectedCities}
            onToggle={(value) => toggleFilter(value, 'city')}
            label="City"
            variant="outline-secondary"
          />

          <MultiSelectDropdown
            options={bundleOptions}
            selected={selectedBundles}
            onToggle={(value) => toggleFilter(value, 'bundle')}
            label="Bundle"
            variant="outline-success"
          />

          <Button 
            variant="outline-danger"
            onClick={clearAllFilters}
            disabled={!selectedStatuses.length && !selectedCities.length && !selectedBundles.length && !searchTerm}
          >
            Clear Filters
          </Button>

          <Button 
            variant="outline-secondary" 
            onClick={handleRefresh}
            disabled={isRefreshing || usersLoading}
            className="ms-auto"
          >
            <ArrowClockwise className={`me-1 ${isRefreshing ? 'spin' : ''}`} />
            Refresh
          </Button>

          <Button as={Link} to="/users/create" variant="primary">
            Add New User
          </Button>
        </Stack>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body className="p-0">
          <Table striped bordered hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th 
                  style={{ width: '5%', minWidth: '50px', cursor: 'pointer' }}
                  onClick={() => handleSort('id')}
                >
                  ID{getSortIndicator('id')}
                </th>
                <th 
                  style={{ width: '15%', minWidth: '150px', cursor: 'pointer' }}
                  onClick={() => handleSort('name')}
                >
                  Name{getSortIndicator('name')}
                </th>
                <th 
                  style={{ width: '20%', minWidth: '200px', cursor: 'pointer' }}
                  onClick={() => handleSort('email')}
                >
                  Email{getSortIndicator('email')}
                </th>
                <th 
                  style={{ width: '14%', minWidth: '120px', cursor: 'pointer' }}
                  onClick={() => handleSort('phone')}
                >
                  Phone{getSortIndicator('phone')}
                </th>
                <th style={{ width: '18%', minWidth: '180px' }}>Bundles</th>
                <th 
                  style={{ width: '10%', minWidth: '100px', cursor: 'pointer' }}
                  onClick={() => handleSort('city')}
                >
                  City{getSortIndicator('city')}
                </th>
                <th 
                  style={{ width: '10%', minWidth: '100px', cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status{getSortIndicator('status')}
                </th>
                <th style={{ width: '6%', minWidth: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} style={{ height: '56px' }}>
                  <td className="align-middle">{user.id}</td>
                  <td className="align-middle">
                    <TruncatedText 
                      text={`${user.firstName} ${user.lastName}`} 
                      maxWidth={130}
                    />
                  </td>
                  <td className="align-middle">
                    <TruncatedText text={user.email} maxWidth={220} />
                  </td>
                  <td className="align-middle">
                    {user.phone ? (
                      <TruncatedText text={user.phone} maxWidth={130} />
                    ) : '-'}
                  </td>
                  <td className="align-middle">
                    {user.bundleNames?.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {user.bundleNames.map((bundle, index) => (
                          <Badge 
                            key={index} 
                            bg="info" 
                            className="text-truncate" 
                            style={{ 
                              maxWidth: '150px',
                              cursor: 'help'
                            }}
                          >
                            <TruncatedText text={bundle} maxWidth={140} />
                          </Badge>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="align-middle">
                    <TruncatedText 
                      text={user.location?.city || '-'} 
                      maxWidth={100}
                    />
                  </td>
                  <td className="align-middle">
                    <Badge 
                      bg={user.status === 'ACTIVE' ? 'success' : 'secondary'}
                      className="w-100 d-block"
                      style={{ lineHeight: '1.5' }}
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="align-middle">
                    <div className="d-flex gap-2">
                      <Button 
                        variant="info" 
                        size="sm" 
                        as={Link} 
                        to={`/users/${user.id}`}
                        style={{ minWidth: '60px' }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        as={Link} 
                        to={`/users/edit/${user.id}`}
                        style={{ minWidth: '60px' }}
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {filteredUsers.length === 0 && (
        <Card className="text-center p-4">
          <Card.Body>
            <h5 className="text-muted">
              {searchTerm.trim() || selectedStatuses.length || selectedCities.length || selectedBundles.length 
                ? 'No matching users found' 
                : 'No users available'}
            </h5>
          </Card.Body>
        </Card>
      )}

      {filteredUsers.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          
          <Pagination>
            <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            })}

            <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}
    </div>
  );
};

const TruncatedText = ({ text, maxWidth = 150, className = '' }) => (
  <Tooltip
    title={text}
    position="top"
    trigger="mouseenter"
    animation="scale"
    arrow={true}
    duration={200}
  >
    <span
      className={`text-truncate d-inline-block ${className}`}
      style={{ 
        maxWidth: `${maxWidth}px`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'help',
        verticalAlign: 'middle'
      }}
    >
      {text}
    </span>
  </Tooltip>
);

export default Users;