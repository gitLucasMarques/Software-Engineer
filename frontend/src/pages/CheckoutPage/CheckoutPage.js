import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  });

  useEffect(() => {
    if (!user) {
      toast.error('Você precisa fazer login para finalizar a compra');
      navigate('/login');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.info('Seu carrinho está vazio');
      navigate('/cart');
    }
  }, [user, cart, navigate]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingInfo[field] || shippingInfo[field].trim() === '') {
        toast.error(`Por favor, preencha o campo: ${field}`);
        return false;
      }
    }
    
    if (!paymentMethod) {
      toast.error('Por favor, selecione um método de pagamento');
      return false;
    }
    
    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Criar pedido
      const orderData = {
        shippingAddress: shippingInfo
      };

      console.log('🔵 [CHECKOUT] Criando pedido...');
      const orderResponse = await api.post('/api/orders', orderData);
      console.log('✅ [CHECKOUT] Resposta:', orderResponse.data);
      
      const orderId = orderResponse.data.data.order._id;

      toast.success('Pedido criado com sucesso!');

      // Redirecionar para página de pagamento baseado no método escolhido
      switch(paymentMethod) {
        case 'pix':
          navigate(`/payment/pix/${orderId}`);
          break;
        case 'boleto':
          navigate(`/payment/boleto/${orderId}`);
          break;
        case 'credit_card':
        case 'debit_card':
          navigate(`/payment/card/${orderId}`, { state: { cardType: paymentMethod } });
          break;
        default:
          toast.error('Método de pagamento inválido');
      }

    } catch (error) {
      console.error('❌ [CHECKOUT] Erro ao criar pedido:', error);
      console.error('Detalhes:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Erro ao criar pedido. Tente novamente.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Finalizar Compra</h1>

        <div className="checkout-content">
          <form onSubmit={handleCheckout} className="checkout-form">
            {/* Informações de Envio */}
            <section className="checkout-section">
              <h2>📦 Informações de Entrega</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Endereço *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    maxLength="2"
                    placeholder="Ex: SP"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Método de Pagamento */}
            <section className="checkout-section">
              <h2>💳 Método de Pagamento</h2>
              
              <div className="payment-methods">
                <label className={`payment-method ${paymentMethod === 'pix' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <span className="payment-icon">🔲</span>
                    <div>
                      <strong>PIX</strong>
                      <p>Pagamento instantâneo</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-method ${paymentMethod === 'boleto' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="boleto"
                    checked={paymentMethod === 'boleto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <span className="payment-icon">📄</span>
                    <div>
                      <strong>Boleto Bancário</strong>
                      <p>Pague em até 12x</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-method ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Cartão de Crédito</strong>
                      <p>Parcele em até 12x sem juros</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-method ${paymentMethod === 'debit_card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit_card"
                    checked={paymentMethod === 'debit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-method-content">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Cartão de Débito</strong>
                      <p>Pagamento à vista</p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            <button 
              type="submit" 
              className="btn btn-primary btn-checkout"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Continuar para Pagamento'}
            </button>
          </form>

          {/* Resumo do Pedido */}
          <aside className="order-summary">
            <h2>Resumo do Pedido</h2>
            
            <div className="order-items">
              {cart.items.map((item) => {
                const product = item.productId;
                if (!product) return null;

                const price = product.price || 0;
                const discount = product.discount || 0;
                const finalPrice = discount > 0 ? price - (price * discount / 100) : price;

                return (
                  <div key={item._id} className="order-item">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/80'} 
                      alt={product.name}
                    />
                    <div className="order-item-details">
                      <p className="order-item-name">{product.name}</p>
                      <p className="order-item-quantity">Qtd: {item.quantity}</p>
                    </div>
                    <p className="order-item-price">
                      R$ {(finalPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="order-totals">
              <div className="order-total-row">
                <span>Subtotal</span>
                <span>R$ {calculateTotal().toFixed(2)}</span>
              </div>
              <div className="order-total-row">
                <span>Frete</span>
                <span className="free">Grátis</span>
              </div>
              <div className="order-total-row total">
                <strong>Total</strong>
                <strong>R$ {calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
