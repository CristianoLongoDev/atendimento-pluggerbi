import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AuthUser,
  saveTokens,
  saveUser,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearTokens,
} from '@/lib/tokenStore';
import { API_BASE, ensureValidToken } from '@/lib/apiClient';

interface SessionCompat {
  access_token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: SessionCompat | null;
  profile: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const session: SessionCompat | null = user ? { access_token: getAccessToken()! } : null;

  const applyLogin = (accessToken: string, refreshToken: string, expiresIn: number, userData: AuthUser) => {
    saveTokens(accessToken, refreshToken, expiresIn);
    saveUser(userData);
    setUser(userData);
  };

  const loadSession = useCallback(async () => {
    const storedUser = getStoredUser();
    const token = getAccessToken();

    if (!storedUser || !token) {
      clearTokens();
      setUser(null);
      setLoading(false);
      return;
    }

    const validToken = await ensureValidToken();
    if (!validToken) {
      clearTokens();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${validToken}` },
      });

      if (!res.ok) {
        clearTokens();
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.status === 'success' && data.user) {
        const u: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          account_id: data.user.account_id,
          full_name: data.user.full_name,
          role: data.user.role,
        };
        saveUser(u);
        setUser(u);
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      setUser(storedUser);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        return { error: { message: data.message || data.error || 'Credenciais inválidas' } };
      }

      const userData: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        account_id: data.user.account_id,
        full_name: data.user.full_name,
        role: data.user.role,
      };

      applyLogin(data.access_token, data.refresh_token, data.expires_in, userData);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Erro de conexão' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      const accountId = crypto.randomUUID();

      const accountResponse = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: accountId, name: companyName }),
      });

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text();
        throw new Error(`Erro ao criar conta da empresa: ${accountResponse.status} ${errorText}`);
      }

      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role: 'admin',
          account_id: accountId,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok || registerData.status !== 'success') {
        return { error: { message: registerData.message || registerData.error || 'Erro ao criar usuário' } };
      }

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Erro ao criar conta. Verifique sua conexão e tente novamente.' } };
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }).catch(() => {});
      }
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    session,
    profile: user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
