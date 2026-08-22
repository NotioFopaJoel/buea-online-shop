import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error responses so callers can just read error.message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    if (error.response?.status === 401) {
      // Token expired/invalid - clear it so the UI can redirect to login
      localStorage.removeItem('bos_token');
      localStorage.removeItem('bos_user');
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
