import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/signin', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/api/auth/signup', { name, email, password }),
};


// Predict API
export const predictApi = {
  predict: (formData: FormData) =>
    api.post('/api/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Analytics API
export const analyticsApi = {
  getMonthly: () => api.get('/api/analytics/monthly'),
  getYearly: () => api.get('/api/analytics/yearly'),
  getStats: () => api.get('/api/analytics/stats'),
  getRecent: () => api.get('/api/analytics/recent'),
  getdaily: () => api.get('/api/analytics/daily'),
};

// Alert API
export const alertApi = {
    sendEmail: (data: { pest_name: string; confidence: number; language?: string }) =>
      api.post('/api/alerts/email', data),
  };

export default api;
