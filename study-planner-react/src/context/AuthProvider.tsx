import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { httpClient } from '../api/httpClient';
import type { AuthUser } from '../types/task';
import { AUTH_TOKEN_STORAGE_KEY, AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';

interface LoginApiResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken?: string;
  token?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const loginData = await httpClient<LoginApiResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });

    const token = loginData.accessToken ?? loginData.token ?? '';
    if (!token) {
      throw new Error('Сервер не повернув accessToken.');
    }

    const meData = await httpClient<AuthUser>('/auth/me', {
      method: 'GET',
      token,
    });

    try {
      window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } catch {
      // Ігноруємо помилки sessionStorage
    }

    setAccessToken(token);
    setUser(meData);
  }, []);

  const logout = useCallback(() => {
    try {
      window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // Ігноруємо помилки sessionStorage
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
    }),
    [user, accessToken, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
