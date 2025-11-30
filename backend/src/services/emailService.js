const nodemailer = require('nodemailer');
const environment = require('../config/environment');
/**
 * Serviço de envio de emails da plataforma Voxel.
 * 
 * Configura o transporter usando nodemailer e variáveis de ambiente.
 * Oferece métodos para enviar diferentes tipos de emails:
 *  - Boas-vindas ao usuário
 *  - Confirmação de pedidos
 *  - Confirmação de pagamento
 *  - Redefinição de senha
 *  - Confirmação de alteração de senha
 *  - Atualização de status do pedido
 *  - Envio de nota fiscal
 * 
 * Cada método monta um HTML estilizado com informações específicas do usuário ou pedido.
 * Há também métodos auxiliares para traduzir status e métodos de pagamento em texto legível.
 * Logs no console ajudam a monitorar envios e erros.
 * 
 * Uso:
 * const emailService = require('./services/emailService');
 * emailService.sendWelcomeEmail(user);
 */

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verificar conexão
        this.transporter.verify((error) => {
            if (error) {
                console.error('Erro na configuração do email:', error);
            } else {
                console.log('✓ Email service pronto para enviar mensagens');
            }
        });
    }

    async sendWelcomeEmail(user) {
        try {
            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Bem-vindo à Voxel! 🎮',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🎮 Bem-vindo à Voxel!</h1>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                <p>Obrigado por se cadastrar na nossa plataforma! Estamos muito felizes em tê-lo conosco.</p>
                                <p>Agora você pode:</p>
                                <ul>
                                    <li>🎯 Explorar centenas de jogos incríveis</li>
                                    <li>🛒 Adicionar jogos ao seu carrinho</li>
                                    <li>💳 Realizar compras seguras</li>
                                    <li>⭐ Avaliar e comentar sobre jogos</li>
                                    <li>📦 Acompanhar seus pedidos</li>
                                </ul>
                                <center>
                                    <a href="${environment.FRONTEND_URL}/products" class="button">
                                        Começar a Comprar
                                    </a>
                                </center>
                                <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                                <p>Este é um email automático, por favor não responda.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Email de boas-vindas enviado para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar email de boas-vindas:', error);
            return { success: false, error: error.message };
        }
    }

    async sendOrderConfirmation(user, order) {
        try {
            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Pedido #${order.id} - Confirmação de Recebimento 📦`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                            .order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                            .total { font-size: 18px; font-weight: bold; color: #667eea; }
                            .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>✓ Pedido Confirmado!</h1>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                <p>Recebemos seu pedido com sucesso e ele está sendo processado.</p>
                                
                                <div class="order-info">
                                    <h3>Detalhes do Pedido #${order.id}</h3>
                                    <div class="order-row">
                                        <span>Status:</span>
                                        <span><strong>${this.getStatusLabel(order.status)}</strong></span>
                                    </div>
                                    <div class="order-row">
                                        <span>Data:</span>
                                        <span>${new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div class="order-row">
                                        <span>Endereço de Entrega:</span>
                                        <span>${order.shippingAddress}</span>
                                    </div>
                                    <div class="order-row total">
                                        <span>Total:</span>
                                        <span>R$ ${parseFloat(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <p>Você receberá atualizações por email sobre o status do seu pedido.</p>
                                
                                <center>
                                    <a href="${environment.FRONTEND_URL}/orders/${order.id}" class="button">
                                        Ver Detalhes do Pedido
                                    </a>
                                </center>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Confirmação de pedido enviada para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar confirmação de pedido:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPaymentConfirmation(user, order, payment) {
        try {
            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Pagamento Confirmado - Pedido #${order.id} 💳`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .payment-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                            .success-badge { background: #38ef7d; color: white; padding: 10px 20px; 
                                            border-radius: 20px; display: inline-block; margin: 10px 0; }
                            .button { display: inline-block; padding: 12px 30px; background: #11998e; 
                                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>✓ Pagamento Confirmado!</h1>
                                <div class="success-badge">Aprovado</div>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                <p>Seu pagamento foi processado com sucesso! 🎉</p>
                                
                                <div class="payment-info">
                                    <h3>Informações do Pagamento</h3>
                                    <p><strong>Pedido:</strong> #${order.id}</p>
                                    <p><strong>Método:</strong> ${this.getPaymentMethodLabel(payment.paymentMethod)}</p>
                                    <p><strong>Valor:</strong> R$ ${parseFloat(payment.amount).toFixed(2)}</p>
                                    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                                    ${payment.transactionId ? `<p><strong>ID da Transação:</strong> ${payment.transactionId}</p>` : ''}
                                </div>

                                <p>Seu pedido está sendo preparado para envio. Você receberá um novo email assim que for enviado.</p>
                                
                                <center>
                                    <a href="${environment.FRONTEND_URL}/orders/${order.id}" class="button">
                                        Acompanhar Pedido
                                    </a>
                                </center>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Confirmação de pagamento enviada para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar confirmação de pagamento:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordReset(user, resetToken) {
        try {
            const resetUrl = `${environment.FRONTEND_URL}/reset-password/${resetToken}`;
            
            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Redefinição de Senha - Voxel 🔐',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                            .button { display: inline-block; padding: 12px 30px; background: #f5576c; 
                                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔐 Redefinição de Senha</h1>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                                
                                <div class="alert">
                                    <strong>⚠️ Atenção:</strong> Se você não solicitou esta redefinição, ignore este email. 
                                    Sua senha permanecerá inalterada.
                                </div>

                                <p>Para criar uma nova senha, clique no botão abaixo:</p>
                                
                                <center>
                                    <a href="${resetUrl}" class="button">
                                        Redefinir Senha
                                    </a>
                                </center>

                                <p>Ou copie e cole este link no seu navegador:</p>
                                <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                                    ${resetUrl}
                                </p>

                                <p><strong>Este link expira em 1 hora.</strong></p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Email de reset de senha enviado para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar email de reset de senha:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordResetEmail(user, resetToken) {
        return this.sendPasswordReset(user, resetToken);
    }

    async sendPasswordChangedEmail(user) {
        try {
            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Senha Alterada com Sucesso - Voxel 🔒',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .alert { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔒 Senha Alterada</h1>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                
                                <div class="alert">
                                    <strong>✓ Sucesso!</strong> Sua senha foi alterada com sucesso.
                                </div>

                                <p>Sua senha foi recentemente alterada em ${new Date().toLocaleString('pt-BR')}.</p>
                                
                                <p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>

                                <p>Por segurança, recomendamos:</p>
                                <ul>
                                    <li>Não compartilhar sua senha com ninguém</li>
                                    <li>Usar uma senha forte e única</li>
                                    <li>Alterar sua senha regularmente</li>
                                </ul>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Email de confirmação de alteração de senha enviado para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar email de confirmação:', error);
            return { success: false, error: error.message };
        }
    }

    async sendOrderStatusUpdate(user, order) {
        try {
            const statusMessages = {
                pending: 'Seu pedido foi recebido e está aguardando processamento',
                processing: 'Seu pedido está sendo processado',
                shipped: 'Seu pedido foi enviado',
                delivered: 'Seu pedido foi entregue',
                cancelled: 'Seu pedido foi cancelado'
            };

            const statusIcons = {
                pending: '⏳',
                processing: '📦',
                shipped: '🚚',
                delivered: '✅',
                cancelled: '❌'
            };

            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Atualização do Pedido #${order.id} - ${this.getStatusLabel(order.status)}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .status-badge { font-size: 48px; margin: 20px 0; }
                            .status-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                            .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Atualização do Pedido</h1>
                                <div class="status-badge">${statusIcons[order.status]}</div>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                <p>Há uma atualização sobre o seu pedido #${order.id}.</p>
                                
                                <div class="status-info">
                                    <h3>Status Atual: ${this.getStatusLabel(order.status)}</h3>
                                    <p>${statusMessages[order.status]}</p>
                                    <p><strong>Última atualização:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                                </div>

                                ${order.status === 'shipped' ? `
                                    <p>Seu pedido foi enviado! Em breve você receberá seus jogos.</p>
                                ` : ''}

                                ${order.status === 'delivered' ? `
                                    <p>🎉 Seu pedido foi entregue! Esperamos que aproveite seus jogos!</p>
                                ` : ''}
                                
                                <center>
                                    <a href="${environment.FRONTEND_URL}/orders/${order.id}" class="button">
                                        Ver Detalhes do Pedido
                                    </a>
                                </center>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Atualização de status enviada para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar atualização de status:', error);
            return { success: false, error: error.message };
        }
    }

    async sendInvoice(user, order) {
        try {
            const mailOptions = {
                from: `"Voxel" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Nota Fiscal - Pedido #${order.id} 📄`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .invoice { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                            .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>📄 Nota Fiscal</h1>
                            </div>
                            <div class="content">
                                <h2>Olá, ${user.name}!</h2>
                                <p>Segue em anexo a nota fiscal do seu pedido #${order.id}.</p>
                                
                                <div class="invoice">
                                    <h3>Informações da Nota Fiscal</h3>
                                    <p><strong>Número do Pedido:</strong> ${order.id}</p>
                                    <p><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Valor Total:</strong> R$ ${parseFloat(order.totalAmount).toFixed(2)}</p>
                                </div>

                                <p>Guarde esta nota fiscal para seus registros.</p>
                                
                                <center>
                                    <a href="${environment.FRONTEND_URL}/orders/${order.id}/invoice" class="button">
                                        Baixar Nota Fiscal
                                    </a>
                                </center>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✓ Nota fiscal enviada para: ${user.email}`);
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar nota fiscal:', error);
            return { success: false, error: error.message };
        }
    }

    // Métodos auxiliares
    getStatusLabel(status) {
        const labels = {
            pending: 'Pendente',
            processing: 'Em Processamento',
            shipped: 'Enviado',
            delivered: 'Entregue',
            cancelled: 'Cancelado'
        };
        return labels[status] || status;
    }

    getPaymentMethodLabel(method) {
        const labels = {
            credit_card: 'Cartão de Crédito',
            debit_card: 'Cartão de Débito',
            boleto: 'Boleto Bancário',
            pix: 'PIX',
            mercadopago: 'Mercado Pago',
            paypal: 'PayPal'
        };
        return labels[method] || method;
    }
}

module.exports = new EmailService();