import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('smart_light_token');
      const storedUser = localStorage.getItem('smart_light_user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('smart_light_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('smart_light_token', token);
    localStorage.setItem('smart_light_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone, role = 'citizen') => {
    const res = await api.post('/auth/register', { name, email, password, phone, role });
    const { token, user: userData } = res.data;
    localStorage.setItem('smart_light_token', token);
    localStorage.setItem('smart_light_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const updateProfile = async (name, email, phone) => {
    const res = await api.put('/auth/me', { name, email, phone });
    const { token, user: userData } = res.data;
    localStorage.setItem('smart_light_token', token);
    localStorage.setItem('smart_light_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('smart_light_token');
    localStorage.removeItem('smart_light_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
