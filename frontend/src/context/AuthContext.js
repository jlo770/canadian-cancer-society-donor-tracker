import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);
  
  // Session timeout settings (in milliseconds)
  const SESSION_TIMEOUT = process.env.REACT_APP_SESSION_TIMEOUT || 30 * 60 * 1000; // 30 minutes by default
  const SESSION_WARNING_BEFORE = process.env.REACT_APP_SESSION_WARNING || 5 * 60 * 1000; // 5 minutes before timeout by default (5 minutes before expiry)
  const WARNING_BEFORE_TIMEOUT = SESSION_WARNING_BEFORE;

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    if (currentUser) {
      // Set timeout to show warning
      const warningTimeout = setTimeout(() => {
        setSessionTimeoutWarning(true);
      }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT);
      
      // Set timeout to logout
      const logoutTimeout = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
      
      setSessionTimeout(logoutTimeout);
      
      return () => {
        clearTimeout(warningTimeout);
        clearTimeout(logoutTimeout);
      };
    }
  }, [currentUser, sessionTimeout]);

  // Setup event listeners for user activity
  useEffect(() => {
    const handleUserActivity = () => {
      if (currentUser) {
        setSessionTimeoutWarning(false);
        resetSessionTimeout();
      }
    };
    
    // Events to track user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [currentUser, resetSessionTimeout]);

  // Setup axios interceptors for handling token and errors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized errors (token expired)
        if (error.response && error.response.status === 401 && currentUser) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      // Remove interceptors when component unmounts
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [currentUser]);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/user');
          setCurrentUser(response.data);
          resetSessionTimeout();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [resetSessionTimeout]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      resetSessionTimeout();
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setSessionTimeoutWarning(false);
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed');
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      throw err;
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await axios.put('/api/users/profile', userData);
      setCurrentUser({
        ...currentUser,
        ...response.data
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await axios.get('/api/auth/user');
      setCurrentUser(response.data);
      return response.data;
    } catch (err) {
      console.error('User data refresh failed:', err);
      throw err;
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const extendSession = () => {
    setSessionTimeoutWarning(false);
    resetSessionTimeout();
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUserProfile,
    refreshUserData,
    sessionTimeoutWarning,
    extendSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
