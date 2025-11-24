import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import './PaymentPixPage.css';

const PaymentPixPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};
  
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      toast.error('Pedido não encontrado');
      navigate('/cart');
      return;
    }

    generatePixCode();
  }, [orderId]);

  const generatePixCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/payments/pix/create', { orderId });
      setPixData(response.data.data.pixData);
    } catch (error) {
      console.error('Erro ao gerar código PIX:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao gerar código PIX';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFinish = () => {
    navigate(`/payment/receipt/${orderId}`, { 
      state: { 
        paymentMethod: 'pix',
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
            paymentMethod: 'pix',
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
      <div className="payment-pix-page">
        <div className="container">
          <div className="loading-spinner">Gerando código PIX...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-pix-page">
        <div className="container">
          <div className="error-card">
            <h2>❌ Erro ao Gerar PIX</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/orders')}>
              Voltar para Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!pixData) {
    return null;
  }

  const expiresIn = Math.floor((new Date(pixData.expiresAt) - new Date()) / 1000 / 60);

  return (
    <div className="payment-pix-page">
      <div className="container">
        <div className="payment-card">
          <div className="payment-header">
            <div className="payment-icon">📱</div>
            <h1>Pagamento via PIX</h1>
            <p className="payment-subtitle">Pague com qualquer banco ou carteira digital</p>
          </div>

          <div className="payment-content">
            <div className="pix-qrcode-section">
              <div className="qrcode-container">
                <QRCodeSVG 
                  value={pixData.qrCodeText} 
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="qrcode-subtitle">
                Escaneie o QR Code com o aplicativo do seu banco
              </p>
            </div>

            <div className="divider">
              <span>ou</span>
            </div>

            <div className="pix-code-section">
              <label>Código PIX (Copia e Cola)</label>
              <div className="pix-code-box">
                <input 
                  type="text" 
                  value={pixData.pixCode} 
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

            <div className="payment-info-box">
              <div className="info-row">
                <span className="info-label">Valor:</span>
                <span className="info-value">R$ {pixData.amount}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Expira em:</span>
                <span className="info-value expire-time">{expiresIn} minutos</span>
              </div>
              <div className="info-row">
                <span className="info-label">ID da Transação:</span>
                <span className="info-value">{pixData.transactionId.slice(-12)}</span>
              </div>
            </div>

            <div className="instructions-section">
              <h3>📝 Como pagar:</h3>
              <ol className="instructions-list">
                {pixData.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <div className="payment-actions">
              <button className="btn-secondary" onClick={() => navigate('/orders')}>
                Voltar para Pedidos
              </button>
              <button className="btn-simulate" onClick={handleSimulatePayment}>
                💰 Simular Pagamento
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

export default PaymentPixPage;
