import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from './queryClient';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
  }, []);

  // Attach userId to all fetch requests via interceptor
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      // Only add auth headers to API requests and when authenticated
      if (typeof input === 'string' && input.startsWith('/api') && userId) {
        init = init || {};
        init.headers = {
          ...init.headers,
          'user-id': userId
        };
      }
      return originalFetch(input, init);
    };

    // Clean up interceptor
    return () => {
      window.fetch = originalFetch;
    };
  }, [userId]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // For our simple admin authentication, we check for hardcoded admin123 password
    if (username === 'admin' && password === 'admin123') {
      const newUserId = '1'; // Use a fixed admin ID
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
      setIsAuthenticated(true);
      
      // Invalidate all queries to refetch with new auth headers
      queryClient.invalidateQueries();
      
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    setIsAuthenticated(false);
    
    // Clear all query cache on logout
    queryClient.clear();
    
    setLocation('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}