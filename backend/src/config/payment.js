const dotenv = require('dotenv');
const mercadopago = require('mercadopago');
const paypal = require('@paypal/checkout-server-sdk');

dotenv.config();

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const configurePayPal = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID and secret are required.');
  }

  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
};

const paypalClient = configurePayPal();

module.exports = { mercadopago, paypalClient, paypal };