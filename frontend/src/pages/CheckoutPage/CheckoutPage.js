import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
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

      console.log('Criando pedido com dados:', orderData);
      const orderResponse = await api.post('/api/orders', orderData);
      console.log('Resposta do pedido:', orderResponse.data);
      
      const orderId = orderResponse.data.data.order._id;
      console.log('ID do pedido criado:', orderId);

      toast.success('Pedido criado com sucesso!');

      // NÃO limpar carrinho aqui - só limpar após confirmação do pagamento
      // O carrinho será limpo nas páginas de pagamento após sucesso

      // Redirecionar baseado no método de pagamento
      switch (paymentMethod) {
        case 'pix':
          navigate('/payment/pix', { state: { orderId } });
          break;
        case 'boleto':
          navigate('/payment/boleto', { state: { orderId, installments: 1 } });
          break;
        case 'credit_card':
          navigate('/payment/card', { state: { orderId, paymentType: 'credit' } });
          break;
        case 'debit_card':
          navigate('/payment/card', { state: { orderId, paymentType: 'debit' } });
          break;
        default:
          toast.error('Método de pagamento inválido');
          navigate('/orders');
      }
      
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      console.error('Detalhes do erro:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const total = calculateTotal();

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>💳 Finalizar Compra</h1>

        <div className="checkout-content">
          {/* Resumo do pedido */}
          <div className="order-summary">
            <h2>Resumo do Pedido</h2>
            
            <div className="order-items">
              {cart.items.map(item => {
                const product = item.productId;
                const subtotal = calculateSubtotal(item);
                
                return (
                  <div key={item._id} className="order-item">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/80'} 
                      alt={product.name}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                    />
                    <div className="item-info">
                      <h4>{product.name}</h4>
                      <p>Quantidade: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      R$ {subtotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Frete:</span>
                <span className="free">Grátis</span>
              </div>
              <div className="total-row total-final">
                <strong>Total:</strong>
                <strong>R$ {total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Formulário de checkout */}
          <div className="checkout-form-container">
            <form onSubmit={handleCheckout} className="checkout-form">
              <h2>Informações de Envio</h2>
              
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

              <div className="form-row">
                <div className="form-group">
                  <label>E-mail *</label>
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

              <h2 style={{ marginTop: '30px' }}>Método de Pagamento</h2>
              
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'pix' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">📱</span>
                    <div>
                      <strong>PIX</strong>
                      <p>Aprovação imediata</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'boleto' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="boleto"
                    checked={paymentMethod === 'boleto'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">📄</span>
                    <div>
                      <strong>Boleto Bancário</strong>
                      <p>Vencimento em 3 dias úteis</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Cartão de Crédito</strong>
                      <p>Parcelamento em até 12x sem juros</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'debit_card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit_card"
                    checked={paymentMethod === 'debit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-info">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Cartão de Débito</strong>
                      <p>Pagamento à vista</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="payment-info-box">
                <p>
                  <strong>🔒 Pagamento Seguro:</strong> Todas as transações são processadas com segurança.
                  Seus dados de pagamento são protegidos por criptografia.
                </p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading || !paymentMethod}
              >
                {loading ? 'Processando...' : `Continuar para Pagamento`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
