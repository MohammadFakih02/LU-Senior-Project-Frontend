// pages/User.js
import { useEffect, useState } from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
      (user.bundleNames && user.bundleNames.some(bundle => 
        bundle.toLowerCase().includes(searchLower)
      ))
    );
  });

  if (loading) return <div className="p-3">Loading users...</div>;
  if (error) return <div className="p-3 text-danger">Error: {error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
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

      <div style={{ maxHeight: '550px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
        <Table striped bordered hover responsive className="mb-0">
          <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Bundles</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  {user.bundleNames && user.bundleNames.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {user.bundleNames.map((bundle, index) => (
                        <Badge key={index} bg="info" className="text-truncate" style={{ maxWidth: '150px' }}>
                          {bundle}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{user.location?.city || '-'}</td>
                <td>
                  <Badge bg={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {user.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                  <Button variant="info" size="sm" as={Link} to={`/users/${user.id}`}>
                    View
                  </Button>
                    <Button variant="warning" size="sm" as={Link} to={`/users/edit/${user.id}`}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {filteredUsers.length === 0 && (
          <div className="text-center p-3 text-muted">
            No matching users found
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;