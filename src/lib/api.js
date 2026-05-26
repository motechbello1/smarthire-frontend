import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await api.post('/api/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  
  verifyEmail: (data) => api.post('/api/auth/verify-email', data),
  
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
  
  login: (data) => api.post('/api/auth/login', data),
  
  logout: () => api.post('/api/auth/logout'),
  
  getCurrentUser: () => api.get('/api/auth/me'),
  
  requestPasswordReset: (email) => api.post('/api/auth/password-reset-request', { email }),
  
  resetPassword: (data) => api.post('/api/auth/password-reset', data),
  
  refreshToken: () => api.post('/api/auth/refresh'),
};

export default api;
