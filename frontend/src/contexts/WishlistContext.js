import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WishlistContext = createContext({});

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const lastUserIdRef = useRef(null);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlist(response.data.data.wishlist || []);
    } catch (error) {
      console.error('Erro ao buscar lista de desejos:', error);
      // Se erro 401, limpar wishlist
      if (error.response?.status === 401) {
        setWishlist([]);
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
        fetchWishlist();
      } else {
        setWishlist([]);
      }
    }
  }, [user, fetchWishlist]);

  const addToWishlist = async (productId) => {
    try {
      const response = await api.post('/wishlist', { productId });
      setWishlist(response.data.data.wishlist || []);
      toast.success('Adicionado à lista de desejos!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar à lista de desejos');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      setWishlist(response.data.data.wishlist || []);
      toast.success('Removido da lista de desejos!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao remover da lista de desejos');
    }
  };

  const clearWishlist = async () => {
    try {
      await api.delete('/wishlist/clear');
      setWishlist([]);
      toast.success('Lista de desejos limpa!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao limpar lista de desejos');
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || wishlist.length === 0) return false;
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      addToWishlist, 
      removeFromWishlist, 
      clearWishlist,
      isInWishlist,
      fetchWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
