#!/bin/bash

# This script creates all the remaining page files for the EDUPLAY frontend

cd /c/projetos/frontend/src/pages

# Create a comprehensive Login page
cat > public/Login.jsx << 'EOF'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/marketplace');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Bem-vindo de volta!</h1>
          <p className="auth-subtitle">Entre com sua conta</p>

          <form onSubmit={handleSubmit} className="auth-form">
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
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
EOF

# Create Register page
cat > public/Register.jsx << 'EOF'
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
EOF

# Create Auth.css for login and register pages
cat > public/Auth.css << 'EOF'
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-card {
  background: white;
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.5rem;
  text-align: center;
}

.auth-subtitle {
  color: #718096;
  text-align: center;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
}

.w-full {
  width: 100%;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #718096;
}

.auth-footer a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
EOF

echo "Login and Register pages created successfully!"
