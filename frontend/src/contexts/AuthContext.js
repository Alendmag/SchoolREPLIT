import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Ensure HTTPS is used - dynamically construct URL to avoid mixed content issues
const getApiUrl = () => {
  // Use environment variable if available
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl) {
    // Ensure HTTPS
    return envUrl.replace('http://', 'https://');
  }
  // Fallback to current origin
  return window.location.origin;
};

const API_URL = getApiUrl();

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token, checkAuth]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('auth_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { access_token, user: newUser } = response.data;
    localStorage.setItem('auth_token', access_token);
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const processGoogleSession = async (sessionId) => {
    const response = await api.post('/auth/google-session', {}, {
      headers: { 'X-Session-ID': sessionId }
    });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('auth_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    loginWithGoogle,
    processGoogleSession,
    logout,
    checkAuth,
    api,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isSchoolAdmin: user?.role === 'school_admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent',
    isAccountant: user?.role === 'accountant',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
