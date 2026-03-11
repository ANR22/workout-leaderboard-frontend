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
    if (!response.userId || !response.fullName) {
      return null;
    }

    return {
      id: response.userId,
      email,
      name: response.fullName || fallbackName,
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

      if (result.status === 'SUCCESS' && result.token) {
        const loggedInUser = buildUserFromAuth(result, email, 'User');
        if (!loggedInUser) {
          return {
            success: false,
            message: 'Invalid login response: userId/fullName missing',
          };
        }

        setAuthToken(result.token);
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

      if (result.status === 'SUCCESS' && result.token) {
        const signedUpUser = buildUserFromAuth(result, email, name);
        if (!signedUpUser) {
          return {
            success: false,
            message: 'Invalid signup response: userId/fullName missing',
          };
        }

        setAuthToken(result.token);
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
