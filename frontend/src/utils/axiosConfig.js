import axios from 'axios';

// Set base URL from environment variable
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Configure axios to include credentials in requests
axios.defaults.withCredentials = true;

// Add a request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors by logging out
    if (error.response && error.response.status === 401) {
      // We don't log out here to avoid circular dependencies
      // This is handled in the AuthContext
    }
    return Promise.reject(error);
  }
);

export default axios;
