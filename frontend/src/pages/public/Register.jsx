import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast.success('Cadastro realizado com sucesso!');
      navigate('/marketplace');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer cadastro');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Criar Conta</h1>
          <p className="auth-subtitle">Comece sua jornada conosco</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                className="input-field"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="auth-footer">
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
