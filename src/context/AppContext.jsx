import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState(null);

  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [bundlesError, setBundlesError] = useState(null);

  useEffect(() => {
    return () => toast.dismiss();
  }, []);

  const showSuccessToast = (message) => {
    toast.success(message, { toastId: `success-${message}` });
  };

  const showErrorToast = (message) => {
    toast.error(message, { toastId: `error-${message}`, autoClose: 5000 });
  };

  const showWarningToast = (message) => {
    toast.warn(message, { toastId: `warn-${message}`, autoClose: 4000 });
  };

  const showInfoToast = (message) => {
    toast.info(message, { toastId: `info-${message}`, autoClose: 2500 });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users");
        setUsers(response.data);
        setUsersError(null);
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

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/payments");
        setPayments(response.data);
        setPaymentsError(null);
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

  const refreshUsers = async (options = { showToast: true }) => {
    setUsersLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/users");
      setUsers(response.data);
      setUsersError(null);
      if (options.showToast) {
        showSuccessToast('Users refreshed successfully');
      }
    } catch (err) {
      setUsersError(err.message);
      showErrorToast('Failed to refresh users');
    } finally {
      setUsersLoading(false);
    }
  };

  const refreshPayments = async (options = { showToast: true }) => {
    setPaymentsLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/payments");
      setPayments(response.data);
      setPaymentsError(null);
      if (options.showToast) {
        showSuccessToast('Payments refreshed successfully');
      }
    } catch (err) {
      setPaymentsError(err.message);
      showErrorToast('Failed to refresh payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const refreshBundles = async (options = { showToast: true }) => {
    setBundlesLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/bundles");
      setBundles(response.data);
      setBundlesError(null);
      if (options.showToast) {
        showSuccessToast('Bundles refreshed successfully');
      }
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
      await refreshBundles({ showToast: false });
      showSuccessToast('Bundle created successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to create bundle');
      throw error.response?.data || error;
    }
  };
  
  const updateBundle = async (bundleId, bundleData) => {
    try {
      await axios.put(`http://localhost:8080/api/bundles/${bundleId}`, bundleData);
      await refreshBundles({ showToast: false });
      showSuccessToast('Bundle updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update bundle');
      throw error.response?.data || error;
    }
  };

  const createUser = async (userData) => {
    try {
      await axios.post("http://localhost:8080/api/users", userData);
      await refreshUsers({ showToast: false });
      showSuccessToast('User created successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to create user');
      throw error.response?.data || error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      await axios.put(`http://localhost:8080/api/users/${userId}`, userData);
      await refreshUsers({ showToast: false });
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
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment status updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update payment status');
      throw error.response?.data || error;
    }
  };

  const updatePayment = async (paymentId, paymentData) => {
    try {
      await axios.put(`http://localhost:8080/api/payments/${paymentId}`, paymentData);
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment updated successfully');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Failed to update payment');
      throw error.response?.data || error;
    }
  };

  return (
    <AppContext.Provider value={{
      users, 
      usersLoading, 
      usersError, 
      refreshUsers,
      createUser,
      updateUser,
      fetchUserById,
      
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