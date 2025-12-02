import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import './PaymentCardPage.css';

const PaymentCardPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();
  const cardType = location.state?.cardType || 'credit_card';
  
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [installments, setInstallments] = useState(1);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });

  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    try {
      const res = await api.get('/api/payments/cards');
      console.log('Cartões carregados:', res.data);
      setSavedCards(res.data.data.cards || []);
    } catch (error) {
      console.error('Erro ao carregar cartões', error);
      // Não bloquear o usuário, permitir cadastro de novo cartão
      setSavedCards([]);
    }
  };

  const handleCardChange = (e) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

  const processPayment = async (e) => {
    e.preventDefault();
    
    try {
      const paymentData = {
        orderId,
        cardType,
        installments: cardType === 'debit_card' ? 1 : installments
      };

      if (selectedCard) {
        paymentData.cardId = selectedCard;
        console.log('Usando cartão salvo:', selectedCard);
      } else {
        // Validar campos do novo cartão
        if (!newCard.cardNumber || newCard.cardNumber.length < 13) {
          toast.error('Número do cartão inválido');
          return;
        }
        if (!newCard.cardHolderName) {
          toast.error('Nome do titular é obrigatório');
          return;
        }
        if (!newCard.expiryMonth || !newCard.expiryYear) {
          toast.error('Data de validade é obrigatória');
          return;
        }
        if (!newCard.cvv || newCard.cvv.length < 3) {
          toast.error('CVV é obrigatório (3 ou 4 dígitos)');
          return;
        }
        
        paymentData.newCard = newCard;
        console.log('Enviando novo cartão:', { ...newCard, cvv: '***' });
      }

      console.log('Dados do pagamento:', { ...paymentData, newCard: paymentData.newCard ? { ...paymentData.newCard, cvv: '***' } : undefined });
      const res = await api.post('/api/payments/card/create', paymentData);
      console.log('Resposta do pagamento:', res.data);
      toast.success('Pagamento processado!');
      // Atualizar carrinho para refletir que foi limpo
      await fetchCart();
      navigate(`/payment/receipt/${orderId}`);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      console.error('Resposta do erro:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao processar pagamento');
    }
  };

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-card">
          <h1>💳 Pagamento com Cartão {cardType === 'credit_card' ? 'de Crédito' : 'de Débito'}</h1>
          
          <form onSubmit={processPayment}>
            {/* Cartões Salvos */}
            {savedCards.length > 0 && !showNewCardForm && (
              <div className="saved-cards-section">
                <h3>Cartões Salvos</h3>
                {savedCards.map(card => (
                  <label key={card._id} className="card-option">
                    <input
                      type="radio"
                      name="savedCard"
                      value={card._id}
                      checked={selectedCard === card._id}
                      onChange={() => setSelectedCard(card._id)}
                    />
                    <div className="card-info">
                      <span className="card-brand">{card.cardBrand}</span>
                      <span className="card-number">{card.getMaskedCardNumber || `**** ${card.lastFourDigits}`}</span>
                    </div>
                  </label>
                ))}
                <button 
                  type="button" 
                  onClick={() => {
                    setShowNewCardForm(true);
                    setSelectedCard(null);
                  }}
                  className="btn btn-link"
                >
                  + Usar novo cartão
                </button>
              </div>
            )}

            {/* Formulário Novo Cartão */}
            {(savedCards.length === 0 || showNewCardForm) && (
              <div className="new-card-form">
                <h3>Novo Cartão</h3>
                <div className="form-group">
                  <label>Número do Cartão *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={newCard.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nome no Cartão *</label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={newCard.cardHolderName}
                    onChange={handleCardChange}
                    placeholder="NOME COMO NO CARTÃO"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mês *</label>
                    <input
                      type="text"
                      name="expiryMonth"
                      value={newCard.expiryMonth}
                      onChange={handleCardChange}
                      placeholder="MM"
                      maxLength="2"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Ano *</label>
                    <input
                      type="text"
                      name="expiryYear"
                      value={newCard.expiryYear}
                      onChange={handleCardChange}
                      placeholder="AA"
                      maxLength="2"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={newCard.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={newCard.isDefault}
                      onChange={(e) => setNewCard({...newCard, isDefault: e.target.checked})}
                    />
                    Salvar cartão para futuras compras
                  </label>
                </div>
                {savedCards.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setShowNewCardForm(false)}
                    className="btn btn-link"
                  >
                    ← Voltar para cartões salvos
                  </button>
                )}
              </div>
            )}

            {/* Parcelas (apenas para crédito) */}
            {cardType === 'credit_card' && (
              <div className="installments-section">
                <label>Parcelar em:</label>
                <select 
                  value={installments} 
                  onChange={(e) => setInstallments(parseInt(e.target.value))}
                  className="form-control"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}x sem juros
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="actions">
              <button type="submit" className="btn btn-primary">
                Finalizar Pagamento
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/checkout')} 
                className="btn btn-secondary"
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentCardPage;
