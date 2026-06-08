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
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', senha);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Email ou senha inválidos');
    }

    if (data.access_token) {
      setToken(data.access_token);
      
      // Como o login OAuth2 do FastAPI não retorna o objeto user,
      // buscamos o perfil do usuário logo em seguida
      const userResponse = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        useAuthStore.getState().login(data.access_token, userData);
        return {
          token: data.access_token,
          user: userData
        };
      }
      
      return {
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

export async function logout() {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.error('Erro ao realizar logout remoto:', error);
  } finally {
    clearToken();
    useAuthStore.getState().logout();
    // Opcional: redirecionar para landing
    window.location.href = '/';
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
