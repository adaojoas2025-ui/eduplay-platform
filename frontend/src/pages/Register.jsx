import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { auth } from '../utils/auth';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    role: 'BUYER', // Default role
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Use sistema de auth simplificado
      auth.login(user, accessToken, refreshToken);

      toast.success('Conta criada com sucesso!');

      // Navbar vai detectar via polling - sem reload necessário
      console.log('✅ Registro completo - Navbar atualizará automaticamente');
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Criar Conta</h1>
          <p className="text-gray-600">Comece sua jornada na EDUPLAY</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Mínimo 8 caracteres"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Deve conter maiúscula, minúscula e número
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tipo de Conta</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="BUYER">Comprador</option>
              <option value="PRODUCER">Vendedor</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'PRODUCER'
                ? 'Como vendedor, você poderá criar e vender produtos digitais'
                : 'Como comprador, você poderá adquirir produtos digitais'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className="input-field"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Telefone (opcional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
