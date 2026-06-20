import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
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
    // Assuming the backend returns { success: true, data: {}, message: '' }
    if (response.data?.success) {
      // Unwrap the data and set it as the response data
      response.data = response.data.data;
      return response;
    }
    // If the response doesn't match the expected format, reject with an error
    return Promise.reject(new Error('Unexpected response format'));
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      const authStore = useAuthStore.getState();
      authStore.clearAuth();
      // Set session expired message
      authStore.setSessionExpired('Session expired. Please sign in again.');
    }
    return Promise.reject(error);
  }
);

export default api;