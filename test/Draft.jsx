import axios from "axios";
import { useEffect, useState } from "react";

const Draft=()=>{
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const response = await axios.get('http://localhost:8080/api/users');
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
  
    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;
  
    return(
<div>
      <h1>User List</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Phone</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Subscription Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ border: '1px solid #ddd' }}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.id}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {user.firstName} {user.lastName}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {user.phone || 'N/A'}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.status}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {new Date(user.subscriptionDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
}

export default Draft;