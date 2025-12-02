import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './PaymentPixPage.css';

const PaymentPixPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [pixData, setPixData] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generatePix();
  }, [orderId]);

  useEffect(() => {
    if (pixData?.expiresAt) {
      const timer = setInterval(() => {
        const diff = new Date(pixData.expiresAt) - new Date();
        if (diff <= 0) {
          setTimeLeft('Expirado');
          clearInterval(timer);
        } else {
          const min = Math.floor(diff / 60000);
          const sec = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${min}:${sec.toString().padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pixData]);

  const generatePix = async () => {
    try {
      const res = await api.post('/api/payments/pix/create', { orderId });
      setPixData(res.data.data);
      toast.success('Código PIX gerado!');
    } catch (error) {
      toast.error('Erro ao gerar PIX');
      navigate('/orders');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const simulatePayment = async () => {
    if (window.confirm('Simular pagamento?')) {
      try {
        await api.post('/api/payments/pix/confirm', { orderId });
        toast.success('Pagamento confirmado!');
        navigate(`/payment/receipt/${orderId}`);
      } catch (error) {
        toast.error('Erro ao confirmar');
      }
    }
  };

  if (!pixData) return <div className="loading-page">Carregando...</div>;

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-card">
          <h1>🔲 Pagamento via PIX</h1>
          <div className="qr-section">
            <img src={pixData.pixQRCode} alt="QR Code" className="qr-code" />
            <p>Valor: R$ {pixData.amount?.toFixed(2)}</p>
            <p>Tempo: {timeLeft}</p>
          </div>
          <div className="code-section">
            <label>Código PIX:</label>
            <textarea readOnly value={pixData.pixCode} rows="3" />
            <button onClick={copyCode} className="btn btn-secondary">
              {copied ? '✓ Copiado' : 'Copiar Código'}
            </button>
          </div>
          <div className="actions">
            <button onClick={simulatePayment} className="btn btn-primary">
              ✓ Simular Pagamento
            </button>
            <button onClick={() => navigate('/orders')} className="btn btn-secondary">
              Ver Pedidos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPixPage;
