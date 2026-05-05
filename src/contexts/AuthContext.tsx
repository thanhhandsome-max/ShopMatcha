'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  maKH?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; message: string }>;
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
    const storedToken = localStorage.getItem('htdcha-token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('htdcha-user');
        localStorage.removeItem('htdcha-token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const newUser = {
          id: data.data.user.MaTaiKhoan,
          email: data.data.user.TenDangNhap,
          name: data.data.user.TenKH || email,
          role: data.data.user.role,
          maKH: data.data.user.MaKH,
        };
        
        setUser(newUser);
        localStorage.setItem('htdcha-user', JSON.stringify(newUser));
        localStorage.setItem('htdcha-token', data.data.accessToken);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Lỗi kết nối server' };
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          confirmPassword: password, 
          fullName,
          phone 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newUser = {
          id: data.data.user.MaTaiKhoan,
          email: data.data.user.TenDangNhap,
          name: data.data.user.TenKH || fullName,
          role: data.data.user.role,
          maKH: data.data.user.MaKH,
        };
        
        setUser(newUser);
        localStorage.setItem('htdcha-user', JSON.stringify(newUser));
        localStorage.setItem('htdcha-token', data.data.accessToken);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Lỗi kết nối server' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('htdcha-user');
    localStorage.removeItem('htdcha-token');
    
    // Call logout API
    fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(err => console.error('Logout API error:', err));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
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
