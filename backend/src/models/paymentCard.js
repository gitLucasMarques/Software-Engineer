const mongoose = require('mongoose');
const crypto = require('crypto');

// Schema que armazena cartões de crédito do usuário,
// com validações para número, nome, validade e bandeira.
const paymentCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Número do cartão — validado e depois criptografado no middleware.
  cardNumber: {
    type: String,
    required: [true, 'Número do cartão é obrigatório'],
    validate: {
      validator: function(v) {
        return /^\d{16}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Número de cartão inválido'
    }
  },

  // Nome do titular (sempre salvo em caixa alta)
  cardHolderName: {
    type: String,
    required: [true, 'Nome do titular é obrigatório'],
    uppercase: true,
    trim: true
  },

  // Validade do cartão (mês)
  expiryMonth: {
    type: String,
    required: [true, 'Mês de validade é obrigatório'],
    validate: {
      validator: function(v) {
        const month = parseInt(v);
        return month >= 1 && month <= 12;
      },
      message: 'Mês inválido'
    }
  },

  // Validade do cartão (ano) — aceita formato 25 ou 2025
  expiryYear: {
    type: String,
    required: [true, 'Ano de validade é obrigatório'],
    validate: {
      validator: function(v) {
        const year = parseInt(v);
        const currentYear = new Date().getFullYear();
        const currentYearShort = currentYear % 100;

        if (v.length === 2) return year >= currentYearShort && year <= 99;
        if (v.length === 4) return year >= currentYear && year <= currentYear + 20;
        return false;
      },
      message: 'Ano inválido'
    }
  },

  // Bandeira detectada automaticamente caso não seja enviada
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'elo', 'hipercard', 'discover']
  },

  // Define se é o cartão padrão do usuário
  isDefault: {
    type: Boolean,
    default: false
  },

  // Últimos quatro dígitos (armazenados para exibição)
  lastFourDigits: {
    type: String
  }
}, {
  timestamps: true
});

// Middleware executado antes de salvar:
// - extrai últimos 4 dígitos
// - detecta bandeira
// - criptografa o número real do cartão
paymentCardSchema.pre('save', function(next) {
  if (this.isModified('cardNumber')) {
    const cleanNumber = this.cardNumber.replace(/\s/g, '');
    this.lastFourDigits = cleanNumber.slice(-4);

    if (!this.cardBrand) {
      this.cardBrand = detectCardBrand(cleanNumber);
    }

    this.cardNumber = encryptCardNumber(cleanNumber);
  }
  next();
});

// Método de acesso: retorna o número real descriptografado
paymentCardSchema.methods.getDecryptedCardNumber = function() {
  return decryptCardNumber(this.cardNumber);
};

// Retorna um formato seguro: **** **** **** 1234
paymentCardSchema.methods.getMaskedCardNumber = function() {
  return `**** **** **** ${this.lastFourDigits}`;
};

// Detecta a bandeira do cartão a partir dos dígitos iniciais
function detectCardBrand(cardNumber) {
  const firstDigit = cardNumber[0];
  const firstTwoDigits = cardNumber.slice(0, 2);
  const firstFourDigits = cardNumber.slice(0, 4);

  if (firstDigit === '4') return 'visa';
  if (parseInt(firstTwoDigits) >= 51 && parseInt(firstTwoDigits) <= 55) return 'mastercard';
  if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'amex';
  if (firstTwoDigits === '38' || firstTwoDigits === '60') return 'hipercard';
  if (['4011', '4312', '4389', '5041'].includes(firstFourDigits)) return 'elo';
  if (firstTwoDigits === '65' || firstFourDigits === '6011') return 'discover';

  return 'visa'; // fallback
}

// Criptografia simples (AES-256-CBC)
// — Em produção, um KEY mais robusto deve ser usado
function encryptCardNumber(cardNumber) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.CARD_ENCRYPTION_KEY || 'mysecretkey12345mysecretkey12345', 'utf-8').slice(0, 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

// Processo reverso para descriptografar o cartão
function decryptCardNumber(encryptedData) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.CARD_ENCRYPTION_KEY || 'mysecretkey12345mysecretkey12345', 'utf-8').slice(0, 32);

  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = mongoose.model('PaymentCard', paymentCardSchema);
