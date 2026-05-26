import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/register', userData);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      verifyEmail: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/verify-email', { email, code });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Verification failed';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Calling login API:', `${API_URL}/api/auth/login`);
          
          const response = await api.post('/api/auth/login', { email, password });
          
          console.log('Login response:', response.data);
          
          // Get user data
          const userResponse = await api.get('/api/auth/me');
          
          set({
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return userResponse.data;
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.detail || 'Login failed';
          set({ error: errorMessage, isLoading: false, isAuthenticated: false });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/forgot-password', { email });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Failed to send reset email';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      resetPassword: async (token, new_password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/reset-password', { token, new_password });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;