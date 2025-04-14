// pages/User.js
import { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Users = () => {
  // Sample user data
  const[users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async() =>{
      try{
      const response = await axios.get("http://localhost:8080/api/users");
      setUsers(response.data);
      }
      catch(err){
        setError(err.message);
        console.error('API Error:', err.response?.data || err.message)
      }
      finally{
        setLoading(false);
      }
    };
    fetchUsers();
  },[]);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        <Button as={Link} to="/users/create" variant="primary">
          Add New User
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
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
          {users.map((user) => (
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
    </div>
  );
};

export default Users;