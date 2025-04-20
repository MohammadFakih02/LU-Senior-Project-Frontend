import { useEffect, useState } from 'react';
import { Table, Button, Form, Badge, Pagination, Spinner, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users");
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
        console.error('API Error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter(user => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const userData = [
      user.firstName?.toLowerCase() || '',
      user.lastName?.toLowerCase() || '',
      user.email?.toLowerCase() || '',
      user.phone?.toLowerCase() || '',
      user.location?.city?.toLowerCase() || '',
      ...(user.bundleNames?.map(b => b.toLowerCase()) || [])
    ].join(' ');

    return userData.includes(normalizedSearch);
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (error) return (
    <div className="p-3">
      <Alert variant="danger">{error}</Alert>
      <Button variant="secondary" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">User Management</h1>
        <div className="d-flex align-items-center gap-3">
          <Form.Control
            type="text"
            placeholder="Search users..."
            style={{ width: '300px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button as={Link} to="/users/create" variant="primary">
            Add New User
          </Button>
        </div>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body className="p-0">
          <Table striped bordered hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '5%', minWidth: '50px' }}>ID</th>
                <th style={{ width: '15%', minWidth: '150px' }}>Name</th>
                <th style={{ width: '20%', minWidth: '200px' }}>Email</th>
                <th style={{ width: '14%', minWidth: '120px' }}>Phone</th>
                <th style={{ width: '18%', minWidth: '180px' }}>Bundles</th>
                <th style={{ width: '10%', minWidth: '100px' }}>City</th>
                <th style={{ width: '10%', minWidth: '100px' }}>Status</th>
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
              {searchTerm.trim() ? 'No matching users found' : 'No users available'}
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

export default Users;