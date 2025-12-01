import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Fazer login automático
      await login(formData.email, formData.password);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h1>🎮 Criar Conta</h1>
          <p className="register-subtitle">Junte-se a nós!</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Seu nome"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Digite a senha novamente"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="register-footer">
            <p>Já tem uma conta? <Link to="/login">Entrar</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
