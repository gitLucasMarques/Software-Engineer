import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Barcode from 'react-barcode';
import './PaymentBoletoPage.css';

const PaymentBoletoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, installments = 1 } = location.state || {};
  
  const [boletoData, setBoletoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      toast.error('Pedido não encontrado');
      navigate('/cart');
      return;
    }

    generateBoleto();
  }, [orderId]);

  const generateBoleto = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/payments/boleto/create', { 
        orderId,
        installments 
      });
      setBoletoData(response.data.data.boletoData);
    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao gerar boleto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(boletoData.digitableLine);
    setCopied(true);
    toast.success('Código de barras copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const printBoleto = () => {
    window.print();
  };

  const handleFinish = () => {
    navigate(`/payment/receipt/${orderId}`, { 
      state: { 
        paymentMethod: 'boleto',
        orderId 
      } 
    });
  };

  const handleSimulatePayment = async () => {
    try {
      await api.post(`/payments/simulate-approval/${orderId}`);
      toast.success('Pagamento simulado com sucesso!');
      setTimeout(() => {
        navigate(`/payment/receipt/${orderId}`, { 
          state: { 
            paymentMethod: 'boleto',
            orderId 
          } 
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      toast.error('Erro ao simular pagamento');
    }
  };

  if (loading) {
    return (
      <div className="payment-boleto-page">
        <div className="container">
          <div className="loading-spinner">Gerando boleto...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-boleto-page">
        <div className="container">
          <div className="error-card">
            <h2>❌ Erro ao Gerar Boleto</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/orders')}>
              Voltar para Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!boletoData) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="payment-boleto-page">
      <div className="container">
        <div className="boleto-card">
          <div className="boleto-header no-print">
            <div className="payment-icon">📄</div>
            <h1>Boleto Bancário</h1>
            <p className="payment-subtitle">Pague em qualquer banco, lotérica ou app bancário</p>
          </div>

          <div className="boleto-content">
            {/* Informações do Beneficiário e Pagador */}
            <div className="boleto-info-grid">
              <div className="info-section">
                <h3>💼 Beneficiário</h3>
                <p><strong>{boletoData.beneficiary.name}</strong></p>
                <p>CNPJ: {boletoData.beneficiary.document}</p>
                <p>{boletoData.beneficiary.address}</p>
              </div>

              <div className="info-section">
                <h3>👤 Pagador</h3>
                <p><strong>{boletoData.payer.name}</strong></p>
                <p>{boletoData.payer.email}</p>
                <p>{boletoData.payer.address}</p>
              </div>
            </div>

            {/* Dados do Pagamento */}
            <div className="payment-details-box">
              <div className="detail-row">
                <span className="detail-label">Valor do Documento:</span>
                <span className="detail-value">R$ {boletoData.amount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vencimento:</span>
                <span className="detail-value due-date">{formatDate(boletoData.dueDate)}</span>
              </div>
              {installments > 1 && (
                <div className="detail-row">
                  <span className="detail-label">Parcelas:</span>
                  <span className="detail-value">{installments}x de R$ {(parseFloat(boletoData.amount) / installments).toFixed(2)}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">ID da Transação:</span>
                <span className="detail-value">{boletoData.transactionId.slice(-16)}</span>
              </div>
            </div>

            {/* Código de Barras */}
            <div className="barcode-section">
              <h3>Código de Barras</h3>
              <div className="barcode-container">
                <Barcode 
                  value={boletoData.barcode}
                  format="CODE128"
                  width={2}
                  height={60}
                  displayValue={false}
                />
              </div>
            </div>

            {/* Linha Digitável */}
            <div className="digitable-line-section">
              <label>Linha Digitável</label>
              <div className="digitable-line-box">
                <input 
                  type="text" 
                  value={boletoData.digitableLine} 
                  readOnly 
                  onClick={(e) => e.target.select()}
                />
                <button 
                  className={`btn-copy ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="instructions-section">
              <h3>📝 Instruções:</h3>
              <ul className="instructions-list">
                {boletoData.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>

            {/* Ações */}
            <div className="boleto-actions no-print">
              <button className="btn-print" onClick={printBoleto}>
                🖨️ Imprimir Boleto
              </button>
              <button className="btn-simulate" onClick={handleSimulatePayment}>
                💰 Simular Pagamento
              </button>
              <button className="btn-secondary" onClick={() => navigate('/orders')}>
                Voltar para Pedidos
              </button>
              <button className="btn-primary" onClick={handleFinish}>
                Ver Comprovante
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBoletoPage;
