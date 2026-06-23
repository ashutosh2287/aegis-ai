import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to unwrap data
api.interceptors.response.use(
  (response) => {
    // If the backend wraps in { success, data }, unwrap it
    if (response.data?.success && response.data?.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState();
      // Only clear if we actually have a token (not on login page)
      if (authStore.token) {
        authStore.clearAuth();
        authStore.setSessionExpired('Session expired. Please sign in again.');
      }
      return Promise.reject(error);
    }

    // Surface friendly error messages for common HTTP errors
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      if (status === 403) {
        return Promise.reject(new Error(serverMessage || 'You do not have permission to perform this action.'));
      }
      if (status === 404) {
        return Promise.reject(new Error(serverMessage || 'The requested resource was not found.'));
      }
      if (status === 409) {
        return Promise.reject(new Error(serverMessage || 'A conflict occurred. The resource may already exist.'));
      }
      if (status === 422) {
        return Promise.reject(new Error(serverMessage || 'Invalid data provided. Please check your input.'));
      }
      if (status === 429) {
        return Promise.reject(new Error(serverMessage || 'Too many requests. Please wait a moment and try again.'));
      }
      if (status >= 500) {
        return Promise.reject(new Error(serverMessage || 'A server error occurred. Please try again later.'));
      }

      // For other HTTP errors, use server message or generic fallback
      return Promise.reject(new Error(serverMessage || `Request failed with status ${status}`));
    }

    // Network errors (no response received at all)
    if (error.request && !error.response) {
      return Promise.reject(new Error('Unable to connect to the server. Please ensure the backend is running and try again.'));
    }

    return Promise.reject(error);
  }
);

export default api;