import React from 'react';
import './PrivacyPage.css';

const PrivacyPage = () => {
  return (
    <div className="privacy-page">
      <div className="container">
        <h1>Política de Privacidade</h1>
        <p className="last-update">Última atualização: 22 de novembro de 2025</p>

        <section className="privacy-section">
          <h2>1. Informações que Coletamos</h2>
          <p>Coletamos as seguintes informações quando você usa nosso site:</p>
          <ul>
            <li><strong>Dados de cadastro:</strong> nome, email, telefone, CPF, endereço</li>
            <li><strong>Dados de navegação:</strong> páginas visitadas, produtos visualizados, tempo de permanência</li>
            <li><strong>Dados de compra:</strong> histórico de pedidos, preferências de pagamento</li>
            <li><strong>Cookies:</strong> informações armazenadas localmente para melhorar sua experiência</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>2. Como Usamos suas Informações</h2>
          <p>Utilizamos seus dados pessoais para:</p>
          <ul>
            <li>Processar e entregar seus pedidos</li>
            <li>Comunicar sobre o status de suas compras</li>
            <li>Melhorar nossos produtos e serviços</li>
            <li>Enviar ofertas e promoções (com seu consentimento)</li>
            <li>Prevenir fraudes e garantir a segurança da plataforma</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Compartilhamento de Dados</h2>
          <p>
            Seus dados podem ser compartilhados com terceiros apenas nas seguintes situações:
          </p>
          <ul>
            <li><strong>Transportadoras:</strong> para processar e entregar seus pedidos</li>
            <li><strong>Gateways de pagamento:</strong> MercadoPago e PayPal para processar transações</li>
            <li><strong>Serviços de email:</strong> para enviar notificações de pedidos</li>
            <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
          </ul>
          <p>
            <strong>Nunca vendemos seus dados pessoais para terceiros.</strong>
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. Segurança dos Dados</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
          </p>
          <ul>
            <li>Criptografia SSL/TLS em todas as transmissões</li>
            <li>Senhas armazenadas com hash bcrypt</li>
            <li>Autenticação JWT para acesso seguro</li>
            <li>Backups regulares e redundância de servidores</li>
            <li>Monitoramento contínuo de atividades suspeitas</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Seus Direitos (LGPD)</h2>
          <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul>
            <li>Confirmar se tratamos seus dados pessoais</li>
            <li>Acessar seus dados armazenados</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Revogar o consentimento para tratamento de dados</li>
            <li>Solicitar a portabilidade de dados</li>
            <li>Obter informações sobre compartilhamento de dados</li>
          </ul>
          <p>
            Para exercer esses direitos, entre em contato: privacidade@gameecommerce.com
          </p>
        </section>

        <section className="privacy-section">
          <h2>6. Cookies</h2>
          <p>
            Utilizamos cookies para melhorar sua experiência de navegação. Você pode desabilitar cookies nas 
            configurações do seu navegador, mas isso pode afetar a funcionalidade do site.
          </p>
          <p><strong>Tipos de cookies usados:</strong></p>
          <ul>
            <li><strong>Essenciais:</strong> necessários para funcionamento básico (autenticação, carrinho)</li>
            <li><strong>Funcionais:</strong> lembram preferências e configurações</li>
            <li><strong>Analíticos:</strong> coletam dados sobre uso do site (anônimos)</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>7. Retenção de Dados</h2>
          <p>
            Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, 
            ou conforme exigido por lei:
          </p>
          <ul>
            <li>Dados de cadastro: enquanto sua conta estiver ativa</li>
            <li>Histórico de compras: 5 anos (exigência fiscal)</li>
            <li>Logs de acesso: 6 meses</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>8. Menores de Idade</h2>
          <p>
            Nosso site não é direcionado a menores de 18 anos. Se você é responsável por um menor e acredita que 
            ele forneceu dados pessoais sem consentimento, entre em contato conosco.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por email 
            ou aviso no site. Recomendamos revisar esta página regularmente.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Contato</h2>
          <p>
            Para dúvidas sobre privacidade ou para exercer seus direitos:
          </p>
          <ul>
            <li><strong>Email:</strong> privacidade@gameecommerce.com</li>
            <li><strong>DPO (Encarregado de Dados):</strong> dpo@gameecommerce.com</li>
            <li><strong>Telefone:</strong> (11) 3000-0000</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
