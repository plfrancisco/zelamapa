import axios from 'axios'

// Em produção (Vercel), defina VITE_API_URL nas variáveis de ambiente.
// Ex: https://zelamapa-backend.vercel.app
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zelamapa_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: trata 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zelamapa_token')
      // window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
