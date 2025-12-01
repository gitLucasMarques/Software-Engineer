import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching order with ID:', id);
        const response = await api.get(`/api/orders/${id}`);
        console.log('Order response:', response.data);
        
        // Backend retorna { status: 'success', data: { order: {...} } }
        const orderData = response.data.data?.order || response.data;
        console.log('Order data:', orderData);
        
        if (!orderData) {
          setError('Pedido não encontrado');
          return;
        }
        
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.message || 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', color: '#ffc107' },
      processing: { label: 'Processando', color: '#2196f3' },
      shipped: { label: 'Enviado', color: '#ff9800' },
      delivered: { label: 'Entregue', color: '#4caf50' },
      cancelled: { label: 'Cancelado', color: '#f44336' }
    };
    return statusMap[status] || { label: status, color: '#9e9e9e' };
  };

  const getPaymentStatusLabel = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', color: '#ffc107' },
      paid: { label: 'Aprovado', color: '#4caf50' },
      in_process: { label: 'Em Processamento', color: '#2196f3' },
      rejected: { label: 'Rejeitado', color: '#f44336' },
      cancelled: { label: 'Cancelado', color: '#f44336' }
    };
    return statusMap[status] || { label: status, color: '#9e9e9e' };
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-detail-loading">
            <div className="loading-spinner"></div>
            <p>Carregando detalhes do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-detail-error">
            <h2>❌ Erro ao carregar pedido</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/orders')} className="btn-back">
              Voltar aos Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-detail-error">
            <h2>📦 Pedido não encontrado</h2>
            <button onClick={() => navigate('/orders')} className="btn-back">
              Voltar aos Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusLabel(order.status);
  const paymentInfo = getPaymentStatusLabel(order.paymentStatus);

  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-header">
          <button onClick={() => navigate('/orders')} className="btn-back-small">
            ← Voltar
          </button>
          <h1>Detalhes do Pedido</h1>
          <p className="order-number">Pedido #{order.orderNumber || order._id}</p>
        </div>

        <div className="order-content">
          {/* Status Cards */}
          <div className="status-cards">
            <div className="status-card">
              <div className="status-card-icon">📦</div>
              <h3>Status do Pedido</h3>
              <div className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                {statusInfo.label}
              </div>
              <p className="status-date">
                Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="status-card">
              <div className="status-card-icon">💳</div>
              <h3>Status do Pagamento</h3>
              <div className="status-badge" style={{ backgroundColor: paymentInfo.color }}>
                {paymentInfo.label}
              </div>
              <p className="payment-method">
                {order.paymentMethod === 'credit_card' && '💳 Cartão de Crédito'}
                {order.paymentMethod === 'debit_card' && '💳 Cartão de Débito'}
                {order.paymentMethod === 'pix' && '📱 PIX'}
                {order.paymentMethod === 'boleto' && '🏦 Boleto'}
                {order.paymentMethod === 'paypal' && '💰 PayPal'}
              </p>
            </div>

            <div className="status-card">
              <div className="status-card-icon">💰</div>
              <h3>Total do Pedido</h3>
              <div className="order-total">
                R$ {order.totalAmount?.toFixed(2)}
              </div>
              <p className="items-count">
                {order.items?.length} {order.items?.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="order-details-grid">
            {/* Left Column */}
            <div className="order-left-column">
              {/* Order Items */}
              <div className="info-box">
                <div className="info-box-header">
                  <span className="info-box-icon">🛍️</span>
                  <h2>Itens do Pedido</h2>
                </div>
                <div className="order-items-list">
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <img 
                        src={item.productId?.imageUrl || item.product?.imageUrl || '/placeholder-product.png'} 
                        alt={item.productId?.name || item.product?.name || 'Produto'}
                        className="item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80x80?text=Produto';
                        }}
                      />
                      <div className="item-details">
                        <h4>{item.productId?.name || item.product?.name || 'Produto'}</h4>
                        <p className="item-quantity">Qtd: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        <p className="unit-price">R$ {item.price?.toFixed(2)}</p>
                        <p className="total-price">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="info-box">
                <div className="info-box-header">
                  <span className="info-box-icon">📊</span>
                  <h2>Resumo do Pedido</h2>
                </div>
                <div className="summary-content">
                  <div className="summary-line">
                    <span>Subtotal:</span>
                    <span>R$ {order.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>Frete:</span>
                    <span className="free-shipping">Grátis</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-line total-line">
                    <span>Total:</span>
                    <span>R$ {order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="order-right-column">
              {/* Shipping Address */}
              <div className="info-box">
                <div className="info-box-header">
                  <span className="info-box-icon">🏠</span>
                  <h2>Endereço de Entrega</h2>
                </div>
                <div className="shipping-info">
                  <div className="info-row">
                    <span className="info-label">Nome:</span>
                    <span className="info-value">{order.shippingAddress?.fullName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{order.shippingAddress?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">{order.shippingAddress?.phone}</span>
                  </div>
                  <div className="info-divider"></div>
                  <div className="info-row">
                    <span className="info-label">Endereço:</span>
                    <span className="info-value">{order.shippingAddress?.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Cidade/UF:</span>
                    <span className="info-value">{order.shippingAddress?.city} - {order.shippingAddress?.state}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">CEP:</span>
                    <span className="info-value">{order.shippingAddress?.zipCode}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">País:</span>
                    <span className="info-value">{order.shippingAddress?.country}</span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="info-box help-box">
                <div className="info-box-header">
                  <span className="info-box-icon">💬</span>
                  <h2>Precisa de Ajuda?</h2>
                </div>
                <div className="help-content">
                  <p>Entre em contato com nosso suporte para mais informações sobre seu pedido.</p>
                  <button onClick={() => navigate('/contact')} className="btn-contact">
                    Falar com Suporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
