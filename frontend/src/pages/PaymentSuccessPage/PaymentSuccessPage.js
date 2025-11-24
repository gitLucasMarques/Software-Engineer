import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');

  useEffect(() => {
    if (orderId) {
      // Aqui você pode fazer uma chamada à API para buscar detalhes do pedido
      // Por enquanto, apenas salvamos o ID
      setOrderDetails({ id: orderId });
    }
  }, [orderId]);

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Pagamento Confirmado!</h1>
        <p className="success-message">
          Seu pagamento foi processado com sucesso e seu pedido está sendo preparado.
        </p>
        
        {orderDetails && (
          <div className="order-info">
            <p>Número do pedido: <strong>#{orderDetails.id}</strong></p>
            <p>Você receberá um email de confirmação em breve.</p>
          </div>
        )}

        <div className="action-buttons">
          <Link to="/orders" className="btn btn-primary">
            Ver Meus Pedidos
          </Link>
          <Link to="/" className="btn btn-secondary">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
