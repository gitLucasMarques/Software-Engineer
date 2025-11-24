import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './SearchPage.css';

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products?search=${query}`);
        setProducts(response.data.data.products || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  return (
    <div className="search-page">
      <div className="container">
        <h1>Resultados da busca por: "{query}"</h1>
        <p className="results-count">
          {products.length} {products.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </p>
        
        {loading ? (
          <div className="loading-spinner">Buscando...</div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <p>Nenhum produto encontrado para "{query}"</p>
            <Link to="/products" className="btn btn-primary">Ver todos os produtos</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => {
              const finalPrice = calculateFinalPrice(product.price, product.discount);
              return (
                <Link to={`/products/${product._id}`} key={product._id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/300x400?text=Sem+Imagem'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400?text=Sem+Imagem';
                      }}
                    />
                    {product.discount > 0 && (
                      <div className="discount-badge">-{product.discount}%</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-genre">{product.genre}</p>
                    <div className="product-price">
                      <span className="current-price">
                        R$ {finalPrice.toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <span className="original-price">
                          R$ {parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
