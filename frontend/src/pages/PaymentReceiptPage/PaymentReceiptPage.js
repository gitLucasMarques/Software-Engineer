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
    return <div className="loading-page">Carregando comprovante...</div>;
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="receipt-page">
      <div className="container">
        <div className="receipt-card">
          {/* Cabeçalho */}
          <div className="receipt-header">
            <h1>✓ Comprovante de Pagamento</h1>
            <div className="receipt-status success">
              Pagamento {receipt.paymentStatus === 'paid' ? 'Confirmado' : 'Pendente'}
            </div>
          </div>

          {/* Informações da Transação */}
          <section className="receipt-section">
            <h2>Informações da Transação</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">ID do Pedido:</span>
                <span className="value">{receipt.orderId}</span>
              </div>
              <div className="info-item">
                <span className="label">ID da Transação:</span>
                <span className="value">{receipt.transactionId || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Data:</span>
                <span className="value">
                  {new Date(receipt.date).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Método de Pagamento:</span>
                <span className="value">{getPaymentMethodLabel(receipt.paymentMethod)}</span>
              </div>
            </div>
          </section>

          {/* Detalhes do Pagamento */}
          {receipt.paymentDetails && (
            <section className="receipt-section">
              <h2>Detalhes do Pagamento</h2>
              <div className="payment-details">
                {receipt.paymentMethod === 'pix' && (
                  <div>
                    <p>Código PIX utilizado</p>
                  </div>
                )}
                {receipt.paymentMethod === 'boleto' && (
                  <div>
                    <p><strong>Parcelas:</strong> {receipt.paymentDetails.boletoInstallments}x</p>
                    <p><strong>Vencimento:</strong> {new Date(receipt.paymentDetails.boletoDueDate).toLocaleDateString()}</p>
                  </div>
                )}
                {(receipt.paymentMethod === 'credit_card' || receipt.paymentMethod === 'debit_card') && (
                  <div>
                    <p><strong>Cartão:</strong> {receipt.paymentDetails.cardBrand} **** {receipt.paymentDetails.cardLast4}</p>
                    <p><strong>Titular:</strong> {receipt.paymentDetails.cardHolderName}</p>
                    {receipt.paymentDetails.cardInstallments > 1 && (
                      <p><strong>Parcelas:</strong> {receipt.paymentDetails.cardInstallments}x</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Cliente */}
          <section className="receipt-section">
            <h2>Cliente</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Nome:</span>
                <span className="value">{receipt.customer.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{receipt.customer.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Telefone:</span>
                <span className="value">{receipt.customer.phone}</span>
              </div>
            </div>
          </section>

          {/* Endereço de Entrega */}
          <section className="receipt-section">
            <h2>Endereço de Entrega</h2>
            <div className="address">
              <p>{receipt.shippingAddress.address}</p>
              <p>{receipt.shippingAddress.city} - {receipt.shippingAddress.state}</p>
              <p>CEP: {receipt.shippingAddress.zipCode}</p>
            </div>
          </section>

          {/* Itens do Pedido */}
          <section className="receipt-section">
            <h2>Itens do Pedido</h2>
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>R$ {item.price.toFixed(2)}</td>
                      <td>R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>R$ {receipt.totalAmount.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Ações */}
          <div className="receipt-actions no-print">
            <button onClick={printReceipt} className="btn btn-secondary">
              🖨️ Imprimir Comprovante
            </button>
            <button onClick={() => navigate('/orders')} className="btn btn-primary">
              Ver Meus Pedidos
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Voltar para Home
            </button>
          </div>

          {/* Rodapé */}
          <div className="receipt-footer">
            <p>Este é um comprovante simulado para fins de demonstração.</p>
            <p>Game Ecommerce © 2025 - Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptPage;
