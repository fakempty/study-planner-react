import { createContext } from 'react';
import type { AuthUser } from '../types/task';

export const AUTH_TOKEN_STORAGE_KEY = 'study_planner_access_token_v1';

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
