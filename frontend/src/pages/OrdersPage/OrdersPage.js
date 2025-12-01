import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders');
      // Filtrar apenas pedidos com pagamento confirmado
      const paidOrders = (response.data.data.orders || []).filter(
        order => order.paymentStatus === 'paid'
      );
      setOrders(paidOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'Pendente',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return statusLabels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading-spinner">Carregando pedidos...</div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>📦 Meus Pedidos</h1>
          
          <div className="empty-orders">
            <div className="empty-orders-icon">📦</div>
            <h2>Você ainda não fez nenhum pedido</h2>
            <p>Explore nossa loja e faça seu primeiro pedido!</p>
            <Link to="/products" className="btn btn-primary">
              Explorar Jogos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>📦 Meus Pedidos</h1>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Pedido #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={`order-status ${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="order-items">
                {order.items && order.items.map((item, index) => {
                  const product = item.productId;
                  if (!product) return null;

                  return (
                    <div key={index} className="order-item">
                      <div className="order-item-image">
                        <img 
                          src={product.imageUrl || 'https://via.placeholder.com/60x80?text=Sem+Imagem'} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x80?text=Sem+Imagem';
                          }}
                        />
                      </div>
                      <div className="order-item-details">
                        <p className="order-item-name">{product.name}</p>
                        <p className="order-item-qty">Quantidade: {item.quantity}</p>
                      </div>
                      <div className="order-item-price">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  Total: R$ {parseFloat(order.totalAmount).toFixed(2)}
                </div>
                <div className="order-actions">
                  <Link to={`/orders/${order._id}`} className="btn-view-details">
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
