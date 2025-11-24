import React from 'react';
import './TermsPage.css';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <h1>Termos de Uso</h1>
        <p className="last-update">Última atualização: 22 de novembro de 2025</p>

        <section className="terms-section">
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar este site, você aceita e concorda em cumprir estes termos e condições de uso. 
            Se você não concordar com qualquer parte destes termos, não deverá usar nosso site.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Uso do Site</h2>
          <p>Você concorda em usar o site apenas para fins legais e de maneira que não infrinja os direitos de terceiros.</p>
          <ul>
            <li>Não utilizar o site para atividades ilegais ou fraudulentas</li>
            <li>Não tentar acessar áreas restritas do sistema</li>
            <li>Não compartilhar suas credenciais de acesso</li>
            <li>Manter suas informações de cadastro atualizadas</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Cadastro e Conta</h2>
          <p>
            Para realizar compras, é necessário criar uma conta fornecendo informações precisas e completas. 
            Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Produtos e Preços</h2>
          <p>
            Todos os produtos estão sujeitos à disponibilidade em estoque. Reservamo-nos o direito de limitar quantidades 
            e de recusar pedidos. Os preços podem ser alterados sem aviso prévio, mas pedidos já confirmados não serão afetados.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Pagamentos</h2>
          <p>
            Trabalhamos com gateways de pagamento seguros (MercadoPago e PayPal). O pagamento deve ser efetuado no momento da compra. 
            Não armazenamos dados completos de cartão de crédito em nossos servidores.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Entregas</h2>
          <p>
            Os prazos de entrega são estimativas e podem variar. Não nos responsabilizamos por atrasos causados pelos Correios 
            ou transportadoras. O prazo começa a contar após a confirmação do pagamento.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo do site, incluindo textos, imagens, logos e código, é protegido por direitos autorais. 
            É proibida a reprodução sem autorização prévia.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais resultantes do uso do site 
            ou da compra de produtos. Nossa responsabilidade está limitada ao valor pago pelo produto.
          </p>
        </section>

        <section className="terms-section">
          <h2>9. Modificações nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            As alterações entrarão em vigor imediatamente após a publicação no site.
          </p>
        </section>

        <section className="terms-section">
          <h2>10. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, entre em contato através do email: juridico@gameecommerce.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
