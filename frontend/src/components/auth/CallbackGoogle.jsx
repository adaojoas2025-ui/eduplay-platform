import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function CallbackGoogle() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    console.log('Google OAuth callback received:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      error
    });

    if (error) {
      console.error('OAuth error:', error);
      setStatus('error');
      setTimeout(() => {
        navigate('/login?error=auth_failed');
      }, 2000);
      return;
    }

    if (token && refreshToken) {
      try {
        // Save tokens to localStorage with correct keys
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        console.log('Tokens saved to localStorage');

        // Fetch user data with the token
        fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => {
            console.log('User fetch response status:', res.status);
            return res.json();
          })
          .then(data => {
            console.log('User data received:', data);

            if (data.success && data.data) {
              // Save user data to localStorage
              localStorage.setItem('user', JSON.stringify(data.data));
              setStatus('success');

              console.log('Login successful, redirecting to homepage');

              // Redirect to homepage after successful login
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            } else {
              throw new Error('Failed to fetch user data');
            }
          })
          .catch(err => {
            console.error('Error fetching user:', err);
            setStatus('error');
            setTimeout(() => {
              navigate('/login?error=user_fetch_failed');
            }, 2000);
          });
      } catch (err) {
        console.error('Error saving tokens:', err);
        setStatus('error');
        setTimeout(() => {
          navigate('/login?error=storage_failed');
        }, 2000);
      }
    } else {
      console.error('Missing token or refreshToken in callback URL');
      setStatus('error');
      setTimeout(() => {
        navigate('/login?error=missing_token');
      }, 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processando...</h2>
            <p className="text-gray-600">Autenticando com Google</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sucesso!</h2>
            <p className="text-gray-600">Login realizado com sucesso. Redirecionando...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-gray-600">Falha na autenticação. Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
}
