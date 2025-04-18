import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Payments state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState(null);

  // Bundles state
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [bundlesError, setBundlesError] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users");
        setUsers(response.data);
        setUsersError(null);
      } catch (err) {
        setUsersError(err.message);
        console.error('Users API Error:', err.response?.data || err.message);
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/payments");
        setPayments(response.data);
        setPaymentsError(null);
      } catch (err) {
        setPaymentsError(err.message);
        console.error('Payments API Error:', err.response?.data || err.message);
      } finally {
        setPaymentsLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  // Fetch bundles
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/bundles");
        setBundles(response.data);
        setBundlesError(null);
      } catch (err) {
        setBundlesError(err.message);
        console.error('Bundles API Error:', err.response?.data || err.message);
      } finally {
        setBundlesLoading(false);
      }
    };
    
    fetchBundles();
  }, []);

  // Refresh functions for each endpoint
  const refreshUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/users");
      setUsers(response.data);
      setUsersError(null);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const refreshPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/payments");
      setPayments(response.data);
      setPaymentsError(null);
    } catch (err) {
      setPaymentsError(err.message);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const refreshBundles = async () => {
    setBundlesLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/bundles");
      setBundles(response.data);
      setBundlesError(null);
    } catch (err) {
      setBundlesError(err.message);
    } finally {
      setBundlesLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      // Users
      users, 
      usersLoading, 
      usersError, 
      refreshUsers,
      
      // Payments
      payments, 
      paymentsLoading, 
      paymentsError, 
      refreshPayments,
      
      // Bundles
      bundles, 
      bundlesLoading, 
      bundlesError, 
      refreshBundles
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;