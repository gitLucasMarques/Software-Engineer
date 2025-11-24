import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data.product);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      await addItem(product._id, 1);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      await addItem(product._id, 1);
      navigate('/cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  const calculateSavings = (price, discount) => {
    if (discount > 0) {
      return (price * discount / 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <h1>Produto não encontrado</h1>
          <Link to="/products" className="btn btn-primary">Voltar para produtos</Link>
        </div>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice(product.price, product.discount);
  const savings = calculateSavings(product.price, product.discount);
  const platforms = product.platform ? product.platform.split(',').map(p => p.trim()) : [];

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <Link to="/products" className="back-button">
          ← Voltar para catálogo
        </Link>

        <div className="product-detail-content">
          <div className="product-detail-image">
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/600x800?text=Sem+Imagem'} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x800?text=Sem+Imagem';
              }}
            />
            {product.discount > 0 && (
              <div className="discount-badge-large">-{product.discount}%</div>
            )}
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Gênero</span>
                <span className="meta-value">{product.genre}</span>
              </div>
              {product.releaseDate && (
                <div className="meta-item">
                  <span className="meta-label">Lançamento</span>
                  <span className="meta-value">
                    {new Date(product.releaseDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <div className="product-description">
              <h2>Sobre</h2>
              <p>{product.description || 'Descrição não disponível.'}</p>
            </div>

            <div className="product-price-section">
              <div className="price-label">Preço</div>
              <div className="price-display">
                <span className="current-price-large">
                  R$ {finalPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="original-price-large">
                    R$ {parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <div className="savings-info">
                  Economize R$ {savings.toFixed(2)} ({product.discount}% de desconto)
                </div>
              )}
            </div>

            <div className={`stock-info ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 
                ? `${product.stock} unidades disponíveis` 
                : 'Produto esgotado'}
            </div>

            <div className="product-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Comprar Agora
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Adicionar ao Carrinho
              </button>
              {user && (
                <button 
                  className={`btn ${isInWishlist(product._id) ? 'btn-wishlist-active' : 'btn-wishlist'}`}
                  onClick={handleToggleWishlist}
                  title={isInWishlist(product._id) ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
                >
                  {isInWishlist(product._id) ? '❤️' : '🤍'}
                </button>
              )}
            </div>

            {platforms.length > 0 && (
              <div className="product-platform-section">
                <div className="meta-label" style={{marginBottom: '12px'}}>Plataformas</div>
                <div className="product-platform-badges">
                  {platforms.map((platform, index) => (
                    <span key={index} className="platform-badge">{platform}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
