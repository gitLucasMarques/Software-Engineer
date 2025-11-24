const express = require('express');
const router = express.Router();
const PaymentCard = require('../models/paymentCard');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar cartões do usuário
router.get('/', async (req, res) => {
  try {
    const cards = await PaymentCard.find({ userId: req.user._id }).select('-cardNumber');
    
    const cardsWithMasked = cards.map(card => ({
      _id: card._id,
      cardHolderName: card.cardHolderName,
      maskedNumber: card.getMaskedCardNumber(),
      cardBrand: card.cardBrand,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      isDefault: card.isDefault,
      lastFourDigits: card.lastFourDigits
    }));
    
    res.status(200).json({
      status: 'success',
      results: cardsWithMasked.length,
      data: {
        cards: cardsWithMasked
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar cartões'
    });
  }
});

// Adicionar novo cartão
router.post('/', async (req, res) => {
  try {
    const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, setAsDefault } = req.body;
    
    console.log('📥 Recebendo requisição para salvar cartão');
    console.log('Dados recebidos:', { 
      cardNumber: cardNumber ? '****' + cardNumber.slice(-4) : 'undefined',
      cardHolderName,
      expiryMonth,
      expiryYear,
      cvv: cvv ? '***' : 'undefined',
      setAsDefault
    });
    
    // Validar CVV (não salvar, apenas validar)
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      console.log('❌ CVV inválido:', cvv);
      return res.status(400).json({
        status: 'fail',
        message: 'CVV inválido'
      });
    }
    
    // Se setAsDefault, remover default dos outros cartões
    if (setAsDefault) {
      await PaymentCard.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }
    
    console.log('🔄 Tentando criar cartão no banco...');
    const newCard = await PaymentCard.create({
      userId: req.user._id,
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardHolderName,
      expiryMonth,
      expiryYear,
      isDefault: setAsDefault || false
    });
    
    console.log('✅ Cartão criado com sucesso:', newCard._id);
    
    res.status(201).json({
      status: 'success',
      data: {
        card: {
          _id: newCard._id,
          cardHolderName: newCard.cardHolderName,
          maskedNumber: newCard.getMaskedCardNumber(),
          cardBrand: newCard.cardBrand,
          expiryMonth: newCard.expiryMonth,
          expiryYear: newCard.expiryYear,
          isDefault: newCard.isDefault
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar cartão:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Erros de validação:', messages);
      return res.status(400).json({
        status: 'fail',
        message: messages[0]
      });
    }
    
    console.error('❌ Erro genérico:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao adicionar cartão: ' + error.message
    });
  }
});

// Definir cartão como padrão
router.patch('/:id/set-default', async (req, res) => {
  try {
    // Remover default de todos os cartões do usuário
    await PaymentCard.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );
    
    // Definir o cartão selecionado como padrão
    const card = await PaymentCard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );
    
    if (!card) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cartão não encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        card: {
          _id: card._id,
          cardHolderName: card.cardHolderName,
          maskedNumber: card.getMaskedCardNumber(),
          cardBrand: card.cardBrand,
          isDefault: card.isDefault
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao definir cartão padrão'
    });
  }
});

// Deletar cartão
router.delete('/:id', async (req, res) => {
  try {
    const card = await PaymentCard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!card) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cartão não encontrado'
      });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar cartão'
    });
  }
});

module.exports = router;
