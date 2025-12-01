const { MercadoPagoConfig, Payment } = require('mercadopago');

// Inicializa o cliente do Mercado Pago com o access token
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

const payment = new Payment(client);

class PaymentService {
  async createPayment(paymentData) {
    try {
      const response = await payment.create({
        body: {
          transaction_amount: paymentData.transaction_amount,
          description: paymentData.description,
          payment_method_id: paymentData.payment_method_id,
          payer: {
            email: paymentData.payer.email,
            first_name: paymentData.payer.first_name,
            last_name: paymentData.payer.last_name,
            identification: {
              type: paymentData.payer.identification.type,
              number: paymentData.payer.identification.number
            }
          },
          token: paymentData.token,
          installments: paymentData.installments,
          notification_url: paymentData.notification_url,
          external_reference: paymentData.external_reference
        }
      });

      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  async getPayment(paymentId) {
    try {
      const response = await payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      throw error;
    }
  }

  async refundPayment(paymentId) {
    try {
      const response = await payment.refund({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Erro ao reembolsar pagamento:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId) {
    try {
      const response = await payment.cancel({ id: paymentId });
      return response;
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();