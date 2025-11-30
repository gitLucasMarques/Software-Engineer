const express = require('express');
const router = express.Router();
const PaymentCard = require('../models/paymentCard');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware global: todas as rotas abaixo exigem usuário autenticado.
router.use(authMiddleware);


// =============================
// LISTAR CARTÕES DO USUÁRIO
// =============================
router.get('/', async (req, res) => {
  try {
    // Busca os cartões e oculta o número real criptografado
    const cards = await PaymentCard.find({ userId: req.user._id }).select('-cardNumber');

    // Retorna sempre número mascarado, nunca real
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
      data: { cards: cardsWithMasked }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar cartões'
    });
  }
});


// =============================
// ADICIONAR NOVO CARTÃO
// =============================
router.post('/', async (req, res) => {
  try {
    const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, setAsDefault } = req.body;

    // CVV nunca é salvo — apenas validado nesta etapa.
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({
        status: 'fail',
        message: 'CVV inválido'
      });
    }

    // Se marcado como "padrão", remove o status dos outros cartões do usuário
    if (setAsDefault) {
      await PaymentCard.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }

    // A criptografia e detecção de bandeira são feitas automaticamente no schema
    const newCard = await PaymentCard.create({
      userId: req.user._id,
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardHolderName,
      expiryMonth,
      expiryYear,
      isDefault: setAsDefault || false
    });

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

    // Tratamento amigável de erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'fail',
        message: messages[0]
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erro ao adicionar cartão: ' + error.message
    });
  }
});


// =============================
// DEFINIR CARTÃO COMO PADRÃO
// =============================
router.patch('/:id/set-default', async (req, res) => {
  try {
    // Remove o "padrão" de todos os cartões do usuário
    await PaymentCard.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );

    // Marca o cartão solicitado
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


// =============================
// DELETAR CARTÃO
// =============================
router.delete('/:id', async (req, res) => {
  try {
    // Segurança: só deleta cartões do próprio usuário
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

    // 204 → sucesso sem retorno
    res.status(204).send();

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar cartão'
    });
  }
});

module.exports = router;
