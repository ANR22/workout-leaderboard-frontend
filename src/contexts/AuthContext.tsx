import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  type AuthResponse,
  clearAuthToken,
  getAuthToken,
  loginUser,
  setAuthToken,
  signupUser,
} from '../api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const buildUserFromAuth = (
    response: AuthResponse,
    email: string,
    fallbackName: string
  ): User | null => {
    const resolvedUserId = Number(response.userId ?? response.id);
    if (!Number.isFinite(resolvedUserId) || resolvedUserId <= 0) {
      return null;
    }

    const resolvedName =
      response.fullName ||
      response.name ||
      fallbackName ||
      email.split('@')[0] ||
      'User';

    return {
      id: resolvedUserId,
      email,
      name: resolvedName,
    };
  };

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('leaderboard_user');
    const storedToken = getAuthToken();

    if (!storedToken && storedUser) {
      localStorage.removeItem('leaderboard_user');
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('leaderboard_user');
        clearAuthToken();
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await loginUser(email, password);
      const status = String(result.status || '').toUpperCase();
      const token = result.token || result.accessToken || result.jwt;
      const hasToken = Boolean(token);
      const hasUserId = Number.isFinite(Number(result.userId ?? result.id));
      const isStatusSuccess = ['SUCCESS', 'OK', 'TRUE'].includes(status);

      if ((isStatusSuccess || hasToken || hasUserId) && hasUserId) {
        const loggedInUser = buildUserFromAuth(result, email, 'User');
        if (!loggedInUser) {
          return {
            success: false,
            message: 'Invalid login response: userId is missing',
          };
        }

        if (token) {
          setAuthToken(token);
        }
        setUser(loggedInUser);
        localStorage.setItem('leaderboard_user', JSON.stringify(loggedInUser));
        return { success: true, message: result.message };
      }

      return {
        success: false,
        message: result.message || 'Email or password does not match',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Email or password does not match',
      };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await signupUser(name, email, password);
      const status = String(result.status || '').toUpperCase();
      const token = result.token || result.accessToken || result.jwt;
      const hasToken = Boolean(token);
      const hasUserId = Number.isFinite(Number(result.userId ?? result.id));
      const isStatusSuccess = ['SUCCESS', 'OK', 'TRUE'].includes(status);

      if ((isStatusSuccess || hasToken || hasUserId) && hasUserId) {
        const signedUpUser = buildUserFromAuth(result, email, name);
        if (!signedUpUser) {
          return {
            success: false,
            message: 'Invalid signup response: userId is missing',
          };
        }

        if (token) {
          setAuthToken(token);
        }
        setUser(signedUpUser);
        localStorage.setItem('leaderboard_user', JSON.stringify(signedUpUser));
        return { success: true, message: result.message };
      }

      return {
        success: false,
        message: result.message || 'Signup failed',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to create account',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('leaderboard_user');
    clearAuthToken();
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
