import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { IUser, IGym } from '@gym-saas/types';
import api, { setAccessToken } from '@/lib/api';

interface AuthState {
  user: IUser | null;
  gym: IGym | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateGym: (gym: IGym) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    gym: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshAuth = useCallback(async () => {
    try {
      const res = await api.post('/auth/refresh');
      const { user, gym, accessToken } = res.data.data;
      setAccessToken(accessToken);
      setState({
        user,
        gym,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setAccessToken(null);
      setState({
        user: null,
        gym: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, gym, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setState({
      user,
      gym,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { user, gym, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setState({
      user,
      gym,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors on logout
    }
    setAccessToken(null);
    setState({
      user: null,
      gym: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateGym = (gym: IGym) => {
    setState((prev) => ({ ...prev, gym }));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshAuth, updateGym }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
