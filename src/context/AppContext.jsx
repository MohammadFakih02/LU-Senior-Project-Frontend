import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = "https://internet-provider-service-314943734627.europe-west1.run.app";
const CONFIG_API_BASE_URL = `${API_BASE_URL}/api/config`;
const AUTH_API_BASE_URL = `${API_BASE_URL}/api/auth`;

const NETWORK_ERROR_TOAST_MESSAGE = "Network error. Please check your connection and server status.";
const LOGIN_BACKEND_UNAVAILABLE_MESSAGE = "Login service is currently unavailable. Please try again later or check server status.";
const LOGIN_GENERIC_FAILURE_MESSAGE = "Login failed. Please check your credentials or try again.";

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
    return () => toast.dismiss(); // Clear all toasts on unmount
  }, []);

  // Memoized Toast Functions
  const showSuccessToast = useCallback((message, options = {}) => {
    const defaultOptions = { toastId: `success-${message || Date.now()}` };
    toast.success(message, { ...defaultOptions, ...options });
  }, []);

  const showErrorToast = useCallback((message, options = {}) => {
    const defaultOptions = { toastId: `error-${message || Date.now()}`, autoClose: 5000 };
    toast.error(message, { ...defaultOptions, ...options });
  }, []);

  const showWarningToast = useCallback((message, options = {}) => {
    const defaultOptions = { toastId: `warn-${message || Date.now()}`, autoClose: 4000 };
    toast.warn(message, { ...defaultOptions, ...options });
  }, []);

  const showInfoToast = useCallback((message, options = {}) => {
    const defaultOptions = { toastId: `info-${message || Date.now()}`, autoClose: 3500 };
    toast.info(message, { ...defaultOptions, ...options });
  }, []);

  // Memoized Auth Functions
  const checkAuthStatus = useCallback(async (isInitialCheck = true) => {
    setAuthLoading(true);
    try {
      const response = await axios.get(`${AUTH_API_BASE_URL}/status`, { withCredentials: true });
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser({ username: response.data.username });
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        // No need to throw if server explicitly says not authenticated, state is set.
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      if (error.isAxiosError && !error.response) {
        console.error("Auth status check failed due to network error:", error.message);
        if (!isInitialCheck) showErrorToast(NETWORK_ERROR_TOAST_MESSAGE);
      } else if (error.response) {
        console.error("Auth status check API error:", error.response.data || error.message);
      } else {
        console.error("Auth status check failed with unexpected error:", error.message);
      }
      // Re-throw so callers like loginUser can handle it
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, [showErrorToast]); // showErrorToast is stable

  useEffect(() => {
    const performInitialAuthCheck = async () => {
        try {
            await checkAuthStatus(true);
        } catch (e) {
            // Errors are logged by checkAuthStatus.
            // isAuthenticated will be false, authLoading will be false.
            console.warn("Initial auth status check in useEffect failed:", e.message);
        }
    };
    performInitialAuthCheck();
  }, [checkAuthStatus]);

  const loginUser = useCallback(async (username, password) => {
    setAuthLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      await axios.post(`${AUTH_API_BASE_URL}/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      });
      await checkAuthStatus(false); // This will set isAuthenticated, currentUser, and authLoading
      showSuccessToast("Login successful!");
      // setAuthLoading(false) is handled by checkAuthStatus
    } catch (error) {
      // checkAuthStatus will set isAuthenticated to false on error if it's called
      // If axios.post fails before checkAuthStatus, we need to set them here.
      setIsAuthenticated(false); 
      setCurrentUser(null);
      setAuthLoading(false); // Ensure authLoading is false on login failure path

      let errorMessageForToast = LOGIN_GENERIC_FAILURE_MESSAGE;
      let errorMessageForCaller = LOGIN_GENERIC_FAILURE_MESSAGE;

      if (error.isAxiosError && !error.response) {
        console.error("Login failed due to network/request error:", error.message);
        errorMessageForToast = LOGIN_BACKEND_UNAVAILABLE_MESSAGE;
        errorMessageForCaller = LOGIN_BACKEND_UNAVAILABLE_MESSAGE;
      } else if (error.response) {
        console.error("Login API Error:", error.response.status, error.response.data || error.message);
        const responseData = error.response.data;
        if (error.response.status === 429 && responseData && responseData.message) {
             errorMessageForToast = responseData.message;
        } else if (typeof responseData === 'string' && responseData.length > 0) {
             errorMessageForToast = responseData;
        } else if (responseData && responseData.message) {
             errorMessageForToast = responseData.message;
        } else if (error.response.status === 401) {
            errorMessageForToast = "Login failed: Invalid username or password.";
        }
        errorMessageForCaller = errorMessageForToast;
      } else {
        console.error("Login process failed with an internal/unexpected error:", error.message, error);
        errorMessageForToast = error.message?.includes("Auth check failed") ? LOGIN_BACKEND_UNAVAILABLE_MESSAGE : (error.message || "Login failed due to an internal error.");
        errorMessageForCaller = errorMessageForToast;
      }
      
      showErrorToast(errorMessageForToast);
      throw new Error(errorMessageForCaller);
    }
  }, [checkAuthStatus, showSuccessToast, showErrorToast]); // Dependencies are stable

  const logoutUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      await axios.post(`${AUTH_API_BASE_URL}/logout`, {}, { withCredentials: true });
      showSuccessToast("Logout successful!");
    } catch (error) {
      // Error handling... (similar to before, using stable showErrorToast)
      if (error.isAxiosError && !error.response) {
        showErrorToast(NETWORK_ERROR_TOAST_MESSAGE);
      } else if (error.response) {
        showErrorToast(`Logout failed: ${error.response.data?.message || 'Please try again.'}`);
      } else {
        showErrorToast("Logout failed due to an unexpected error. Please try again.");
      }
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthLoading(false);
    }
  }, [showSuccessToast, showErrorToast]); // Dependencies are stable

  // Memoized Settings Functions
  const fetchOrRefreshAppSettings = useCallback(async (isInitialFetch = false, options = {}) => {
    const { showToastOnSuccess = !isInitialFetch, showToastOnError = true } = options;
    setAppSettingsLoading(true);
    setAppSettingsError(null);
    try {
      const [recurringPaymentsRes, overdueProcessingRes, retentionDaysRes, autoCreateInitialPaymentRes] = await Promise.all([
        axios.get(`${CONFIG_API_BASE_URL}/recurring-payments`, { withCredentials: true }),
        axios.get(`${CONFIG_API_BASE_URL}/overdue-processing`, { withCredentials: true }),
        axios.get(`${CONFIG_API_BASE_URL}/retention-days`, { withCredentials: true }),
        axios.get(`${CONFIG_API_BASE_URL}/initial-payment/auto-create`, { withCredentials: true }),
      ]);
      const newSettingsData = {
        autoCreateMonthly: recurringPaymentsRes.data,
        autoDisableBundleOnNoPayment: overdueProcessingRes.data,
        autoDeletePaymentTime: mapRetentionDaysFromBackend(retentionDaysRes.data),
        autoCreateOnUserCreation: autoCreateInitialPaymentRes.data,
      };
      setAppSettings(prevSettings => {
        const newSettings = { ...defaultSettings, ...prevSettings, ...newSettingsData };
        localStorage.setItem('appDashboardSettings', JSON.stringify(newSettings));
        return newSettings;
      });
      if (showToastOnSuccess) showSuccessToast("Application settings loaded/reloaded successfully.");
      return true;
    } catch (err) {
      let errorMsgForState = "Failed to load application settings.";
      if (err.isAxiosError && !err.response) {
        errorMsgForState = "Network error: Failed to load application settings.";
        if (showToastOnError) showErrorToast(NETWORK_ERROR_TOAST_MESSAGE);
      } else if (err.response) {
        errorMsgForState = `Failed to load application settings from server (status ${err.response.status}).`;
        if (showToastOnError) showErrorToast(isInitialFetch ? `${errorMsgForState} Using cached or default values.` : errorMsgForState);
      } else {
        errorMsgForState = "An unexpected error occurred while loading application settings.";
        if (showToastOnError) showErrorToast(isInitialFetch ? `${errorMsgForState} Using cached or default values.` : errorMsgForState);
      }
      setAppSettingsError(errorMsgForState);
      return false; 
    } finally {
      setAppSettingsLoading(false);
    }
  }, [showSuccessToast, showErrorToast]); // Dependencies are stable

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrRefreshAppSettings(true, { showToastOnSuccess: false });
    } else {
      setAppSettingsLoading(false);
      setAppSettings(defaultSettings); // Reset to default if not authenticated
      localStorage.removeItem('appDashboardSettings');
    }
  }, [isAuthenticated, fetchOrRefreshAppSettings]);

  const refreshAppSettings = useCallback(async (options = { showToastOnSuccess: true, showToastOnError: true }) => {
    if (!isAuthenticated) {
      showErrorToast("Please login to refresh application settings.");
      return false;
    }
    return fetchOrRefreshAppSettings(false, options);
  }, [isAuthenticated, fetchOrRefreshAppSettings, showErrorToast]);

  const updateAppSettings = useCallback(async (newSettings) => {
    if (!isAuthenticated) {
      showErrorToast("Please login to update application settings.");
      return false;
    }
    setAppSettingsLoading(true);
    const backendUpdatePromises = [];
    const createCatchHandler = (settingName) => (err) => { /* ... uses showErrorToast ... */
        let toastMessage;
        if (err.isAxiosError && !err.response) toastMessage = NETWORK_ERROR_TOAST_MESSAGE;
        else if (err.response) toastMessage = `Failed to update '${settingName}': ${err.response.data?.message || err.message}`;
        else toastMessage = `Unexpected error updating '${settingName}': ${err.message}`;
        showErrorToast(toastMessage);
        throw err;
    };

    if (newSettings.autoCreateMonthly !== appSettings.autoCreateMonthly) backendUpdatePromises.push(axios.put(`${CONFIG_API_BASE_URL}/recurring-payments/${newSettings.autoCreateMonthly}`, {}, { withCredentials: true }).catch(createCatchHandler('Auto Create Monthly')));
    if (newSettings.autoDisableBundleOnNoPayment !== appSettings.autoDisableBundleOnNoPayment) backendUpdatePromises.push(axios.put(`${CONFIG_API_BASE_URL}/overdue-processing/${newSettings.autoDisableBundleOnNoPayment}`, {}, { withCredentials: true }).catch(createCatchHandler('Auto Disable Bundle')));
    if (mapRetentionDaysToBackend(newSettings.autoDeletePaymentTime) !== mapRetentionDaysToBackend(appSettings.autoDeletePaymentTime)) backendUpdatePromises.push(axios.put(`${CONFIG_API_BASE_URL}/retention-days/${mapRetentionDaysToBackend(newSettings.autoDeletePaymentTime)}`, {}, { withCredentials: true }).catch(createCatchHandler('Auto Delete Payment Time')));
    if (newSettings.autoCreateOnUserCreation !== appSettings.autoCreateOnUserCreation) backendUpdatePromises.push(axios.put(`${CONFIG_API_BASE_URL}/initial-payment/auto-create/${newSettings.autoCreateOnUserCreation}`, {}, { withCredentials: true }).catch(createCatchHandler('Auto Create on User Creation')));

    try {
      if (backendUpdatePromises.length > 0) await Promise.all(backendUpdatePromises);
      setAppSettings(currentFullSettings => {
        const updatedFullSettings = { ...currentFullSettings, ...newSettings };
        localStorage.setItem('appDashboardSettings', JSON.stringify(updatedFullSettings));
        return updatedFullSettings;
      });
      showSuccessToast("Settings updated successfully!");
      return true;
    } finally {
      setAppSettingsLoading(false);
    }
  }, [isAuthenticated, appSettings, showErrorToast, showSuccessToast, fetchOrRefreshAppSettings]);

  const changeAdminPassword = useCallback(async (oldPassword, newPassword) => {
    // ... uses showErrorToast, showSuccessToast ...
    if (!isAuthenticated) { 
      showErrorToast("Authentication required to change password.");
      throw new Error("Authentication required.");
    }
    try {
      await axios.put(`${AUTH_API_BASE_URL}/change-password`, { oldPassword, newPassword }, { withCredentials: true });
      showSuccessToast("Password changed successfully!");
    } catch (error) {
      // Error handling logic as before, using stable toast functions
        if (error.isAxiosError && !error.response) {
            showErrorToast(NETWORK_ERROR_TOAST_MESSAGE); throw new Error(NETWORK_ERROR_TOAST_MESSAGE);
        } else if (error.response) {
            const { status, data } = error.response;
            const responseMessage = (typeof data === 'string' ? data : data?.message) || '';
            if (status === 400 && responseMessage === "Incorrect old password.") throw new Error("Incorrect old password. Please try again.");
            const displayMessage = responseMessage || `Password change failed (status ${status}). Please try again.`;
            showErrorToast(displayMessage); throw new Error(displayMessage);
        } else {
            const genericFailMsg = "Password change failed. An unexpected error occurred.";
            showErrorToast(genericFailMsg); throw new Error(genericFailMsg);
        }
    }
  }, [isAuthenticated, showErrorToast, showSuccessToast]);

  // Memoized Error Handlers for CRUD and Fetching
  const handleFetchError = useCallback((err, entityName, setErrorState) => {
    setErrorState(err.message || `Failed to fetch ${entityName}`);
    if (err.isAxiosError && !err.response) {
      showErrorToast(NETWORK_ERROR_TOAST_MESSAGE);
    } else if (err.response) {
      if (err.response.status !== 401) { // 401 handled by global auth flow potentially
        const serverMsg = err.response.data?.message || err.response.data;
        const toastMsg = typeof serverMsg === 'string' ? serverMsg : `Failed to load ${entityName.toLowerCase()}.`;
        showErrorToast(toastMsg);
      }
    } else {
      showErrorToast(`An unexpected error occurred while fetching ${entityName.toLowerCase()}.`);
    }
  }, [showErrorToast]); // Depends on stable showErrorToast

  const handleRefreshError = useCallback((err, entityName, setErrorState, options) => {
    setErrorState(err.message || `Failed to refresh ${entityName}`);
    let shouldThrow = false;
    if (err.isAxiosError && !err.response) {
        if (options.showToast) showErrorToast(NETWORK_ERROR_TOAST_MESSAGE);
        shouldThrow = true;
    } else if (err.response) {
        if (options.showToast && err.response.status !== 401) {
            const serverMsg = err.response.data?.message || err.response.data;
            const toastMsg = typeof serverMsg === 'string' ? serverMsg : `Failed to refresh ${entityName.toLowerCase()}.`;
            showErrorToast(toastMsg);
        }
        if (err.response.status !== 401) shouldThrow = true;
    } else {
        if (options.showToast) showErrorToast(`An unexpected error occurred while refreshing ${entityName.toLowerCase()}.`);
        shouldThrow = true;
    }
    if (shouldThrow) throw err;
  }, [showErrorToast]); // Depends on stable showErrorToast

  // Memoized Data Fetching Functions
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true });
      setUsers(response.data);
      setUsersError(null);
    } catch (err) {
      handleFetchError(err, "Users", setUsersError);
    } finally {
      setUsersLoading(false);
    }
  }, [isAuthenticated, handleFetchError]);

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated) return;
    setPaymentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`, { withCredentials: true });
      setPayments(response.data);
      setPaymentsError(null);
    } catch (err) {
      handleFetchError(err, "Payments", setPaymentsError);
    } finally {
      setPaymentsLoading(false);
    }
  }, [isAuthenticated, handleFetchError]);

  const fetchBundles = useCallback(async () => {
    if (!isAuthenticated) return;
    setBundlesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bundles`, { withCredentials: true });
      setBundles(response.data);
      setBundlesError(null);
    } catch (err) {
      handleFetchError(err, "Bundles", setBundlesError);
    } finally {
      setBundlesLoading(false);
    }
  }, [isAuthenticated, handleFetchError]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchPayments();
      fetchBundles();
    } else {
      setUsers([]); setPayments([]); setBundles([]);
      setUsersLoading(false); setPaymentsLoading(false); setBundlesLoading(false);
      setUsersError(null); setPaymentsError(null); setBundlesError(null);
    }
  }, [isAuthenticated, fetchUsers, fetchPayments, fetchBundles]); // Dependencies are stable or change meaningfully

  // Memoized Refresh Functions
  const refreshUsers = useCallback(async (options = { showToast: true }) => {
    if (!isAuthenticated) return;
    setUsersLoading(true);
    try { 
      const response = await axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true });
      setUsers(response.data); setUsersError(null);
      if (options.showToast) showSuccessToast('Users refreshed successfully');
    } catch (err) { 
      handleRefreshError(err, "Users", setUsersError, options);
    } finally { setUsersLoading(false); }
  }, [isAuthenticated, showSuccessToast, handleRefreshError]);

  const refreshPayments = useCallback(async (options = { showToast: true }) => {
    if (!isAuthenticated) return;
    setPaymentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments`, { withCredentials: true });
      setPayments(response.data); setPaymentsError(null);
      if (options.showToast) showSuccessToast('Payments refreshed successfully');
    } catch (err) {
      handleRefreshError(err, "Payments", setPaymentsError, options);
    } finally { setPaymentsLoading(false); }
  }, [isAuthenticated, showSuccessToast, handleRefreshError]);

  const refreshBundles = useCallback(async (options = { showToast: true }) => {
    if (!isAuthenticated) return;
    setBundlesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bundles`, { withCredentials: true });
      setBundles(response.data); setBundlesError(null);
      if (options.showToast) showSuccessToast('Bundles refreshed successfully');
    } catch (err) {
      handleRefreshError(err, "Bundles", setBundlesError, options);
    } finally { setBundlesLoading(false); }
  }, [isAuthenticated, showSuccessToast, handleRefreshError]);

  // Memoized CRUD Error Handler and CRUD operations
  const handleCrudError = useCallback((error, operationName, operationDisplayName) => {
    let messageForCaller = `Failed to ${operationDisplayName}.`;
    if (error.isAxiosError && !error.response) {
      showErrorToast(NETWORK_ERROR_TOAST_MESSAGE);
      messageForCaller = NETWORK_ERROR_TOAST_MESSAGE;
    } else if (error.response) {
      const serverMessage = error.response.data?.message || error.response.data;
      const toastMessage = typeof serverMessage === 'string' && serverMessage.length > 0 ? serverMessage : `Failed to ${operationDisplayName}.`;
      showErrorToast(toastMessage);
      messageForCaller = toastMessage;
    } else {
      const unexpectedErrorMsg = `An unexpected error occurred while trying to ${operationDisplayName}.`;
      showErrorToast(unexpectedErrorMsg);
      messageForCaller = unexpectedErrorMsg;
    }
    const throwError = new Error(messageForCaller);
    if (error.response?.data) throwError.data = error.response.data;
    throw throwError;
  }, [showErrorToast]); // Depends on stable showErrorToast

  const createBundle = useCallback(async (bundleData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/bundles`, bundleData, { withCredentials: true });
      await refreshBundles({ showToast: false }); 
      showSuccessToast('Bundle created successfully'); 
      return response.data;
    } catch (error) { 
      handleCrudError(error, "Create Bundle", "create bundle");
    }
  }, [isAuthenticated, refreshBundles, showSuccessToast, showErrorToast, handleCrudError]);

  // ... Apply useCallback to updateUser, deleteUser, createUser, etc. similarly ...
  // For brevity, I'll show one more and you can apply the pattern.

  const updateUser = useCallback(async (userId, userData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, userData, { withCredentials: true });
      await refreshUsers({ showToast: false }); 
      showSuccessToast('User updated successfully'); 
      return response.data;
    } catch (error) { 
      handleCrudError(error, "Update User", "update user");
    }
  }, [isAuthenticated, refreshUsers, showSuccessToast, showErrorToast, handleCrudError]);

  const deleteUser = useCallback(async (userId) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, { withCredentials: true });
      await refreshUsers({ showToast: false });
      showSuccessToast('User deleted successfully');
      return true;
    } catch (error) {
      handleCrudError(error, "Delete User", "delete user");
    }
  }, [isAuthenticated, refreshUsers, showSuccessToast, showErrorToast, handleCrudError]);
  
  const createUser = useCallback(async (userData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, userData, { withCredentials: true });
      await refreshUsers({ showToast: false });
      showSuccessToast('User created successfully');
      return response.data;
    } catch (error) {
      handleCrudError(error, "Create User", "create user");
    }
  }, [isAuthenticated, refreshUsers, showSuccessToast, showErrorToast, handleCrudError]);
  
  const deleteBundle = useCallback(async (bundleId, bundleName) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      await axios.delete(`${API_BASE_URL}/api/bundles/${bundleId}`, { withCredentials: true });
      await refreshBundles({ showToast: false });
      showSuccessToast(`Bundle "${bundleName}" deleted successfully`);
      return true;
    } catch (error) {
      handleCrudError(error, `Delete Bundle "${bundleName}"`, `delete bundle "${bundleName}"`);
    }
  }, [isAuthenticated, refreshBundles, showSuccessToast, showErrorToast, handleCrudError]);

  const updateBundle = useCallback(async (bundleId, bundleData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/bundles/${bundleId}`, bundleData, { withCredentials: true });
      await refreshBundles({ showToast: false });
      showSuccessToast('Bundle updated successfully');
      return response.data;
    } catch (error) {
      handleCrudError(error, "Update Bundle", "update bundle");
    }
  }, [isAuthenticated, refreshBundles, showSuccessToast, showErrorToast, handleCrudError]);

  const fetchUserById = useCallback(async (userId) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      const operationIdentifier = `Fetch User By ID (${userId})`;
      // Simplified error logging for fetchUserById as it often doesn't need a global toast
      console.error(`${operationIdentifier} error:`, error.response?.data || error.message);
      const throwError = new Error(error.response?.data?.message || error.message || `Failed to fetch user ${userId}`);
      if(error.response?.data) throwError.data = error.response.data;
      throw throwError;
    }
  }, [isAuthenticated, showErrorToast]);

  const updatePaymentStatus = useCallback(async (paymentId, paymentData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments/${paymentId}/process`, paymentData, { withCredentials: true });
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment status updated successfully');
      return response.data;
    } catch (error) {
      handleCrudError(error, "Update Payment Status", "update payment status");
    }
  }, [isAuthenticated, refreshPayments, showSuccessToast, showErrorToast, handleCrudError]);

  const updatePayment = useCallback(async (paymentId, paymentData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/payments/${paymentId}`, paymentData, { withCredentials: true });
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment updated successfully');
      return response.data;
    } catch (error) {
      handleCrudError(error, "Update Payment", "update payment");
    }
  }, [isAuthenticated, refreshPayments, showSuccessToast, showErrorToast, handleCrudError]);

  const createPayment = useCallback(async (paymentData) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments`, paymentData, { withCredentials: true });
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment created successfully');
      return response.data;
    } catch (error) {
      handleCrudError(error, "Create Payment", "create payment");
    }
  }, [isAuthenticated, refreshPayments, showSuccessToast, showErrorToast, handleCrudError]);

  const deletePayment = useCallback(async (paymentId) => {
    if (!isAuthenticated) { showErrorToast("Login required."); throw new Error("Login required"); }
    try {
      await axios.delete(`${API_BASE_URL}/api/payments/${paymentId}`, { withCredentials: true });
      await refreshPayments({ showToast: false });
      showSuccessToast('Payment deleted successfully');
      return true;
    } catch (error) {
      handleCrudError(error, "Delete Payment", "delete payment");
    }
  }, [isAuthenticated, refreshPayments, showSuccessToast, showErrorToast, handleCrudError]);


  return (
    <AppContext.Provider value={{
      isAuthenticated, currentUser, authLoading,
      loginUser, logoutUser, checkAuthStatus, changeAdminPassword,
      users, usersLoading, usersError, refreshUsers, createUser, updateUser, deleteUser, fetchUserById,
      payments, paymentsLoading, paymentsError, refreshPayments, updatePaymentStatus, updatePayment, createPayment, deletePayment,
      bundles, bundlesLoading, bundlesError, refreshBundles, createBundle, updateBundle, deleteBundle,
      showSuccessToast, showErrorToast, showWarningToast, showInfoToast,
      appSettings, updateAppSettings, appSettingsLoading, appSettingsError, refreshAppSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;