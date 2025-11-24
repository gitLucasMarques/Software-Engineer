import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put('/auth/update-me', formData);
      const updatedUser = response.data.data.user;
      
      // Atualizar usuário no localStorage e contexto
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Recarregar a página para atualizar o contexto
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    // Validação de senha forte
    if (passwordData.newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword);

    if (!hasUpperCase) {
      toast.error('A senha deve conter pelo menos uma letra maiúscula');
      return;
    }

    if (!hasLowerCase) {
      toast.error('A senha deve conter pelo menos uma letra minúscula');
      return;
    }

    if (!hasNumber) {
      toast.error('A senha deve conter pelo menos um número');
      return;
    }

    if (!hasSpecialChar) {
      toast.error('A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
      return;
    }

    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Senha atualizada com sucesso!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar senha');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-spinner">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>👤 Meu Perfil</h1>

        <div className="profile-content">
          <div className="profile-card">
            <h2>Informações Pessoais</h2>

            {!isEditing ? (
              <>
                <div className="profile-info">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Nome</span>
                    <span className="profile-info-value">{user.name}</span>
                  </div>
                  
                  <div className="profile-info-item">
                    <span className="profile-info-label">E-mail</span>
                    <span className="profile-info-value">{user.email}</span>
                  </div>
                  
                  <div className="profile-info-item">
                    <span className="profile-info-label">Telefone</span>
                    <span className="profile-info-value">
                      {user.phone || 'Não informado'}
                    </span>
                  </div>
                  
                  <div className="profile-info-item">
                    <span className="profile-info-label">Endereço</span>
                    <span className="profile-info-value">
                      {user.address || 'Não informado'}
                    </span>
                  </div>

                  <div className="profile-info-item">
                    <span className="profile-info-label">Tipo de Conta</span>
                    <span className="profile-info-value">
                      {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button 
                    className="btn-edit-profile"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Editar Perfil
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    O e-mail não pode ser alterado
                  </small>
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="form-group">
                  <label>Endereço</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua, número, complemento, bairro, cidade, estado"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    💾 Salvar Alterações
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCancelEdit}
                  >
                    ✖️ Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="profile-card">
            <h2>Segurança</h2>

            {!isChangingPassword ? (
              <div className="profile-actions">
                <button 
                  className="btn-edit-profile btn-change-password"
                  onClick={() => setIsChangingPassword(true)}
                >
                  🔒 Alterar Senha
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="password-form">
                <div className="form-group">
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <div className="password-requirements">
                    <small>A senha deve conter:</small>
                    <ul>
                      <li>Mínimo de 8 caracteres</li>
                      <li>Pelo menos 1 letra maiúscula (A-Z)</li>
                      <li>Pelo menos 1 letra minúscula (a-z)</li>
                      <li>Pelo menos 1 número (0-9)</li>
                      <li>Pelo menos 1 caractere especial (!@#$%^&*...)</li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    💾 Atualizar Senha
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCancelPassword}
                  >
                    ✖️ Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
