// pages/User.js
import { useEffect, useState } from 'react';
import { Table, Button, Form } from 'react-bootstrap'; // Added Form component
import { Link } from 'react-router-dom';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search

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
    return Object.values(user).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        <div className="d-flex align-items-center gap-3">
          {/* Search Input */}
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

      {/* Scrollable Table Container */}
      <div style={{ maxHeight: '550px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
        <Table striped bordered hover responsive>
          <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Landline</th>
              <th>Phone</th>
              <th>Consumption</th>
              <th>Bill</th>
              <th>Subscription Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName + " " + user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.landLine}</td>
                <td>{user.phone}</td>
                <td>{user.consumption}</td>
                <td>{user.bill}</td>
                <td>{user.subscriptionDate}</td>
                <td>{user.status}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2">
                    View
                  </Button>
                  <Button variant="warning" size="sm">
                    Edit
                  </Button>
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

      <style>
        {`
          thead {
            position: sticky;
            top: 0;
            z-index: 1;
          }
        `}
      </style>
    </div>
  );
};

export default Users;