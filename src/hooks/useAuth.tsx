import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { AuthService } from '../services/apiService';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = AuthService.getToken();
    if (existingToken) {
      setToken(existingToken);
      // You might want to verify the token and get user info here
      // For now, we'll just set loading to false
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email });
      const response = await AuthService.login(email, password);
      console.log('Login response:', response);
      
      setToken(response.tokens?.access || AuthService.getToken());
      
      // If user data is not in the response, create a basic user object
      if (response.user) {
        setUser(response.user);
      } else {
        // Create a basic user object from email
        setUser({
          id: 'temp-id',
          email: email,
          first_name: email.split('@')[0],
          last_name: '',
          is_verified: true,
          date_joined: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register(userData);
      // Handle registration response
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshToken = async () => {
    try {
      const response = await AuthService.refreshToken();
      setToken(response.access || AuthService.getToken());
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};