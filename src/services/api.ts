import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Instância para serviços legados que incluem "/api" nas chamadas
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('zelamapa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
