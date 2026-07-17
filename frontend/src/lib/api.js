import axios from 'axios';

const api = axios.create({
  // It MUST have process.env.NEXT_PUBLIC_API_URL here
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const activeUserId = localStorage.getItem('activeUserId');
    if (activeUserId) {
      config.headers['x-mock-user-id'] = activeUserId;
    }
  }
  return config;
});

export default api;