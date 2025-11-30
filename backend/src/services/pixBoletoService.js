const crypto = require('crypto');

/**
 * Gera um código PIX (QR Code) simulado para pagamento
 * Em produção, você integraria com um gateway de pagamento real
 */
exports.generatePixCode = (orderId, amount, userEmail) => {
  // Dados do beneficiário (em produção, estes viriam da sua conta no banco)
  const pixData = {
    version: '01',
    merchantName: 'Voxel',
    merchantCity: 'SAO PAULO',
    merchantCategoryCode: '5734', // Código MCC para lojas de software
    transactionId: orderId,
    amount: amount.toFixed(2),
    pixKey: process.env.PIX_KEY || '+5511999999999',
    timestamp: new Date().toISOString()
  };

  // Gerar código PIX (formato EMV - em produção use biblioteca específica)
  const pixCode = generateEMVCode(pixData);
  
  // Gerar QR Code texto (que será usado para gerar a imagem no frontend)
  const qrCodeText = pixCode;
  
  // Calcular tempo de expiração (30 minutos)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);
  
  return {
    pixCode: qrCodeText,
    qrCodeText: qrCodeText,
    amount: pixData.amount,
    expiresAt: expiresAt,
    transactionId: orderId,
    instructions: [
      '1. Abra o aplicativo do seu banco',
      '2. Acesse a área PIX',
      '3. Escolha "Pagar com QR Code"',
      '4. Escaneie o código ou copie e cole',
      '5. Confirme o pagamento',
      'Após o pagamento, o pedido será processado automaticamente'
    ]
  };
};

/**
 * Gera código de barras de boleto simulado
 * Em produção, você integraria com um gateway de pagamento real
 */
exports.generateBoleto = (orderId, amount, dueDate, userInfo) => {
  // Gerar número do boleto (linha digitável)
  const bankCode = '001'; // Banco do Brasil (exemplo)
  const currencyCode = '9';
  const dueDateFactor = calculateDueDateFactor(dueDate);
  const amountFormatted = amount.toFixed(2).replace('.', '').padStart(10, '0');
  
  // Gerar campos do boleto
  const field1 = `${bankCode}${currencyCode}${generateRandomDigits(5)}`;
  const field2 = generateRandomDigits(10);
  const field3 = generateRandomDigits(10);
  const field4 = calculateCheckDigit(field1 + field2 + field3);
  const field5 = `${dueDateFactor}${amountFormatted}`;
  
  // Linha digitável completa
  const digitableLine = `${field1}.${field2.slice(0, 5)} ${field2.slice(5)}.${field3.slice(0, 5)} ${field3.slice(5)}.${field4} ${field5}`;
  
  // Código de barras (44 dígitos)
  const barcode = `${bankCode}${currencyCode}${field4}${dueDateFactor}${amountFormatted}${field1.slice(3)}${field2}${field3}`;
  
  return {
    digitableLine: digitableLine,
    barcode: barcode,
    dueDate: dueDate,
    amount: amount.toFixed(2),
    beneficiary: {
      name: 'Voxel LTDA',
      document: '12.345.678/0001-90',
      address: 'Rua Exemplo, 123 - São Paulo, SP'
    },
    payer: {
      name: userInfo.name,
      email: userInfo.email,
      address: userInfo.address || 'Não informado'
    },
    instructions: [
      `- Não receber após ${formatDate(dueDate)}`,
      '- Em caso de dúvidas, entre em contato com nossa central',
      '- Após o pagamento, o pedido será processado em até 2 dias úteis'
    ],
    transactionId: orderId
  };
};

/**
 * Processa pagamento com cartão de crédito/débito
 * Em produção, você integraria com um gateway de pagamento real
 */
exports.processCardPayment = async (cardData, amount, installments, userId, orderId) => {
  // Validar dados do cartão
  if (!cardData.cardNumber || !cardData.cvv || !cardData.expiryMonth || !cardData.expiryYear) {
    throw new Error('Dados do cartão incompletos');
  }
  
  // Validar CVV
  if (!/^\d{3,4}$/.test(cardData.cvv)) {
    throw new Error('CVV inválido');
  }
  
  // Validar validade do cartão
  const currentDate = new Date();
  const expiryDate = new Date(parseInt('20' + cardData.expiryYear), parseInt(cardData.expiryMonth) - 1);
  
  if (expiryDate < currentDate) {
    throw new Error('Cartão expirado');
  }
  
  // Calcular valor das parcelas
  const installmentAmount = (amount / installments).toFixed(2);
  
  // Simular processamento do pagamento (em produção, chamar gateway)
  // Para teste, considerar aprovado se os últimos 4 dígitos não forem '0000'
  const lastFourDigits = cardData.cardNumber.slice(-4);
  const isApproved = lastFourDigits !== '0000';
  
  // Gerar transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  return {
    success: isApproved,
    transactionId: transactionId,
    authorizationCode: isApproved ? generateAuthCode() : null,
    installments: installments,
    installmentAmount: installmentAmount,
    totalAmount: amount.toFixed(2),
    cardBrand: detectCardBrand(cardData.cardNumber),
    lastFourDigits: lastFourDigits,
    message: isApproved ? 'Pagamento aprovado com sucesso' : 'Pagamento recusado. Verifique os dados do cartão',
    orderId: orderId
  };
};

// ===== FUNÇÕES AUXILIARES =====

function generateEMVCode(data) {
  // Simplificado - em produção use biblioteca de geração EMV adequada
  const payload = `00020126580014br.gov.bcb.pix0136${data.pixKey}52040000530398654${data.amount.padStart(2, '0')}5802BR5913${data.merchantName}6009${data.merchantCity}62070503***6304`;
  
  // Calcular CRC16
  const crc = calculateCRC16(payload);
  return payload + crc;
}

function calculateCRC16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function calculateDueDateFactor(dueDate) {
  const baseDate = new Date('1997-10-07');
  const days = Math.floor((dueDate - baseDate) / (1000 * 60 * 60 * 24));
  return days.toString().padStart(4, '0');
}

function generateRandomDigits(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function calculateCheckDigit(str) {
  // Módulo 11
  let sum = 0;
  let multiplier = 2;
  
  for (let i = str.length - 1; i >= 0; i--) {
    sum += parseInt(str[i]) * multiplier;
    multiplier = multiplier === 9 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 0 || remainder === 1 ? 1 : 11 - remainder;
  
  return checkDigit.toString();
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function generateAuthCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function detectCardBrand(cardNumber) {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const firstDigit = cleanNumber[0];
  const firstTwoDigits = cleanNumber.slice(0, 2);
  
  if (firstDigit === '4') return 'visa';
  if (parseInt(firstTwoDigits) >= 51 && parseInt(firstTwoDigits) <= 55) return 'mastercard';
  if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'amex';
  if (firstTwoDigits === '38' || firstTwoDigits === '60') return 'hipercard';
  
  return 'visa';
}
