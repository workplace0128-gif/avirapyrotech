import axios from 'axios';

// In production (Vercel), VITE_API_URL = https://your-backend.railway.app/api
// In development, it falls back to '/api' which vite.config.js proxies to localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout: 15 seconds — prevents requests hanging under high traffic
  timeout: 15000,
});


// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global 401 (Unauthorized) handling + timeout messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // If we aren't already on the login page, redirect
      if (!window.location.pathname.endsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    // Friendly message for timeout / network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.warn('[API] Server is busy or unreachable. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
