// AppContext.jsx
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

  const [appSettings, setAppSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('appDashboardSettings');
      const defaultSettings = {
        autoCreateMonthly: false,
        autoCreateOnUserCreation: false,
        autoDeletePaymentTime: 'never',
        autoDisableBundleOnNoPayment: false, 
      };
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      return {
        autoCreateMonthly: false,
        autoCreateOnUserCreation: false,
        autoDeletePaymentTime: 'never',
        autoDisableBundleOnNoPayment: false, 
      };
    }
  });

  const updateAppSettings = (newSettings) => {
    setAppSettings(newSettings);
    try {
      localStorage.setItem('appDashboardSettings', JSON.stringify(newSettings));
    } catch (error)
    {
      console.error("Failed to save settings to localStorage", error);
    }
  };


  useEffect(() => {
    // Optional: Dismiss all toasts on component unmount or initial setup
    return () => toast.dismiss();
  }, []);

  const showSuccessToast = (message) => {
    toast.success(message, { toastId: `success-${message || Date.now()}` });
  };

  const showErrorToast = (message) => {
    toast.error(message, { toastId: `error-${message || Date.now()}`, autoClose: 5000 });
  };

  const showWarningToast = (message) => {
    toast.warn(message, { toastId: `warn-${message || Date.now()}`, autoClose: 4000 });
  };

  const showInfoToast = (message) => {
    toast.info(message, { toastId: `info-${message || Date.now()}`, autoClose: 2500 });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
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
      setPaymentsLoading(true);
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
      setBundlesLoading(true);
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
      if (options.showToast) {
          showErrorToast('Failed to refresh users');
      }
      console.error('Refresh Users API Error:', err.response?.data || err.message);
      throw err; // Re-throw the error
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
      if (options.showToast) {
          showErrorToast('Failed to refresh payments');
      }
      console.error('Refresh Payments API Error:', err.response?.data || err.message);
      throw err; // Re-throw the error
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
      if (options.showToast) {
          showErrorToast('Failed to refresh bundles');
      }
      console.error('Refresh Bundles API Error:', err.response?.data || err.message);
      throw err; // Re-throw the error
    } finally {
      setBundlesLoading(false);
    }
  };

  const createBundle = async (bundleData) => {
    try {
      const response = await axios.post("http://localhost:8080/api/bundles", bundleData);
      await refreshBundles({ showToast: false });
      showSuccessToast('Bundle created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create bundle';
      showErrorToast(errorMessage);
      console.error('Create Bundle API Error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  };
  
  const updateBundle = async (bundleId, bundleData) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/bundles/${bundleId}`, bundleData);
      await refreshBundles({ showToast: false });
      showSuccessToast('Bundle updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update bundle';
      showErrorToast(errorMessage);
      console.error('Update Bundle API Error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post("http://localhost:8080/api/users", userData);
      await refreshUsers({ showToast: false });
      showSuccessToast('User created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      showErrorToast(errorMessage);
      console.error('Create User API Error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${userId}`, userData);
      await refreshUsers({ showToast: false });
      showSuccessToast('User updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      showErrorToast(errorMessage);
      console.error('Update User API Error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  };

  const fetchUserById = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to fetch user with ID ${userId}`;
      console.error(`Fetch User By ID (${userId}) API Error: ${errorMessage}. Details:`, error.response?.data || error);
      throw error.response?.data || error; 
    }
  };

  const updatePaymentStatus = async (paymentId, paymentData) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/payments/${paymentId}/process`, paymentData);
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment status updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update payment status';
      showErrorToast(errorMessage);
      console.error('Update Payment Status API Error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  };

  const updatePayment = async (paymentId, paymentData) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/payments/${paymentId}`, paymentData);
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update payment';
      showErrorToast(errorMessage);
      console.error('Update Payment API Error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  };

  const createPayment = async (paymentData) => {
    try {
      const response = await axios.post("http://localhost:8080/api/payments", paymentData);
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create payment';
      showErrorToast(errorMessage);
      console.error("Create Payment API Error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  };

  const deletePayment = async (paymentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/payments/${paymentId}`);
      await refreshPayments({ showToast: false }); // Refresh payments list after deletion
      showSuccessToast('Payment deleted successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete payment';
      showErrorToast(errorMessage);
      console.error('Delete Payment API Error:', error.response?.data || error);
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
      createPayment,
      deletePayment,
      
      bundles,
      bundlesLoading,
      bundlesError,
      refreshBundles,
      createBundle,
      updateBundle,
      
      showSuccessToast,
      showErrorToast,
      showWarningToast,
      showInfoToast,

      appSettings,
      updateAppSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;