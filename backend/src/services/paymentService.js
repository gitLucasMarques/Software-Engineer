/**
 * Serviço de Pagamento Simulado
 * 
 * Este módulo gerencia toda a lógica de pagamentos simulados.
 * Suporta PIX, Boleto, Cartão de Crédito e Cartão de Débito.
 * Todos os pagamentos são processados de forma simulada para ambiente de desenvolvimento.
 */

const Payment = require('../models/payment');
const Order = require('../models/order');
const { Cart } = require('../models/cart');
const pixBoletoService = require('./pixBoletoService');
const PaymentCard = require('../models/paymentCard');

class PaymentService {
  /**
   * Gera comprovante/nota fiscal da compra
   */
  async generateReceipt(order, payment) {
    const receipt = {
      // Informações do Documento
      tipo: 'COMPROVANTE DE PAGAMENTO',
      numero: `NF-${order._id.toString().slice(-8).toUpperCase()}`,
      serie: '001',
      dataEmissao: new Date().toISOString(),
      dataVencimento: payment.paymentDetails?.dueDate || null,
      
      // Informações da Empresa
      empresa: {
        razaoSocial: 'VOXEL GAMES LTDA',
        nomeFantasia: 'Voxel',
        cnpj: '12.345.678/0001-90',
        inscricaoEstadual: '123.456.789.012',
        endereco: 'Rua dos Games, 1234 - Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        telefone: '(11) 3456-7890',
        email: 'contato@voxelgames.com.br'
      },
      
      // Informações do Cliente
      cliente: {
        nome: order.shippingAddress.fullName,
        email: order.shippingAddress.email,
        telefone: order.shippingAddress.phone,
        endereco: order.shippingAddress.address,
        cidade: order.shippingAddress.city,
        estado: order.shippingAddress.state,
        cep: order.shippingAddress.zipCode
      },
      
      // Informações do Pedido
      pedido: {
        id: order._id,
        data: order.createdAt,
        status: order.status,
        observacoes: order.notes || 'Nenhuma observação'
      },
      
      // Produtos
      produtos: order.items.map((item, index) => ({
        item: index + 1,
        codigo: item.productId._id,
        descricao: item.productId.name,
        quantidade: item.quantity,
        valorUnitario: item.price.toFixed(2),
        valorTotal: (item.price * item.quantity).toFixed(2)
      })),
      
      // Totais
      totais: {
        subtotal: order.totalAmount.toFixed(2),
        desconto: '0.00',
        frete: '0.00',
        total: order.totalAmount.toFixed(2)
      },
      
      // Informações de Pagamento
      pagamento: {
        metodo: this.getPaymentMethodName(payment.paymentMethod),
        status: this.getPaymentStatusName(payment.status),
        transactionId: payment.transactionId,
        valor: payment.amount.toFixed(2),
        dataPagamento: payment.status === 'paid' ? new Date().toISOString() : null,
        detalhes: this.formatPaymentDetails(payment)
      },
      
      // Informações Adicionais
      observacoes: [
        'Este documento é um comprovante de pagamento',
        'Guarde este documento para consultas futuras',
        'Em caso de dúvidas, entre em contato conosco',
        'Prazo de entrega: 5 a 10 dias úteis'
      ],
      
      // Metadados
      metadata: {
        geradoEm: new Date().toISOString(),
        versao: '1.0.0',
        hash: this.generateReceiptHash(order._id, payment._id)
      }
    };
    
    return receipt;
  }

