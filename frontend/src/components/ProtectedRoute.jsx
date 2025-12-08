import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  console.log('ProtectedRoute - Token:', token ? 'exists' : 'missing');
  console.log('ProtectedRoute - User:', user ? 'exists' : 'missing');
  console.log('ProtectedRoute - Current location:', location.pathname);

  // If not authenticated, redirect to login with return URL
  if (!token || !user) {
    console.log('Not authenticated, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('Authenticated, allowing access');
  return children;
}
