import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './PaymentBoletoPage.css';

const PaymentBoletoPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [boletoData, setBoletoData] = useState(null);
  const [installments, setInstallments] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Buscar informações do pedido
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      // Pedido carregado, pronto para gerar boleto
    } catch (error) {
      toast.error('Erro ao carregar pedido');
      navigate('/orders');
    }
  };

  const generateBoleto = async () => {
    try {
      const res = await api.post('/api/payments/boleto/create', { 
        orderId, 
        installments 
      });
      setBoletoData(res.data.data);
      toast.success('Boleto gerado!');
    } catch (error) {
      toast.error('Erro ao gerar boleto');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(boletoData.boletoCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const simulatePayment = async () => {
    if (window.confirm('Simular pagamento do boleto?')) {
      try {
        await api.post('/api/payments/boleto/confirm', { orderId });
        toast.success('Pagamento confirmado!');
        navigate(`/payment/receipt/${orderId}`);
      } catch (error) {
        toast.error('Erro ao confirmar');
      }
    }
  };

  if (!boletoData) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-card">
            <h1>📄 Pagamento via Boleto</h1>
            <div className="installments-section">
              <label>Escolha o número de parcelas:</label>
              <select 
                value={installments} 
                onChange={(e) => setInstallments(parseInt(e.target.value))}
                className="form-control"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}x {i === 0 ? 'sem juros' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={generateBoleto} className="btn btn-primary">
              Gerar Boleto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-card">
          <h1>📄 Boleto Gerado</h1>
          <div className="boleto-info">
            <p><strong>Valor:</strong> R$ {boletoData.amount?.toFixed(2)}</p>
            <p><strong>Parcelas:</strong> {boletoData.installments}x de R$ {boletoData.installmentAmount}</p>
            <p><strong>Vencimento:</strong> {new Date(boletoData.dueDate).toLocaleDateString()}</p>
          </div>
          
          <div className="code-section">
            <label>Código de Barras:</label>
            <div className="barcode">{boletoData.boletoBarcode}</div>
            
            <label>Linha Digitável:</label>
            <textarea readOnly value={boletoData.boletoCode} rows="2" />
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

export default PaymentBoletoPage;
