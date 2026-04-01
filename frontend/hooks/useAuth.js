'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  getCompany,
  getToken,
  isAuthenticated as authIsAuthenticated,
  logout as clearAuth,
  saveCompany,
  saveToken,
} from '@/lib/auth';

/**
 * Manage company authentication state and auth API calls.
 */
export function useAuth() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(getToken() || '');
    setCompany(getCompany());
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveToken(response.api_token);
      saveCompany(response.company);
      setToken(response.api_token);
      setCompany(response.company);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur de connexion.',
      };
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      saveToken(response.api_token);
      saveCompany(response.company);
      setToken(response.api_token);
      setCompany(response.company);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la création du compte.',
      };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Always clear local session even if API logout fails.
    } finally {
      clearAuth();
      setToken('');
      setCompany(null);
      router.push('/login');
    }
  };

  return {
    company,
    token,
    loading,
    isAuthenticated: Boolean(token) || authIsAuthenticated(),
    login,
    register,
    logout,
  };
}
