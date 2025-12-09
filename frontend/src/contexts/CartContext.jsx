import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api.config';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Carregar carrinho ao montar o componente
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchCart();
    }
  }, []);

  // Buscar carrinho do backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cart`, {
        headers: getAuthHeaders(),
      });
      setCart(response.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        setCart({ items: [], total: 0, count: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item ao carrinho
  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Você precisa estar logado para adicionar itens ao carrinho');
        window.location.href = '/login';
        return;
      }

      setLoading(true);
      await axios.post(
        `${API_URL}/cart`,
        { productId, quantity },
        { headers: getAuthHeaders() }
      );
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar ao carrinho');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade de um item
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/cart/${productId}`,
        { quantity },
        { headers: getAuthHeaders() }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar quantidade');
    } finally {
      setLoading(false);
    }
  };

  // Remover item do carrinho
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/cart/${productId}`, {
        headers: getAuthHeaders(),
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert(error.response?.data?.message || 'Erro ao remover do carrinho');
    } finally {
      setLoading(false);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/cart`, {
        headers: getAuthHeaders(),
      });
      setCart({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert(error.response?.data?.message || 'Erro ao limpar carrinho');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
