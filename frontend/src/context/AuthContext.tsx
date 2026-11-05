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
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  organizationId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<string>;
  logout: () => void;
  refreshAuthToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('gatekeeper_access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('gatekeeper_refresh_token'));

  const decodedPayload = useMemo(() => {
    if (!accessToken) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      if (decoded.exp * 1000 < Date.now()) {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }, [accessToken]);

  const role = decodedPayload?.role || null;
  const username = decodedPayload?.sub || null;
  const organizationId = decodedPayload?.organizationId || null;
  const isAuthenticated = !!accessToken && !!decodedPayload;

  const login = async (credentials: { username: string; password: string }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.post(`${baseUrl}/auth/login`, credentials);
    const data = response.data;

    localStorage.setItem('gatekeeper_access_token', data.accessToken);
    localStorage.setItem('gatekeeper_refresh_token', data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    return decodedPayload?.role || data.role;
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const currentRefresh = localStorage.getItem('gatekeeper_refresh_token');
      if (!currentRefresh) return false;

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken: currentRefresh });
      const data = response.data;

      localStorage.setItem('gatekeeper_access_token', data.accessToken);
      localStorage.setItem('gatekeeper_refresh_token', data.refreshToken);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const logout = async () => {
    try {
      const currentRefresh = localStorage.getItem('gatekeeper_refresh_token');
      if (currentRefresh) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        await axios.post(`${baseUrl}/auth/logout`, { refreshToken: currentRefresh });
      }
      
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      localStorage.removeItem('gatekeeper_access_token');
      localStorage.removeItem('gatekeeper_refresh_token');
      setAccessToken(null);
      setRefreshToken(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, role, organizationId, username, isAuthenticated, login, logout, refreshAuthToken }}>
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