  /**
   * Gera hash único para o comprovante
   */
  generateReceiptHash(orderId, paymentId) {
    const crypto = require('crypto');
    const data = `${orderId}-${paymentId}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16).toUpperCase();
  }

  /**
   * Formata nome do método de pagamento
   */
  getPaymentMethodName(method) {
    const methods = {
      'pix': 'PIX',
      'boleto': 'Boleto Bancário',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito'
    };
    return methods[method] || method;
  }

  /**
   * Formata nome do status de pagamento
   */
  getPaymentStatusName(status) {
    const statuses = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'failed': 'Falhou',
      'refunded': 'Reembolsado'
    };
    return statuses[status] || status;
  }

  /**
   * Formata detalhes específicos do pagamento
   */
  formatPaymentDetails(payment) {
    const details = {};
    
    switch (payment.paymentMethod) {
      case 'pix':
        details.codigoPix = payment.paymentDetails?.pixCode || 'N/A';
        details.expiraEm = payment.paymentDetails?.expiresAt || 'N/A';
        break;
        
      case 'boleto':
        details.linhaDigitavel = payment.paymentDetails?.digitableLine || 'N/A';
        details.codigoBarras = payment.paymentDetails?.barcode || 'N/A';
        details.vencimento = payment.paymentDetails?.dueDate || 'N/A';
        details.parcelas = payment.paymentDetails?.installments || 1;
        break;
        
      case 'credit_card':
      case 'debit_card':
        details.bandeira = payment.paymentDetails?.cardBrand || 'N/A';
        details.finalCartao = payment.paymentDetails?.lastFourDigits || 'N/A';
        details.autorizacao = payment.paymentDetails?.authorizationCode || 'N/A';
        if (payment.paymentMethod === 'credit_card') {
          details.parcelas = payment.paymentDetails?.installments || 1;
          details.valorParcela = payment.paymentDetails?.installmentAmount || '0.00';
        }
        break;
    }
    
    return details;
  }

  /**
   * Processa pagamento PIX
   */
  async processPixPayment(order) {
    try {
      console.log('🔵 [PIX] Processando pagamento para pedido:', order._id);
      
      // Gerar código PIX
      const pixData = pixBoletoService.generatePixCode(
        order._id.toString(),
        order.totalAmount,
        order.userId.email || order.shippingAddress.email
      );

      // Criar registro de pagamento
      const payment = await Payment.findOneAndUpdate(
        { orderId: order._id },
        {
          orderId: order._id,
          userId: order.userId._id || order.userId,
          amount: order.totalAmount,
          paymentMethod: 'pix',
          status: 'pending',
          transactionId: pixData.transactionId,
          paymentDetails: {
            pixCode: pixData.pixCode,
            qrCodeText: pixData.qrCodeText,
            expiresAt: pixData.expiresAt,
            instructions: pixData.instructions
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log('✅ [PIX] Pagamento criado:', payment._id);

      return {
        payment,
        pixData
      };
    } catch (error) {
      console.error('❌ [PIX] Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Processa pagamento via Boleto
   */
  async processBoletoPayment(order, installments = 1) {
    try {
      console.log('🔵 [BOLETO] Processando pagamento para pedido:', order._id);
      
      // Calcular data de vencimento
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);

      // Informações do pagador
      const payerInfo = {
        name: order.shippingAddress.fullName,
        email: order.shippingAddress.email,
        address: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.state}, CEP: ${order.shippingAddress.zipCode}`
      };

      // Gerar boleto
      const boletoData = pixBoletoService.generateBoleto(
        order._id.toString(),
        order.totalAmount,
        dueDate,
        payerInfo
      );

