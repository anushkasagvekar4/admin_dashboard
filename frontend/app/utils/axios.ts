// utils/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (for client-side)
    if (typeof window !== 'undefined') {
      const authState = localStorage.getItem('persist:root');
      if (authState) {
        try {
          const parsed = JSON.parse(authState);
          if (parsed.auth && parsed.auth.token) {
            const token = JSON.parse(parsed.auth.token);
            if (token) {
              // Add to Authorization header
              config.headers.Authorization = `Bearer ${token}`;
              // Also add to withCredentials for cookies
              config.withCredentials = true;
            }
          }
        } catch (error) {
          console.error('Error parsing auth state:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:root');
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
