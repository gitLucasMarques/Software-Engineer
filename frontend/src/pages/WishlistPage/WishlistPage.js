import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { addItem } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddToCart = async (productId) => {
    await addItem(productId, 1);
  };

  const handleRemove = (productId) => {
    if (window.confirm('Deseja remover este item da lista de desejos?')) {
      removeFromWishlist(productId);
    }
  };

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="loading-spinner">Carregando lista de desejos...</div>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <h1>❤️ Lista de Desejos</h1>
          
          <div className="empty-wishlist">
            <div className="empty-icon">💝</div>
            <h2>Sua lista de desejos está vazia</h2>
            <p>Adicione itens à sua lista para acompanhar seus favoritos</p>
            <Link to="/products" className="btn btn-primary">
              Explorar Jogos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1>❤️ Minha Lista de Desejos</h1>
        <p className="wishlist-count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}</p>

        <div className="wishlist-grid">
          {wishlist.map((product) => {
            const finalPrice = calculateFinalPrice(product.price, product.discount || 0);
            
            return (
              <div key={product._id} className="wishlist-card">
                <button 
                  className="wishlist-remove-btn"
                  onClick={() => handleRemove(product._id)}
                  title="Remover da lista"
                >
                  ✕
                </button>

                {product.discount > 0 && (
                  <div className="wishlist-discount-badge">-{product.discount}%</div>
                )}

                <Link to={`/products/${product._id}`} className="wishlist-card-image">
                  <img 
                    src={product.imageUrl || product.image || 'https://via.placeholder.com/300x400?text=Sem+Imagem'} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400?text=Sem+Imagem';
                    }}
                  />
                </Link>

                <div className="wishlist-card-content">
                  <Link to={`/products/${product._id}`} className="wishlist-card-title">
                    {product.name}
                  </Link>

                  <div className="wishlist-card-meta">
                    {product.genre && <span className="wishlist-genre">{product.genre}</span>}
                    {product.platform && (
                      <span className="wishlist-platform">{product.platform}</span>
                    )}
                  </div>

                  <div className="wishlist-card-price">
                    {product.discount > 0 && (
                      <span className="wishlist-original-price">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                    <span className="wishlist-current-price">
                      R$ {finalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className={`wishlist-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                  </div>

                  <button 
                    className="btn btn-primary btn-full"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? '🛒 Adicionar ao Carrinho' : 'Indisponível'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="wishlist-actions">
          <Link to="/products" className="btn btn-secondary">
            Continuar Explorando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