      // Criar registro de pagamento
      const payment = await Payment.findOneAndUpdate(
        { orderId: order._id },
        {
          orderId: order._id,
          userId: order.userId._id || order.userId,
          amount: order.totalAmount,
          paymentMethod: 'boleto',
          status: 'pending',
          transactionId: boletoData.transactionId,
          paymentDetails: {
            digitableLine: boletoData.digitableLine,
            barcode: boletoData.barcode,
            dueDate: boletoData.dueDate,
            installments: installments,
            beneficiary: boletoData.beneficiary,
            payer: boletoData.payer,
            instructions: boletoData.instructions
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log('✅ [BOLETO] Pagamento criado:', payment._id);

      return {
        payment,
        boletoData
      };
    } catch (error) {
      console.error('❌ [BOLETO] Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Processa pagamento com cartão (crédito ou débito)
   */
  async processCardPayment(order, cardData, installments = 1, paymentType = 'credit') {
    try {
      console.log(`🔵 [${paymentType.toUpperCase()}] Processando pagamento para pedido:`, order._id);
      
      // Processar pagamento do cartão
      const paymentResult = await pixBoletoService.processCardPayment(
        cardData,
        order.totalAmount,
        installments,
        order.userId._id || order.userId,
        order._id.toString()
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message);
      }

      // Criar registro de pagamento
      const payment = await Payment.findOneAndUpdate(
        { orderId: order._id },
        {
          orderId: order._id,
          userId: order.userId._id || order.userId,
          amount: order.totalAmount,
          paymentMethod: paymentType === 'credit' ? 'credit_card' : 'debit_card',
          status: 'paid',
          transactionId: paymentResult.transactionId,
          paymentDetails: {
            authorizationCode: paymentResult.authorizationCode,
            installments: installments,
            installmentAmount: paymentResult.installmentAmount,
            cardBrand: paymentResult.cardBrand,
            lastFourDigits: paymentResult.lastFourDigits
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Atualizar status do pedido
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.paymentMethod = paymentType === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito';
      await order.save();

      // Limpar carrinho
      await Cart.findOneAndUpdate(
        { userId: order.userId._id || order.userId },
        { items: [] }
      );

      console.log(`✅ [${paymentType.toUpperCase()}] Pagamento aprovado:`, payment._id);

      return {
        payment,
        paymentResult
      };
    } catch (error) {
      console.error(`❌ [${paymentType.toUpperCase()}] Erro ao processar pagamento:`, error);
      throw error;
    }
  }

  /**
   * Simula aprovação de pagamento (PIX ou Boleto)
   */
  async simulatePaymentApproval(orderId, userId) {
    try {
      console.log('🔵 [SIMULATE] Simulando aprovação para pedido:', orderId);
      
      const order = await Order.findById(orderId).populate('items.productId');
      
      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      if (order.userId.toString() !== userId.toString()) {
        throw new Error('Acesso negado a este pedido');
      }

      // Atualizar pagamento
      const payment = await Payment.findOneAndUpdate(
        { orderId: order._id },
        { status: 'paid' },
        { new: true }
      );

      // Atualizar pedido
      order.paymentStatus = 'paid';
      order.status = 'processing';
      await order.save();

      // Limpar carrinho
      await Cart.findOneAndUpdate(
        { userId: userId },
        { items: [] }
      );

      // Gerar comprovante
      const receipt = await this.generateReceipt(order, payment);

      console.log('✅ [SIMULATE] Pagamento aprovado com sucesso');

      return {
        payment,
        order,
        receipt
      };
    } catch (error) {
      console.error('❌ [SIMULATE] Erro ao simular aprovação:', error);
      throw error;
    }
  }

  /**
   * Salva cartão do usuário
   */
  async saveUserCard(userId, cardData, isDefault = false) {
    try {
      console.log('🔵 [CARD] Salvando cartão para usuário:', userId);
      
      // Se for cartão padrão, desmarcar todos os outros
      if (isDefault) {
        await PaymentCard.updateMany(
          { userId: userId },
          { isDefault: false }
        );
      }

      // Criar novo cartão
      const card = await PaymentCard.create({
        userId: userId,
        cardNumber: cardData.cardNumber,
        cardHolderName: cardData.cardHolderName,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cardBrand: this.detectCardBrand(cardData.cardNumber),
        isDefault: isDefault
      });

      console.log('✅ [CARD] Cartão salvo:', card._id);

      return card;
    } catch (error) {
      console.error('❌ [CARD] Erro ao salvar cartão:', error);
      throw error;
    }
  }

  /**
   * Detecta bandeira do cartão
   */
  detectCardBrand(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const firstDigit = cleanNumber[0];
    const firstTwoDigits = cleanNumber.slice(0, 2);
    
    if (firstDigit === '4') return 'visa';
    if (parseInt(firstTwoDigits) >= 51 && parseInt(firstTwoDigits) <= 55) return 'mastercard';
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'amex';
    if (firstTwoDigits === '38' || firstTwoDigits === '60') return 'hipercard';
    if (firstTwoDigits === '50' || (parseInt(firstTwoDigits) >= 56 && parseInt(firstTwoDigits) <= 69)) return 'elo';
    
    return 'visa';
  }

  /**
   * Busca cartões do usuário
   */
  async getUserCards(userId) {
    try {
      const cards = await PaymentCard.find({ userId: userId }).sort({ isDefault: -1, createdAt: -1 });
      return cards;
    } catch (error) {
      console.error('❌ [CARD] Erro ao buscar cartões:', error);
      throw error;
    }
  }

  /**
   * Remove cartão do usuário
   */
  async deleteUserCard(userId, cardId) {
    try {
      const card = await PaymentCard.findOneAndDelete({ _id: cardId, userId: userId });
      
      if (!card) {
        throw new Error('Cartão não encontrado');
      }

      console.log('✅ [CARD] Cartão removido:', cardId);
      return card;
    } catch (error) {
      console.error('❌ [CARD] Erro ao remover cartão:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();