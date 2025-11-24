import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './PaymentFailurePage.css';

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Erro desconhecido';

  return (
    <div className="payment-failure-page">
      <div className="failure-container">
        <div className="failure-icon">❌</div>
        <h1>Pagamento Não Processado</h1>
        <p className="failure-message">
          Houve um problema ao processar seu pagamento.
        </p>
        
        <div className="failure-info">
          <p className="reason">Motivo: {reason}</p>
          <p>Não se preocupe, nenhum valor foi cobrado.</p>
        </div>

        <div className="action-buttons">
          <Link to="/cart" className="btn btn-primary">
            Voltar ao Carrinho
          </Link>
          <Link to="/" className="btn btn-secondary">
            Continuar Comprando
          </Link>
        </div>

        <div className="help-section">
          <p>Precisa de ajuda?</p>
          <Link to="/contact" className="contact-link">Entre em contato conosco</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
