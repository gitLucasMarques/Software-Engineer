import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './PaymentCardPage.css';

const PaymentCardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentType = 'credit' } = location.state || {}; // credit or debit
  
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: false
  });

  useEffect(() => {
    if (!orderId) {
      toast.error('Pedido não encontrado');
      navigate('/cart');
      return;
    }

    fetchSavedCards();
  }, [orderId]);

  const fetchSavedCards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cards');
      const cards = response.data.data.cards || [];
      setSavedCards(cards);
      
      // Selecionar cartão padrão automaticamente
      const defaultCard = cards.find(c => c.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard._id);
      } else if (cards.length === 0) {
        setUseNewCard(true);
      }
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
      setUseNewCard(true); // Se não conseguir buscar, usar novo cartão
    } finally {
      setLoading(false);
    }
  };

  const handleCardDataChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    if (name === 'expiryMonth' || name === 'expiryYear') {
      value = value.replace(/\D/g, '');
    }
    
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData({
      ...cardData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateCardData = () => {
    if (useNewCard) {
      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv } = cardData;
      
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Número do cartão inválido');
        return false;
      }
      
      if (!cardHolderName) {
        toast.error('Nome do titular é obrigatório');
        return false;
      }
      
      const month = parseInt(expiryMonth);
      if (!month || month < 1 || month > 12) {
        toast.error('Mês de validade inválido');
        return false;
      }
      
      const year = parseInt(expiryYear);
      const currentYear = new Date().getFullYear() % 100;
      if (!year || year < currentYear) {
        toast.error('Ano de validade inválido');
        return false;
      }
      
      if (!cvv || cvv.length < 3) {
        toast.error('CVV inválido');
        return false;
      }
    } else {
      if (!selectedCard) {
        toast.error('Selecione um cartão');
        return false;
      }
      
      if (!cardData.cvv || cardData.cvv.length < 3) {
        toast.error('CVV é obrigatório');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCardData()) {
      return;
    }
    
    try {
      setProcessing(true);
      
      const payload = {
        orderId,
        installments,
        paymentType
      };
      
      if (useNewCard) {
        payload.cardData = {
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          cardHolderName: cardData.cardHolderName,
          expiryMonth: cardData.expiryMonth.padStart(2, '0'),
          expiryYear: cardData.expiryYear,
          cvv: cardData.cvv
        };
        
        // Salvar o cartão automaticamente para uso futuro
        console.log('🔄 Tentando salvar cartão automaticamente...');
        try {
          const cardToSave = {
            cardNumber: payload.cardData.cardNumber,
            cardHolderName: payload.cardData.cardHolderName,
            expiryMonth: payload.cardData.expiryMonth,
            expiryYear: payload.cardData.expiryYear,
            cvv: payload.cardData.cvv,
            setAsDefault: savedCards.length === 0
          };
          console.log('📤 Dados do cartão a salvar:', { ...cardToSave, cardNumber: '****', cvv: '***' });
          
          const saveResponse = await api.post('/api/cards', cardToSave);
          console.log('✅ Cartão salvo com sucesso!', saveResponse.data);
          toast.success('Cartão salvo para futuras compras!');
          
          // Atualizar lista de cartões salvos
          await fetchSavedCards();
        } catch (error) {
          console.error('❌ Erro ao salvar cartão:', error);
          console.error('Detalhes do erro:', error.response?.data);
          toast.warn('Não foi possível salvar o cartão, mas o pagamento continuará');
          // Continuar com o pagamento mesmo se não salvar
        }
      } else {
        payload.cardId = selectedCard;
        payload.cvv = cardData.cvv;
      }
      
      const response = await api.post('/api/payments/card/create', payload);
      
      if (response.data.status === 'success') {
        toast.success('Pagamento aprovado!');
        
        // Limpar carrinho
        await api.delete('/api/cart').catch(() => {});
        
        // Redirecionar para comprovante
        navigate(`/payment/receipt/${orderId}`, {
          state: {
            paymentMethod: paymentType === 'credit' ? 'credit_card' : 'debit_card',
            paymentResult: response.data.data.paymentResult,
            orderId
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error(error.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const maxInstallments = paymentType === 'credit' ? 12 : 1;

  if (loading) {
    return (
      <div className="payment-card-page">
        <div className="container">
          <div className="loading-spinner">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-card-page">
      <div className="container">
        <div className="payment-card-container">
          <div className="payment-header">
            <div className="payment-icon">
              {paymentType === 'credit' ? '💳' : '💳'}
            </div>
            <h1>Pagamento com Cartão {paymentType === 'credit' ? 'de Crédito' : 'de Débito'}</h1>
            <p className="payment-subtitle">
              {paymentType === 'credit' ? 'Parcelamento em até 12x sem juros' : 'Débito à vista'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            {/* Seleção de Cartão Salvo ou Novo */}
            {savedCards.length > 0 && (
              <div className="card-selection-section">
                <h3>Selecionar Cartão</h3>
                
                <div className="saved-cards-list">
                  {savedCards.map((card) => (
                    <div 
                      key={card._id}
                      className={`saved-card-item ${selectedCard === card._id && !useNewCard ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCard(card._id);
                        setUseNewCard(false);
                      }}
                    >
                      <div className="card-icon">💳</div>
                      <div className="card-info">
                        <p className="card-number">{card.maskedNumber}</p>
                        <p className="card-holder">{card.cardHolderName}</p>
                        <p className="card-brand">{card.cardBrand.toUpperCase()}</p>
                      </div>
                      {card.isDefault && <span className="badge-default">Padrão</span>}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-new-card"
                  onClick={() => {
                    setUseNewCard(true);
                    setSelectedCard(null);
                  }}
                >
                  ➕ Usar Novo Cartão
                </button>
              </div>
            )}

            {/* Formulário de Novo Cartão */}
            {useNewCard && (
              <div className="new-card-form">
                <h3>Dados do Cartão</h3>
                
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardData.cardNumber}
                    onChange={handleCardDataChange}
                    placeholder="0000 0000 0000 0000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nome do Titular</label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={cardData.cardHolderName}
                    onChange={handleCardDataChange}
                    placeholder="Como está no cartão"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Validade</label>
                    <div className="expiry-inputs">
                      <input
                        type="text"
                        name="expiryMonth"
                        value={cardData.expiryMonth}
                        onChange={handleCardDataChange}
                        placeholder="MM"
                        maxLength="2"
                        required
                      />
                      <span>/</span>
                      <input
                        type="text"
                        name="expiryYear"
                        value={cardData.expiryYear}
                        onChange={handleCardDataChange}
                        placeholder="AA"
                        maxLength="2"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardDataChange}
                      placeholder="000"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>

                <div className="form-check">
                  <input
                    type="checkbox"
                    id="saveCard"
                    name="saveCard"
                    checked={cardData.saveCard}
                    onChange={handleCardDataChange}
                  />
                  <label htmlFor="saveCard">
                    Salvar cartão para compras futuras
                  </label>
                </div>
              </div>
            )}

            {/* CVV para Cartão Salvo */}
            {!useNewCard && selectedCard && (
              <div className="cvv-section">
                <label>CVV de Segurança</label>
                <input
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardDataChange}
                  placeholder="000"
                  maxLength="4"
                  required
                />
                <small>Por segurança, o CVV não é salvo</small>
              </div>
            )}

            {/* Seleção de Parcelas */}
            {paymentType === 'credit' && (
              <div className="installments-section">
                <label>Número de Parcelas</label>
                <select 
                  value={installments} 
                  onChange={(e) => setInstallments(parseInt(e.target.value))}
                >
                  {[...Array(maxInstallments)].map((_, i) => {
                    const numInstallments = i + 1;
                    return (
                      <option key={numInstallments} value={numInstallments}>
                        {numInstallments}x sem juros
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate('/checkout')}
                disabled={processing}
              >
                Voltar
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={processing}
              >
                {processing ? 'Processando...' : `Pagar Agora`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentCardPage;
