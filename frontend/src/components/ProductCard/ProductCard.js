import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const finalPrice = calculateFinalPrice(product.price, product.discount);

  return (
    <div className="product-card">
      {user && (
        <button 
          className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={isInWishlist(product._id) ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        >
          {isInWishlist(product._id) ? '❤️' : '🤍'}
        </button>
      )}

      <Link to={`/products/${product._id}`} className="product-card-link">
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
    </div>
  );
};

export default ProductCard;
