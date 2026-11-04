import React, { createContext, useContext, useState, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  role: string;
  organizationId?: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  role: string | null;
  organizationId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gatekeeper_token'));

  const decodedPayload = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('gatekeeper_token');
        return null;
      }
      return decoded;
    } catch {
      localStorage.removeItem('gatekeeper_token');
      return null;
    }
  }, [token]);

  const role = decodedPayload?.role || null;
  const username = decodedPayload?.sub || null;
  const organizationId = decodedPayload?.organizationId || null;
  const isAuthenticated = !!token && !!decodedPayload;

  const login = async (credentials: { username: string; password: string }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.post(`${baseUrl}/auth/login`, credentials);
    const data = response.data;

    localStorage.setItem('gatekeeper_token', data.token);
    setToken(data.token);

    try {
      const decoded = jwtDecode<JwtPayload>(data.token);
      return decoded.role;
    } catch {
      return data.role;
    }
  };

  const logout = () => {
    localStorage.removeItem('gatekeeper_token');
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, role, organizationId, username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};