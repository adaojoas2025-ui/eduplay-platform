import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import useStore from '../store/useStore';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();

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
      const response = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Set tokens in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update Zustand store (persist middleware will handle localStorage)
      setUser(user);

      console.log('Login successful - User role:', user.role);
      toast.success('Login realizado com sucesso!');

      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo de volta!</h1>
          <p className="text-gray-600">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
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
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Credenciais de Teste:</p>
          <p className="text-xs text-yellow-700">
            <strong>Admin:</strong> admin@eduplay.com.br / admin123
          </p>
          <p className="text-xs text-yellow-700">
            <strong>Usuário:</strong> teste@exemplo.com / Senha123
          </p>
        </div>
      </div>
    </div>
  );
}
