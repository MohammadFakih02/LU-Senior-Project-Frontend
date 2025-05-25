// AppContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = "http://localhost:8080"; // Main API base
const CONFIG_API_BASE_URL = `${API_BASE_URL}/api/config`; // Config API base

const AppContext = createContext();

const defaultSettings = {
  autoCreateMonthly: false,
  autoCreateOnUserCreation: false, // This setting will now be synced with the backend
  autoDeletePaymentTime: 'never',  // 'never', '30', '60', '90'
  autoDisableBundleOnNoPayment: false,
};

// Helper mappers for retention days
const mapRetentionDaysToBackend = (value) => (value === 'never' ? 0 : parseInt(value, 10));
const mapRetentionDaysFromBackend = (value) => (value === 0 || value === null || typeof value === 'undefined' ? 'never' : String(value));


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

  const [appSettingsLoading, setAppSettingsLoading] = useState(true);
  const [appSettingsError, setAppSettingsError] = useState(null);
  const [appSettings, setAppSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('appDashboardSettings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      return defaultSettings;
    }
  });

  // Toast functions
  useEffect(() => {
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
    toast.info(message, { toastId: `info-${message || Date.now()}`, autoClose: 3500 });
  };

  // Function to fetch/refresh app settings
  const fetchOrRefreshAppSettings = async (isInitialFetch = false, options = {}) => {
    const { 
      showToastOnSuccess = !isInitialFetch, // Show success toast on manual refresh by default
      showToastOnError = true 
    } = options;

    setAppSettingsLoading(true);
    setAppSettingsError(null); // Clear previous errors on new attempt
    try {
      const [
        recurringPaymentsRes,
        overdueProcessingRes,
        retentionDaysRes,
        autoCreateInitialPaymentRes,
      ] = await Promise.all([
        axios.get(`${CONFIG_API_BASE_URL}/recurring-payments`),
        axios.get(`${CONFIG_API_BASE_URL}/overdue-processing`),
        axios.get(`${CONFIG_API_BASE_URL}/retention-days`),
        axios.get(`${CONFIG_API_BASE_URL}/initial-payment/auto-create`),
      ]);

      const fetchedBackendSettings = {
        autoCreateMonthly: recurringPaymentsRes.data,
        autoDisableBundleOnNoPayment: overdueProcessingRes.data,
        autoDeletePaymentTime: mapRetentionDaysFromBackend(retentionDaysRes.data),
        autoCreateOnUserCreation: autoCreateInitialPaymentRes.data,
      };
      
      setAppSettings(prevSettings => {
        const newSettings = {
          ...defaultSettings,
          ...prevSettings, // existing client-side or localStorage settings
          ...fetchedBackendSettings,
        };
        localStorage.setItem('appDashboardSettings', JSON.stringify(newSettings));
        return newSettings;
      });

      if (showToastOnSuccess) {
        showSuccessToast("Application settings loaded/reloaded successfully.");
      }
      return true; // Indicate success
    } catch (err) {
      const errorMessage = "Failed to load application settings from server. Using local/default settings if available.";
      console.error("Failed to fetch/refresh app settings from backend", err);
      setAppSettingsError(errorMessage);
      if (showToastOnError) {
        showErrorToast(isInitialFetch ? "Failed to load app settings. Using cached or default values." : "Failed to reload app settings.");
      }
      throw err; // Re-throw for caller to handle if needed
    } finally {
      setAppSettingsLoading(false);
    }
  };
  
  // Fetch initial app settings from backend
  useEffect(() => {
    fetchOrRefreshAppSettings(true, { showToastOnSuccess: false }); // isInitialFetch = true, suppress success toast
  }, []);

  const refreshAppSettings = async (options = { showToastOnSuccess: true, showToastOnError: true }) => {
    return fetchOrRefreshAppSettings(false, options); // isInitialFetch = false
  };


  const updateAppSettings = async (newSettings) => {
    // Current settings from the state, which should be up-to-date from backend/localStorage
    const currentBackendSettings = {
      autoCreateMonthly: appSettings.autoCreateMonthly,
      autoDisableBundleOnNoPayment: appSettings.autoDisableBundleOnNoPayment,
      autoDeletePaymentTime: mapRetentionDaysToBackend(appSettings.autoDeletePaymentTime),
      autoCreateOnUserCreation: appSettings.autoCreateOnUserCreation, // Added
    };

    // New settings potentially being saved
    const newBackendSettings = {
      autoCreateMonthly: newSettings.autoCreateMonthly,
      autoDisableBundleOnNoPayment: newSettings.autoDisableBundleOnNoPayment,
      autoDeletePaymentTime: mapRetentionDaysToBackend(newSettings.autoDeletePaymentTime),
      autoCreateOnUserCreation: newSettings.autoCreateOnUserCreation, // Added
    };
    
    const backendUpdatePromises = [];

    if (newBackendSettings.autoCreateMonthly !== currentBackendSettings.autoCreateMonthly) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/recurring-payments/${newBackendSettings.autoCreateMonthly}`)
          .catch(err => {
            const message = `Failed to update 'Auto Create Monthly': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw new Error(message);
          })
      );
    }

    if (newBackendSettings.autoDisableBundleOnNoPayment !== currentBackendSettings.autoDisableBundleOnNoPayment) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/overdue-processing/${newBackendSettings.autoDisableBundleOnNoPayment}`)
          .catch(err => {
            const message = `Failed to update 'Auto Disable Bundle': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw new Error(message);
          })
      );
    }
    
    if (newBackendSettings.autoDeletePaymentTime !== currentBackendSettings.autoDeletePaymentTime) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/retention-days/${newBackendSettings.autoDeletePaymentTime}`)
          .catch(err => {
            const message = `Failed to update 'Auto Delete Payment Time': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw new Error(message);
          })
      );
    }

    // Added for autoCreateOnUserCreation
    if (newBackendSettings.autoCreateOnUserCreation !== currentBackendSettings.autoCreateOnUserCreation) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/initial-payment/auto-create/${newBackendSettings.autoCreateOnUserCreation}`)
          .catch(err => {
            const message = `Failed to update 'Auto Create on User Creation': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw new Error(message);
          })
      );
    }

    try {
      if (backendUpdatePromises.length > 0) {
        await Promise.all(backendUpdatePromises);
      }
      
      setAppSettings(currentFullSettings => {
        const updatedFullSettings = { ...currentFullSettings, ...newSettings };
        localStorage.setItem('appDashboardSettings', JSON.stringify(updatedFullSettings));
        return updatedFullSettings;
      });
      return true; 

    } catch (error) {
      console.error("One or more settings failed to update on the backend.", error.message);
      throw new Error("Some settings could not be saved to the server. Check individual error messages.");
    }
  };

  // Data fetching useEffects (Users, Payments, Bundles)
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`);
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
        const response = await axios.get(`${API_BASE_URL}/api/payments`);
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
        const response = await axios.get(`${API_BASE_URL}/api/bundles`);
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

  // Refresh functions
  const refreshUsers = async (options = { showToast: true }) => {
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`);
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
      throw err;
    } finally {
      setUsersLoading(false);
    }
  };

  const refreshPayments = async (options = { showToast: true }) => {
    setPaymentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`);
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
      throw err;
    } finally {
      setPaymentsLoading(false);
    }
  };

  const refreshBundles = async (options = { showToast: true }) => {
    setBundlesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bundles`);
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
      throw err;
    } finally {
      setBundlesLoading(false);
    }
  };

  // CRUD operations
  const createBundle = async (bundleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/bundles`, bundleData);
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
      const response = await axios.put(`${API_BASE_URL}/api/bundles/${bundleId}`, bundleData);
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
      const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
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
      const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, userData);
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
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to fetch user with ID ${userId}`;
      console.error(`Fetch User By ID (${userId}) API Error: ${errorMessage}. Details:`, error.response?.data || error);
      throw error.response?.data || error; 
    }
  };

  const updatePaymentStatus = async (paymentId, paymentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments/${paymentId}/process`, paymentData);
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
      const response = await axios.put(`${API_BASE_URL}/api/payments/${paymentId}`, paymentData);
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
      const response = await axios.post(`${API_BASE_URL}/api/payments`, paymentData);
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
      await axios.delete(`${API_BASE_URL}/api/payments/${paymentId}`);
      await refreshPayments({ showToast: false });
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
      appSettingsLoading,
      appSettingsError,
      refreshAppSettings, // Export the new function
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;