import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Limpar dados corrompidos
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      const userData = data.user;
      
      if (!userData || !token) {
        throw new Error('Dados de autenticação inválidos');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, data } = response.data;
      const newUser = data.user;
      
      if (!newUser || !token) {
        throw new Error('Dados de registro inválidos');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast.success('Cadastro realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer cadastro');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logout realizado com sucesso!');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
