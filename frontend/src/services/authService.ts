/**
 * Serviço de autenticação — lida com login, logout, token storage
 */
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'zelamapa_token';

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, senha: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Email ou senha inválidos');
    }

    if (data.success && data.access_token) {
      setToken(data.access_token);
      
      // ATUALIZAR STORE GLOBAL
      useAuthStore.getState().login(data.access_token, data.user);
      
      return {
        user: data.user,
        token: data.access_token,
      };
    }

    throw new Error('Resposta inválida do servidor');
  } catch (error: any) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) throw new Error('Não autenticado');

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Erro ao obter usuário');

    // Sincronizar store se necessário
    if (data.user) {
      useAuthStore.getState().setUser(data.user);
    }

    return data.user;
  } catch (error: any) {
    clearToken();
    useAuthStore.getState().logout();
    throw error;
  }
}

export function logout(): void {
  clearToken();
  useAuthStore.getState().logout();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
