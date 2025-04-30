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
        console.log('Users API Response:', response.data);
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

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/payments");
        console.log('Payments API Response:', response.data);
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

useEffect(() => {
  const fetchBundles = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/bundles");
      console.log('Bundles API Response:', response.data); // Add for debugging
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
  console.log(bundles);
// eslint-disable-next-line react-hooks/exhaustive-deps
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

  const createBundle = async (bundleData) => {
    try {
      await axios.post("http://localhost:8080/api/bundles", bundleData);
      await refreshBundles();
    } catch (error) {
      throw error.response?.data || error;
    }
  };
  
  const updateBundle = async (bundleId, bundleData) => {
    try {
      await axios.put(`http://localhost:8080/api/bundles/${bundleId}`, bundleData);
      await refreshBundles();
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Add these to your AppContext provider value
const createUser = async (userData) => {
  try {
    await axios.post("http://localhost:8080/api/users", userData);
    await refreshUsers();
  } catch (error) {
    throw error.response?.data || error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    await axios.put(`http://localhost:8080/api/users/${userId}`, userData);
    await refreshUsers();
  } catch (error) {
    throw error.response?.data || error;
  }
};

const fetchUserById = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
const updatePaymentStatus = async (paymentId, paymentData) => {
  try {
    // Change to POST request for processPayment endpoint
    await axios.post(`http://localhost:8080/api/payments/${paymentId}/process`, paymentData);
    await refreshPayments();
  } catch (error) {
    throw error.response?.data || error;
  }
};

const updatePayment = async (paymentId, paymentData) => {
  try {
    await axios.put(`http://localhost:8080/api/payments/${paymentId}`, paymentData);
    await refreshPayments();
  } catch (error) {
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