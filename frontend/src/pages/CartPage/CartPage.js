import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './CartPage.css';

const CartPage = () => {
  const { cart, loading, itemCount, updateItem, removeItem, clearCart } = useCart();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Deseja remover este item do carrinho?')) {
      removeItem(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Deseja limpar todo o carrinho?')) {
      clearCart();
    }
  };

  const calculateSubtotal = (item) => {
    const price = item.productId?.price || 0;
    const discount = item.productId?.discount || 0;
    const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
    return finalPrice * item.quantity;
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + calculateSubtotal(item), 0);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading-spinner">Carregando carrinho...</div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione jogos incríveis ao seu carrinho!</p>
            <Link to="/products" className="btn btn-primary">
              Explorar Jogos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>🛒 Meu Carrinho</h1>
          <button onClick={handleClearCart} className="btn-clear-cart">
            Limpar Carrinho
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const price = product.price || 0;
              const discount = product.discount || 0;
              const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
              const subtotal = calculateSubtotal(item);

              return (
                <div key={item._id} className="cart-item">
                  <Link to={`/products/${product._id}`} className="cart-item-image">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/150?text=Sem+Imagem'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Sem+Imagem';
                      }}
                    />
                  </Link>

                  <div className="cart-item-details">
                    <Link to={`/products/${product._id}`} className="cart-item-name">
                      {product.name}
                    </Link>
                    <div className="cart-item-info">
                      <span className="cart-item-genre">{product.genre}</span>
                      {product.platform && (
                        <span className="cart-item-platform">{product.platform}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="cart-item-discount">-{discount}% OFF</span>
                    )}
                  </div>

                  <div className="cart-item-price">
                    {discount > 0 && (
                      <span className="original-price">R$ {price.toFixed(2)}</span>
                    )}
                    <span className="current-price">R$ {finalPrice.toFixed(2)}</span>
                  </div>

                  <div className="cart-item-quantity">
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      disabled={item.quantity >= (product.stock || 0)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    R$ {subtotal.toFixed(2)}
                  </div>

                  <button 
                    onClick={() => handleRemoveItem(item._id)} 
                    className="cart-item-remove"
                    title="Remover item"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Resumo do Pedido</h2>
            
            <div className="summary-row">
              <span>Itens ({itemCount})</span>
              <span>R$ {calculateTotal().toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Frete</span>
              <span>Grátis</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>R$ {calculateTotal().toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-full">
              Finalizar Compra
            </Link>

            <Link to="/products" className="btn btn-secondary btn-full">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
