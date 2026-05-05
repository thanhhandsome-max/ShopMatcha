'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('htdcha-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
    };
    setUser(newUser);
    localStorage.setItem('htdcha-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('htdcha-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
