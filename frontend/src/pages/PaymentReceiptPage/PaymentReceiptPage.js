import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './PaymentReceiptPage.css';

const PaymentReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [orderId]);

  const loadReceipt = async () => {
    try {
      const res = await api.get(`/api/payments/receipt/${orderId}`);
      setReceipt(res.data.data.receipt);
    } catch (error) {
      toast.error('Erro ao carregar comprovante');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      pix: 'PIX',
      boleto: 'Boleto Bancário',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito'
    };
    return methods[method] || method;
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Carregando comprovante...</p>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="receipt-page">
      <div className="receipt-wrapper">
        {/* Header Simples */}
        <div className="receipt-top-bar">
          <div className="store-logo">VOXEL</div>
          <div className="receipt-id">Pedido #{receipt.orderId.slice(-8).toUpperCase()}</div>
        </div>

        {/* Mensagem de Sucesso */}
        <div className={`success-message ${receipt.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
          <div className="success-icon">
            {receipt.paymentStatus === 'paid' ? '✓' : '⏳'}
          </div>
          <div className="success-content">
            <h1>Pagamento {receipt.paymentStatus === 'paid' ? 'Confirmado' : 'Pendente'}</h1>
            <p>Obrigado por sua compra!</p>
            <p className="order-date">
              {new Date(receipt.date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Container Principal */}
        <div className="receipt-main-container">
          
          {/* Coluna Esquerda - Informações */}
          <div className="receipt-left-column">
            
            {/* Endereço de Entrega */}
            <div className="info-block">
              <h3 className="block-title">Endereço de Entrega</h3>
              <div className="block-content">
                <p className="customer-name">{receipt.customer.name}</p>
                <p>{receipt.shippingAddress.address}</p>
                <p>{receipt.shippingAddress.city} - {receipt.shippingAddress.state}</p>
                <p>CEP: {receipt.shippingAddress.zipCode}</p>
                <p className="customer-phone">{receipt.customer.phone}</p>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="info-block">
              <h3 className="block-title">Método de Pagamento</h3>
              <div className="block-content">
                <p className="payment-method-name">{getPaymentMethodLabel(receipt.paymentMethod)}</p>
                
                {receipt.paymentDetails && (
                  <div className="payment-details-list">
                    {receipt.paymentMethod === 'pix' && (
                      <p className="detail-line">✓ Pagamento confirmado via PIX</p>
                    )}
                    
                    {receipt.paymentMethod === 'boleto' && (
                      <>
                        <p className="detail-line">Parcelas: {receipt.paymentDetails.boletoInstallments}x</p>
                        <p className="detail-line">
                          Vencimento: {new Date(receipt.paymentDetails.boletoDueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </>
                    )}
                    
                    {(receipt.paymentMethod === 'credit_card' || receipt.paymentMethod === 'debit_card') && (
                      <>
                        <p className="detail-line">
                          {receipt.paymentDetails.cardBrand} •••• {receipt.paymentDetails.cardLast4}
                        </p>
                        <p className="detail-line">Titular: {receipt.paymentDetails.cardHolderName}</p>
                        {receipt.paymentDetails.cardInstallments > 1 && (
                          <p className="detail-line">
                            {receipt.paymentDetails.cardInstallments}x de R$ {(receipt.totalAmount / receipt.paymentDetails.cardInstallments).toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="info-block">
              <h3 className="block-title">Resumo do Pedido</h3>
              <div className="block-content">
                <div className="summary-line">
                  <span>Subtotal dos itens:</span>
                  <span>R$ {receipt.totalAmount.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Frete e manuseio:</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="summary-line total">
                  <span>Total:</span>
                  <span>R$ {receipt.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="action-buttons no-print">
              <button onClick={printReceipt} className="btn-receipt btn-primary-receipt">
                Imprimir pedido
              </button>
              <button onClick={() => navigate('/orders')} className="btn-receipt btn-secondary-receipt">
                Ver todos os pedidos
              </button>
            </div>
          </div>

          {/* Coluna Direita - Produtos */}
          <div className="receipt-right-column">
            <div className="products-block">
              <h3 className="block-title">
                Itens do Pedido
                <span className="items-count">{receipt.items.length} {receipt.items.length === 1 ? 'item' : 'itens'}</span>
              </h3>
              
              <div className="products-list">
                {receipt.items.map((item, index) => (
                  <div key={index} className="product-item">
                    <div className="product-main-info">
                      <h4 className="product-title">{item.name}</h4>
                      <p className="product-price">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="product-meta">
                      <span className="product-qty">Quantidade: {item.quantity}</span>
                      <span className="product-total">R$ {item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="receipt-footer">
          <p className="footer-note">
            Se você tiver alguma dúvida sobre este pedido, visite nossa <a href="/contact">Central de Ajuda</a>
          </p>
          <p className="footer-copyright">
            © 2025 Voxel Store. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptPage;