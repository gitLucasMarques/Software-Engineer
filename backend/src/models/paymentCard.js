const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: [true, 'Número do cartão é obrigatório'],
    validate: {
      validator: function(v) {
        // Validação básica de cartão (deve ter 16 dígitos)
        return /^\d{16}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Número de cartão inválido'
    }
  },
  cardHolderName: {
    type: String,
    required: [true, 'Nome do titular é obrigatório'],
    uppercase: true,
    trim: true
  },
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
  expiryYear: {
    type: String,
    required: [true, 'Ano de validade é obrigatório'],
    validate: {
      validator: function(v) {
        const year = parseInt(v);
        const currentYear = new Date().getFullYear();
        const currentYearShort = currentYear % 100;
        
        // Aceitar tanto ano completo (2025) quanto curto (25)
        if (v.length === 2) {
          return year >= currentYearShort && year <= 99;
        } else if (v.length === 4) {
          return year >= currentYear && year <= currentYear + 20;
        }
        return false;
      },
      message: 'Ano inválido'
    }
  },
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'elo', 'hipercard', 'discover']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  lastFourDigits: {
    type: String
  }
}, {
  timestamps: true
});

// Middleware para mascarar o número do cartão antes de salvar
paymentCardSchema.pre('save', function(next) {
  if (this.isModified('cardNumber')) {
    // Salvar apenas os últimos 4 dígitos
    const cleanNumber = this.cardNumber.replace(/\s/g, '');
    this.lastFourDigits = cleanNumber.slice(-4);
    
    // Detectar bandeira do cartão
    if (!this.cardBrand) {
      this.cardBrand = detectCardBrand(cleanNumber);
    }
    
    // Encriptar o número do cartão (para produção, use uma chave secreta forte)
    this.cardNumber = encryptCardNumber(cleanNumber);
  }
  next();
});

// Método para descriptografar o número do cartão (use com cuidado!)
paymentCardSchema.methods.getDecryptedCardNumber = function() {
  return decryptCardNumber(this.cardNumber);
};

// Método para obter número mascarado
paymentCardSchema.methods.getMaskedCardNumber = function() {
  return `**** **** **** ${this.lastFourDigits}`;
};

// Função auxiliar para detectar a bandeira do cartão
function detectCardBrand(cardNumber) {
  const firstDigit = cardNumber[0];
  const firstTwoDigits = cardNumber.slice(0, 2);
  const firstFourDigits = cardNumber.slice(0, 4);
  
  if (firstDigit === '4') return 'visa';
  if (parseInt(firstTwoDigits) >= 51 && parseInt(firstTwoDigits) <= 55) return 'mastercard';
  if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'amex';
  if (firstTwoDigits === '38' || firstTwoDigits === '60') return 'hipercard';
  if (firstFourDigits === '4011' || firstFourDigits === '4312' || 
      firstFourDigits === '4389' || firstFourDigits === '5041') return 'elo';
  if (firstTwoDigits === '65' || firstFourDigits === '6011') return 'discover';
  
  return 'visa'; // Default
}

// Função para encriptar o número do cartão (simplificada - em produção use crypto adequado)
function encryptCardNumber(cardNumber) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.CARD_ENCRYPTION_KEY || 'mysecretkey12345mysecretkey12345', 'utf-8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Função para descriptografar o número do cartão
function decryptCardNumber(encryptedData) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.CARD_ENCRYPTION_KEY || 'mysecretkey12345mysecretkey12345', 'utf-8').slice(0, 32);
  
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = mongoose.model('PaymentCard', paymentCardSchema);
