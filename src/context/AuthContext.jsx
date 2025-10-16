import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      loadUserProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      const profile = await api.get('/Auth/profile', token);
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/Auth/login', { email, password });
      setToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, role, fullName) => {
    setLoading(true);
    try {
      const data = await api.post('/Auth/register', { email, password, role, fullName });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  // Helper function to check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Helper function to check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading,
      hasRole,
      hasAnyRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
