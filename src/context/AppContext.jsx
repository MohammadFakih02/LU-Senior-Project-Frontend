// AppContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = "http://localhost:8080";
const CONFIG_API_BASE_URL = `${API_BASE_URL}/api/config`;
const AUTH_API_BASE_URL = `${API_BASE_URL}/api/auth`;

const AppContext = createContext();

const defaultSettings = {
  autoCreateMonthly: false,
  autoCreateOnUserCreation: false,
  autoDeletePaymentTime: 'never',
  autoDisableBundleOnNoPayment: false,
};

const mapRetentionDaysToBackend = (value) => (value === 'never' ? 0 : parseInt(value, 10));
const mapRetentionDaysFromBackend = (value) => (value === 0 || value === null || typeof value === 'undefined' ? 'never' : String(value));

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const checkAuthStatus = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await axios.get(`${AUTH_API_BASE_URL}/status`, { withCredentials: true });
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser({ username: response.data.username });
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Auth status check failed:", error.response?.data || error.message);
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const loginUser = async (username, password) => {
    setAuthLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      await axios.post(`${AUTH_API_BASE_URL}/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      });
      await checkAuthStatus(); 
      showSuccessToast("Login successful!");
      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      const errorMessage = error.response?.data || "Login failed. Please check your credentials.";
      showErrorToast(typeof errorMessage === 'string' ? errorMessage : "Login failed.");
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthLoading(false);
      return false;
    }
  };

  const logoutUser = async () => {
    setAuthLoading(true);
    try {
      await axios.post(`${AUTH_API_BASE_URL}/logout`, {}, { withCredentials: true });
      showSuccessToast("Logout successful!");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      showErrorToast("Logout failed. Please try again.");
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthLoading(false);
    }
  };

  const fetchOrRefreshAppSettings = useCallback(async (isInitialFetch = false, options = {}) => {
    const { 
      showToastOnSuccess = !isInitialFetch,
      showToastOnError = true 
    } = options;

    setAppSettingsLoading(true);
    setAppSettingsError(null);
    try {
      const [
        recurringPaymentsRes,
        overdueProcessingRes,
        retentionDaysRes,
        autoCreateInitialPaymentRes,
      ] = await Promise.all([
        axios.get(`${CONFIG_API_BASE_URL}/recurring-payments`, { withCredentials: true }),
        axios.get(`${CONFIG_API_BASE_URL}/overdue-processing`, { withCredentials: true }),
        axios.get(`${CONFIG_API_BASE_URL}/retention-days`, { withCredentials: true }),
        axios.get(`${CONFIG_API_BASE_URL}/initial-payment/auto-create`, { withCredentials: true }),
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
          ...prevSettings,
          ...fetchedBackendSettings,
        };
        localStorage.setItem('appDashboardSettings', JSON.stringify(newSettings));
        return newSettings;
      });

      if (showToastOnSuccess) {
        showSuccessToast("Application settings loaded/reloaded successfully.");
      }
      return true;
    } catch (err) {
      const errorMessage = "Failed to load application settings from server. Using local/default settings if available.";
      console.error("Failed to fetch/refresh app settings from backend", err);
      setAppSettingsError(errorMessage);
      if (showToastOnError) {
        showErrorToast(isInitialFetch ? "Failed to load app settings. Using cached or default values." : "Failed to reload app settings.");
      }
      // If it's not an expected auth error (401 when not authenticated), re-throw it.
      // Otherwise, we'll just return false and let the auth flow handle redirection.
      if (!(err.response?.status === 401 && !isAuthenticated)) {
         throw err; // Re-throw for other types of errors
      }
       return false; // Indicate failure, especially for the 401 unauthenticated case
    } finally {
      setAppSettingsLoading(false);
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrRefreshAppSettings(true, { showToastOnSuccess: false });
    } else {
      setAppSettingsLoading(false);
    }
  }, [isAuthenticated, fetchOrRefreshAppSettings]);

  const refreshAppSettings = async (options = { showToastOnSuccess: true, showToastOnError: true }) => {
    if (!isAuthenticated) {
      showErrorToast("Please login to refresh application settings.");
      return false;
    }
    return fetchOrRefreshAppSettings(false, options);
  };

  const updateAppSettings = async (newSettings) => {
    if (!isAuthenticated) {
      showErrorToast("Please login to update application settings.");
      return false;
    }
    setAppSettingsLoading(true);
    const currentBackendSettings = {
      autoCreateMonthly: appSettings.autoCreateMonthly,
      autoDisableBundleOnNoPayment: appSettings.autoDisableBundleOnNoPayment,
      autoDeletePaymentTime: mapRetentionDaysToBackend(appSettings.autoDeletePaymentTime),
      autoCreateOnUserCreation: appSettings.autoCreateOnUserCreation,
    };

    const newBackendSettings = {
      autoCreateMonthly: newSettings.autoCreateMonthly,
      autoDisableBundleOnNoPayment: newSettings.autoDisableBundleOnNoPayment,
      autoDeletePaymentTime: mapRetentionDaysToBackend(newSettings.autoDeletePaymentTime),
      autoCreateOnUserCreation: newSettings.autoCreateOnUserCreation,
    };
    
    const backendUpdatePromises = [];

    if (newBackendSettings.autoCreateMonthly !== currentBackendSettings.autoCreateMonthly) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/recurring-payments/${newBackendSettings.autoCreateMonthly}`, {}, { withCredentials: true })
          .catch(err => { 
            const message = `Failed to update 'Auto Create Monthly': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw err; 
          })
      );
    }
    if (newBackendSettings.autoDisableBundleOnNoPayment !== currentBackendSettings.autoDisableBundleOnNoPayment) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/overdue-processing/${newBackendSettings.autoDisableBundleOnNoPayment}`, {}, { withCredentials: true })
          .catch(err => { 
            const message = `Failed to update 'Auto Disable Bundle': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw err; 
           })
      );
    }
    if (newBackendSettings.autoDeletePaymentTime !== currentBackendSettings.autoDeletePaymentTime) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/retention-days/${newBackendSettings.autoDeletePaymentTime}`, {}, { withCredentials: true })
          .catch(err => { 
            const message = `Failed to update 'Auto Delete Payment Time': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw err;
           })
      );
    }
    if (newBackendSettings.autoCreateOnUserCreation !== currentBackendSettings.autoCreateOnUserCreation) {
      backendUpdatePromises.push(
        axios.put(`${CONFIG_API_BASE_URL}/initial-payment/auto-create/${newBackendSettings.autoCreateOnUserCreation}`, {}, { withCredentials: true })
          .catch(err => { 
            const message = `Failed to update 'Auto Create on User Creation': ${err.response?.data?.message || err.message}`;
            console.error(message, err);
            showErrorToast(message);
            throw err;
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
      showSuccessToast("Settings updated successfully!");
      setAppSettingsLoading(false);
      return true; 
    } catch (error) {
      console.error("One or more settings failed to update on the backend.", error.message);
      showErrorToast("Some settings could not be saved. Check console.");
      setAppSettingsLoading(false);
      return false;
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true });
      setUsers(response.data);
      setUsersError(null);
    } catch (err) {
      setUsersError(err.message);
      if (err.response?.status !== 401) showErrorToast('Failed to load users');
      console.error('Users API Error:', err.response?.data || err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated) return;
    setPaymentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`, { withCredentials: true });
      setPayments(response.data);
      setPaymentsError(null);
    } catch (err) {
      setPaymentsError(err.message);
      if (err.response?.status !== 401) showErrorToast('Failed to load payments');
      console.error('Payments API Error:', err.response?.data || err.message);
    } finally {
      setPaymentsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBundles = useCallback(async () => {
    if (!isAuthenticated) return;
    setBundlesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bundles`, { withCredentials: true });
      setBundles(response.data);
      setBundlesError(null);
    } catch (err) {
      setBundlesError(err.message);
      if (err.response?.status !== 401) showErrorToast('Failed to load bundles');
      console.error('Bundles API Error:', err.response?.data || err.message);
    } finally {
      setBundlesLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchPayments();
      fetchBundles();
    } else {
      setUsers([]);
      setPayments([]);
      setBundles([]);
      setUsersLoading(false);
      setPaymentsLoading(false);
      setBundlesLoading(false);
    }
  }, [isAuthenticated, fetchUsers, fetchPayments, fetchBundles]);

  const refreshUsers = async (options = { showToast: true }) => {
    if (!isAuthenticated) return;
    setUsersLoading(true);
    try { 
      const response = await axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true });
      setUsers(response.data); setUsersError(null);
      if (options.showToast) showSuccessToast('Users refreshed successfully');
    } catch (err) { 
      setUsersError(err.message); if (options.showToast) showErrorToast('Failed to refresh users'); 
      console.error('Refresh Users API Error:', err.response?.data || err.message);
      throw err;
    } finally { setUsersLoading(false); }
  };

  const refreshPayments = async (options = { showToast: true }) => {
    if (!isAuthenticated) return;
    setPaymentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`, { withCredentials: true });
      setPayments(response.data); setPaymentsError(null);
      if (options.showToast) showSuccessToast('Payments refreshed successfully');
    } catch (err) {
      setPaymentsError(err.message); if (options.showToast) showErrorToast('Failed to refresh payments'); 
      console.error('Refresh Payments API Error:', err.response?.data || err.message);
      throw err;
    } finally { setPaymentsLoading(false); }
  };

  const refreshBundles = async (options = { showToast: true }) => {
    if (!isAuthenticated) return;
    setBundlesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bundles`, { withCredentials: true });
      setBundles(response.data); setBundlesError(null);
      if (options.showToast) showSuccessToast('Bundles refreshed successfully');
    } catch (err) {
      setBundlesError(err.message); if (options.showToast) showErrorToast('Failed to refresh bundles'); 
      console.error('Refresh Bundles API Error:', err.response?.data || err.message);
      throw err;
    } finally { setBundlesLoading(false); }
  };

  const createBundle = async (bundleData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/bundles`, bundleData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/bundles/${bundleId}`, bundleData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, userData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, userData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, { withCredentials: true });
      return response.data;
    } catch (error) { 
      const errorMessage = error.response?.data?.message || `Failed to fetch user with ID ${userId}`;
      console.error(`Fetch User By ID (${userId}) API Error: ${errorMessage}. Details:`, error.response?.data || error);
      throw error.response?.data || error;  
    }
  };
  const updatePaymentStatus = async (paymentId, paymentData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments/${paymentId}/process`, paymentData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/payments/${paymentId}`, paymentData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments`, paymentData, { withCredentials: true });
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
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      await axios.delete(`${API_BASE_URL}/api/payments/${paymentId}`, { withCredentials: true });
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
      isAuthenticated,
      currentUser,
      authLoading,
      loginUser,
      logoutUser,
      checkAuthStatus,

      users, usersLoading, usersError, refreshUsers, createUser, updateUser, fetchUserById,
      payments, paymentsLoading, paymentsError, refreshPayments, updatePaymentStatus, updatePayment, createPayment, deletePayment,
      bundles, bundlesLoading, bundlesError, refreshBundles, createBundle, updateBundle,
      
      showSuccessToast, showErrorToast, showWarningToast, showInfoToast,

      appSettings, updateAppSettings, appSettingsLoading, appSettingsError, refreshAppSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;