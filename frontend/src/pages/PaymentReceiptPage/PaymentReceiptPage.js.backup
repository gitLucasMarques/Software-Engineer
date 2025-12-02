import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './PaymentReceiptPage.css';

const PaymentReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${orderId}`);
      setOrder(response.data.data?.order || response.data.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      pix: 'PIX',
      boleto: 'Boleto Bancário',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      mercadopago: 'MercadoPago',
      paypal: 'PayPal'
    };
    return labels[method] || method;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Aguardando Pagamento',
      paid: 'Pago',
      processing: 'Em Processamento',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="receipt-page">
        <div className="container">
          <div className="loading-spinner">Carregando comprovante...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="receipt-page">
        <div className="container">
          <div className="error-message">Pedido não encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <div className="container">
        <div className="receipt-card">
          {/* Header */}
          <div className="receipt-header">
            <div className="success-icon">✓</div>
            <h1>Comprovante de Compra</h1>
            <p className="success-message">
              {order.paymentStatus === 'paid' 
                ? 'Pagamento aprovado com sucesso!' 
                : 'Pedido registrado com sucesso!'}
            </p>
          </div>

          {/* Informações do Pedido */}
          <div className="receipt-section">
            <h3>📦 Informações do Pedido</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Número do Pedido:</span>
                <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="info-item">
                <span className="label">Data e Hora:</span>
                <span className="value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Status do Pedido:</span>
                <span className={`value status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Status do Pagamento:</span>
                <span className={`value status-${order.paymentStatus}`}>
                  {getStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="receipt-section">
            <h3>💳 Método de Pagamento</h3>
            <div className="payment-method-box">
              <p className="method-name">
                {getPaymentMethodLabel(location.state?.paymentMethod || order.paymentMethod || 'N/A')}
              </p>
              {location.state?.paymentResult && (
                <div className="payment-details">
                  {location.state.paymentResult.installments > 1 && (
                    <p>
                      {location.state.paymentResult.installments}x de R$ {location.state.paymentResult.installmentAmount}
                    </p>
                  )}
                  {location.state.paymentResult.authorizationCode && (
                    <p>Cód. Autorização: {location.state.paymentResult.authorizationCode}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Produtos */}
          <div className="receipt-section">
            <h3>🛒 Itens do Pedido</h3>
            <div className="items-list">
              {order.items && order.items.map((item, index) => {
                const product = item.productId || item.product;
                if (!product) return null;

                return (
                  <div key={index} className="receipt-item">
                    <div className="item-image">
                      <img 
                        src={product.imageUrl || 'https://via.placeholder.com/60'} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/60?text=Produto';
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">{product.name}</p>
                      <p className="item-quantity">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="receipt-section">
            <h3>📍 Endereço de Entrega</h3>
            <div className="address-box">
              {order.shippingAddress ? (
                <>
                  <p><strong>{order.shippingAddress.fullName}</strong></p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                  <p>CEP: {order.shippingAddress.zipCode}</p>
                  <p>Telefone: {order.shippingAddress.phone}</p>
                  <p>E-mail: {order.shippingAddress.email}</p>
                </>
              ) : (
                <p>Endereço não informado</p>
              )}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="receipt-section">
            <h3>💰 Resumo Financeiro</h3>
            <div className="financial-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>R$ {order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Frete:</span>
                <span>Grátis</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>R$ {order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Informações da Empresa */}
          <div className="receipt-section company-info">
            <h3>🏢 Informações da Empresa</h3>
            <p><strong>Voxel LTDA</strong></p>
            <p>CNPJ: 12.345.678/0001-90</p>
            <p>Rua Exemplo, 123 - São Paulo, SP</p>
            <p>Telefone: (11) 1234-5678</p>
            <p>E-mail: contato@voxel.com.br</p>
          </div>

          {/* Ações */}
          <div className="receipt-actions no-print">
            <button className="btn-print" onClick={printReceipt}>
              🖨️ Imprimir Comprovante
            </button>
            <button className="btn-orders" onClick={() => navigate('/orders')}>
              📦 Meus Pedidos
            </button>
            <button className="btn-home" onClick={() => navigate('/')}>
              🏠 Página Inicial
            </button>
          </div>

          {/* Mensagem de Agradecimento */}
          <div className="thank-you-message">
            <p>✨ Obrigado por comprar conosco! ✨</p>
            <p>Qualquer dúvida, entre em contato com nosso suporte.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptPage;
