'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  getCompany,
  getMember,
  isAuthenticated as authIsAuthenticated,
  logout as clearAuth,
  saveCompany,
  saveToken,
} from '@/lib/auth';

/**
 * Manage company authentication state and auth API calls.
 * The JWT token lives in an HttpOnly cookie — JS never reads it directly.
 */
export function useAuth() {
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCompany(getCompany());
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveToken();
      saveCompany(response.company);
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

      saveToken();
      saveCompany(response.company);
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
    const isMember = !!getMember();
    try {
      await apiFetch(isMember ? '/member/logout' : '/auth/logout', { method: 'POST' });
    } catch {
      // Always clear local session even if API logout fails.
    } finally {
      clearAuth();
      setCompany(null);
      router.push(isMember ? '/member/login' : '/login');
    }
  };

  return {
    company,
    loading,
    isAuthenticated: Boolean(company) || authIsAuthenticated(),
    login,
    register,
    logout,
  };
}
