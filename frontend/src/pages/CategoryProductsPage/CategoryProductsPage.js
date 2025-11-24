import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './CategoryProductsPage.css';

const CategoryProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = searchParams.get('category');

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchCategoryAndProducts = async () => {
      if (!categoryId) {
        navigate('/categories');
        return;
      }

      setLoading(true);
      
      try {
        // Buscar informações da categoria
        const categoryResponse = await api.get(`/categories/${categoryId}`, {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        setCategory(categoryResponse.data.data.category);

        // Buscar produtos da categoria
        const productsResponse = await api.get(`/products?categoryId=${categoryId}&limit=100`, {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        setProducts(productsResponse.data.data.products || []);
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Erro ao carregar produtos da categoria:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryAndProducts();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [categoryId, navigate]);

  if (loading) {
    return (
      <div className="category-products-page">
        <div className="container">
          <div className="loading-spinner">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-products-page">
      <div className="container">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/categories')}>
            ← Voltar para categorias
          </button>
          <h1>{category?.name || 'Produtos'}</h1>
          {category?.description && (
            <p className="category-description">{category.description}</p>
          )}
        </div>
        
        {products.length === 0 ? (
          <div className="no-products">
            <h2>Nenhum produto encontrado</h2>
            <p>Esta categoria ainda não possui produtos disponíveis.</p>
          </div>
        ) : (
          <>
            <div className="products-count">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </div>
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
