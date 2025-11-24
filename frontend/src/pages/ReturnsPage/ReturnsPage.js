import React from 'react';
import { Link } from 'react-router-dom';
import './ReturnsPage.css';

const ReturnsPage = () => {
  return (
    <div className="returns-page">
      <div className="container">
        <h1>Política de Trocas e Devoluções</h1>
        
        <div className="highlight-box">
          <h3>📦 Prazo de 7 Dias</h3>
          <p>Você tem 7 dias corridos, a partir do recebimento, para solicitar troca ou devolução (Código de Defesa do Consumidor, Art. 49).</p>
        </div>

        <section className="returns-section">
          <h2>1. Condições para Troca ou Devolução</h2>
          <p>Aceitamos trocas e devoluções nas seguintes condições:</p>
          <ul>
            <li>Produto na embalagem original, sem sinais de uso</li>
            <li>Lacres e etiquetas intactos</li>
            <li>Acompanhado de nota fiscal e todos os acessórios</li>
            <li>Solicitação feita dentro do prazo de 7 dias</li>
          </ul>
          <div className="warning-box">
            <p><strong>⚠️ Importante:</strong> Produtos digitais (chaves de jogos, gift cards) não podem ser trocados ou devolvidos após o recebimento do código.</p>
          </div>
        </section>

        <section className="returns-section">
          <h2>2. Como Solicitar Troca ou Devolução</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>Acesse Meus Pedidos</h3>
                <p>Entre na sua conta e acesse a seção "Meus Pedidos"</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Solicite a Troca/Devolução</h3>
                <p>Clique no pedido desejado e selecione "Solicitar Troca/Devolução"</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Preencha o Formulário</h3>
                <p>Informe o motivo e aguarde aprovação (até 2 dias úteis)</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h3>Envie o Produto</h3>
                <p>Após aprovação, envie pelos Correios com código de rastreamento</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">5</span>
              <div className="step-content">
                <h3>Receba seu Reembolso</h3>
                <p>Após análise, processamos o reembolso em até 7 dias úteis</p>
              </div>
            </div>
          </div>
        </section>

        <section className="returns-section">
          <h2>3. Motivos para Troca ou Devolução</h2>
          <div className="reasons-grid">
            <div className="reason-card">
              <h4>🔄 Arrependimento</h4>
              <p>Mudou de ideia? Sem problema! Você pode devolver dentro de 7 dias.</p>
              <span className="cost">Frete: por sua conta</span>
            </div>
            <div className="reason-card">
              <h4>📦 Produto com Defeito</h4>
              <p>Produto apresentou defeito de fabricação ou veio com problemas.</p>
              <span className="cost free">Frete: grátis</span>
            </div>
            <div className="reason-card">
              <h4>❌ Produto Errado</h4>
              <p>Recebeu um produto diferente do que foi pedido.</p>
              <span className="cost free">Frete: grátis</span>
            </div>
            <div className="reason-card">
              <h4>📉 Produto Danificado</h4>
              <p>Embalagem chegou violada ou produto danificado no transporte.</p>
              <span className="cost free">Frete: grátis</span>
            </div>
          </div>
        </section>

        <section className="returns-section">
          <h2>4. Reembolso</h2>
          <p>O reembolso será processado da seguinte forma:</p>
          <ul>
            <li><strong>Cartão de Crédito:</strong> estorno em até 2 faturas (dependendo da operadora)</li>
            <li><strong>PIX:</strong> reembolso em até 7 dias úteis na conta cadastrada</li>
            <li><strong>Boleto:</strong> reembolso em até 10 dias úteis via transferência bancária</li>
          </ul>
          <p className="note">
            O prazo começa a contar após a análise e aprovação do produto devolvido. 
            O valor do frete não é reembolsado em casos de arrependimento.
          </p>
        </section>

        <section className="returns-section">
          <h2>5. Trocas</h2>
          <p>
            Para trocas por outro produto (tamanho, cor, modelo), seguimos o mesmo procedimento. 
            O novo produto será enviado após recebermos e analisarmos o item devolvido.
          </p>
          <p>
            <strong>Diferença de valor:</strong> Se o novo produto tiver valor diferente, você será 
            notificado para realizar o pagamento adicional ou receberá o reembolso da diferença.
          </p>
        </section>

        <section className="returns-section">
          <h2>6. Produtos Fora do Prazo</h2>
          <p>
            Produtos com defeito identificado após o prazo de 7 dias devem ser tratados através da 
            <strong> garantia do fabricante</strong>. Entre em contato conosco para orientações sobre 
            como acionar a garantia.
          </p>
        </section>

        <section className="returns-section">
          <h2>7. Dúvidas?</h2>
          <p>
            Se você tiver dúvidas sobre trocas e devoluções, nossa equipe está pronta para ajudar:
          </p>
          <div className="contact-options">
            <div className="contact-option">
              <span>📧</span>
              <div>
                <strong>Email</strong>
                <p>trocas@gameecommerce.com</p>
              </div>
            </div>
            <div className="contact-option">
              <span>📞</span>
              <div>
                <strong>Telefone</strong>
                <p>(11) 3000-0000</p>
              </div>
            </div>
            <div className="contact-option">
              <span>💬</span>
              <div>
                <strong>WhatsApp</strong>
                <p>(11) 99999-9999</p>
              </div>
            </div>
          </div>
          <Link to="/faq" className="faq-link">
            Ver Perguntas Frequentes sobre Devoluções →
          </Link>
        </section>
      </div>
    </div>
  );
};

export default ReturnsPage;
