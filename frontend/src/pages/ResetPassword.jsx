import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api.config';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperacao invalido ou ausente.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validations
    if (password.length < 8) {
      setError('A senha deve ter no minimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    // Check password strength
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError('A senha deve conter pelo menos uma letra maiuscula, uma minuscula e um numero.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password,
      });

      setMessage('Senha redefinida com sucesso! Redirecionando para o login...');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      const errorMsg = err.response?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <span className="text-6xl">⚠️</span>
          <h1 className="text-2xl font-bold mt-4 text-gray-800">Link Invalido</h1>
          <p className="text-gray-600 mt-2">
            O link de recuperacao de senha e invalido ou expirou.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Redefinir Senha</h1>
        <p className="text-gray-600 mb-6">Digite sua nova senha abaixo.</p>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Nova Senha:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none pr-12"
                placeholder="Digite sua nova senha"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimo 8 caracteres com maiuscula, minuscula e numero
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Confirmar Senha:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              placeholder="Confirme sua nova senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>

        <Link to="/login" className="text-purple-600 hover:underline mt-4 inline-block">
          ← Voltar para Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
