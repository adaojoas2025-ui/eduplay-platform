import { Navigate, Outlet } from 'react-router-dom';
import useStore from '../store/useStore';

export default function PrivateRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
