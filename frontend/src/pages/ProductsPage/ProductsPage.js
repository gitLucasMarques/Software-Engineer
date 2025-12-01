import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  // Função auxiliar para extrair ID da categoria
  const getCategoryId = (categoryId) => {
    if (!categoryId) return null;
    return typeof categoryId === 'object' ? categoryId._id : categoryId;
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchCategories = async () => {
      try {
        // Buscar categoria principal "Jogos"
        const mainCatsResponse = await api.get('/api/categories?onlyMain=true', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        const mainCategories = mainCatsResponse.data.data.categories || [];
        const jogosCategory = mainCategories.find(cat => cat.name === 'Jogos');
        
        if (jogosCategory) {
          // Buscar subcategorias de Jogos
          const subcatsResponse = await api.get(`/categories/${jogosCategory._id}/subcategories`, {
            signal: abortController.signal
          });
          
          if (!isMounted) return;
          
          setCategories(subcatsResponse.data.data.categories || []);
        }
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchProducts = async () => {
      if (isMounted) setLoading(true);
      
      try {
        // Buscar categoria principal "Jogos"
        const mainCatsResponse = await api.get('/api/categories?onlyMain=true', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        const mainCategories = mainCatsResponse.data.data.categories || [];
        const jogosCategory = mainCategories.find(cat => cat.name === 'Jogos');
        
        if (!jogosCategory) {
          if (isMounted) setLoading(false);
          return;
        }

        // Buscar subcategorias de Jogos
        const subcatsResponse = await api.get(`/categories/${jogosCategory._id}/subcategories`, {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        const subcategories = subcatsResponse.data.data.categories || [];
        const subcatIds = subcategories.map(sub => sub._id);

        // Se há filtro de categoria, buscar apenas dessa categoria
        if (categoryFilter) {
          const productsResponse = await api.get(`/products?categoryId=${categoryFilter}&limit=100`, {
            signal: abortController.signal
          });
          
          if (!isMounted) return;
          
          if (isMounted) setProducts(productsResponse.data.data.products || []);
        } else {
          // Sem filtro: buscar todos os produtos de todas as subcategorias de Jogos
          const productsResponse = await api.get('/api/products?limit=100', {
            signal: abortController.signal
          });
          
          if (!isMounted) return;
          
          const allProducts = productsResponse.data.data.products || [];
          
          // Filtrar apenas jogos (produtos cujo categoryId está nas subcategorias de Jogos)
          const games = allProducts.filter(product => {
            const catId = getCategoryId(product.categoryId);
            return catId && subcatIds.includes(catId);
          });
          
          if (isMounted) setProducts(games);
        }
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Erro ao carregar produtos:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [categoryFilter]);

  return (
    <div className="products-page">
      <div className="container">
        <h1>Catálogo de Jogos</h1>
        
        <div className="filters">
          <button 
            className={`filter-btn ${!categoryFilter ? 'active' : ''}`}
            onClick={() => setSearchParams({})}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              className={`filter-btn ${categoryFilter === category._id ? 'active' : ''}`}
              onClick={() => setSearchParams({ category: category._id })}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="loading-spinner">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <h2>Nenhum jogo encontrado</h2>
            <p>Tente ajustar os filtros ou volte mais tarde.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
