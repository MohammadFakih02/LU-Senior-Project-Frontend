import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  // Toast functions
  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showWarningToast = (message) => {
    toast.warn(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showInfoToast = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users");
        setUsers(response.data);
        setUsersError(null);
        showSuccessToast('Users loaded successfully');
      } catch (err) {
        setUsersError(err.message);
        showErrorToast('Failed to load users');
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
        showSuccessToast('Payments loaded successfully');
      } catch (err) {
        setPaymentsError(err.message);
        showErrorToast('Failed to load payments');
        console.error('Payments API Error:', err.response?.data || err.message);
      } finally {
        setPaymentsLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/bundles");
        setBundles(response.data);
        setBundlesError(null);
        showSuccessToast('Bundles loaded successfully');
      } catch (err) {
        setBundlesError(err.message);
        showErrorToast('Failed to load bundles');
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
      showSuccessToast('Users refreshed successfully');
    } catch (err) {
      setUsersError(err.message);
      showErrorToast('Failed to refresh users');
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
      showSuccessToast('Payments refreshed successfully');
    } catch (err) {
      setPaymentsError(err.message);
      showErrorToast('Failed to refresh payments');
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
      showSuccessToast('Bundles refreshed successfully');
    } catch (err) {
      setBundlesError(err.message);
      showErrorToast('Failed to refresh bundles');
    } finally {
      setBundlesLoading(false);
    }
  };

  const createBundle = async (bundleData) => {
    try {
      await axios.post("http://localhost:8080/api/bundles", bundleData);
      await refreshBundles();
      showSuccessToast('Bundle created successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to create bundle');
      throw error.response?.data || error;
    }
  };
  
  const updateBundle = async (bundleId, bundleData) => {
    try {
      await axios.put(`http://localhost:8080/api/bundles/${bundleId}`, bundleData);
      await refreshBundles();
      showSuccessToast('Bundle updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update bundle');
      throw error.response?.data || error;
    }
  };

  const createUser = async (userData) => {
    try {
      await axios.post("http://localhost:8080/api/users", userData);
      await refreshUsers();
      showSuccessToast('User created successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to create user');
      throw error.response?.data || error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      await axios.put(`http://localhost:8080/api/users/${userId}`, userData);
      await refreshUsers();
      showSuccessToast('User updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update user');
      throw error.response?.data || error;
    }
  };

  const fetchUserById = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
      return response.data;
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to fetch user');
      throw error.response?.data || error;
    }
  };

  const updatePaymentStatus = async (paymentId, paymentData) => {
    try {
      await axios.post(`http://localhost:8080/api/payments/${paymentId}/process`, paymentData);
      await refreshPayments();
      showSuccessToast('Payment status updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update payment status');
      throw error.response?.data || error;
    }
  };

  const updatePayment = async (paymentId, paymentData) => {
    try {
      await axios.put(`http://localhost:8080/api/payments/${paymentId}`, paymentData);
      await refreshPayments();
      showSuccessToast('Payment updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update payment');
      throw error.response?.data || error;
    }
  };

  return (
    <AppContext.Provider value={{
      // Users
      users, 
      usersLoading, 
      usersError, 
      refreshUsers,
      createUser,
      updateUser,
      fetchUserById,
      
      // Payments
      payments, 
      paymentsLoading, 
      paymentsError, 
      refreshPayments,
      updatePaymentStatus,
      updatePayment,
      
      bundles, 
      bundlesLoading, 
      bundlesError, 
      refreshBundles, 
      createBundle,
      updateBundle,
      
      showSuccessToast,
      showErrorToast,
      showWarningToast,
      showInfoToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;