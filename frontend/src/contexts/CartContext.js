import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const lastUserIdRef = useRef(null);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      // Se erro 401, limpar cart
      if (error.response?.status === 401) {
        setCart(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const currentUserId = user?._id || null;
    
    // Só fazer fetch se o usuário mudou
    if (currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      
      if (user) {
        fetchCart();
      } else {
        setCart(null);
      }
    }
  }, [user, fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      setCart(response.data.data);
      toast.success('Item adicionado ao carrinho!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar item');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(response.data.data);
      toast.success('Carrinho atualizado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar item');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      setCart(response.data.data);
      toast.success('Item removido do carrinho!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao remover item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
      toast.success('Carrinho limpo!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao limpar carrinho');
    }
  };

  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      itemCount,
      addItem, 
      updateItem, 
      removeItem, 
      clearCart,
      fetchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
