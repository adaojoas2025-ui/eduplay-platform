import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, loading, login, logout, register, updateUser } = useAuthStore();

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isBuyer = () => hasRole('BUYER');
  const isSeller = () => hasRole('SELLER');
  const isAdmin = () => hasRole('ADMIN');

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateUser,
    hasRole,
    isBuyer,
    isSeller,
    isAdmin,
  };
};
