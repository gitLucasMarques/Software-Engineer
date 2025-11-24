import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1>Sobre Nós</h1>
        
        <section className="about-section">
          <h2>🎮 Quem Somos</h2>
          <p>
            Somos uma loja especializada em jogos e hardware para PC e consoles, 
            oferecendo os melhores produtos para gamers de todos os níveis. 
            Desde 2025, nos dedicamos a trazer as últimas novidades do mundo gamer 
            com os melhores preços do mercado.
          </p>
        </section>

        <section className="about-section">
          <h2>🎯 Nossa Missão</h2>
          <p>
            Proporcionar a melhor experiência de compra para gamers, oferecendo 
            produtos de qualidade, atendimento excepcional e os melhores preços. 
            Queremos ser a primeira escolha quando você pensar em jogos e hardware.
          </p>
        </section>

        <section className="about-section">
          <h2>💎 Por Que Nos Escolher?</h2>
          <ul className="benefits-list">
            <li>✅ Produtos originais e de qualidade</li>
            <li>✅ Entrega rápida para todo o Brasil</li>
            <li>✅ Atendimento especializado</li>
            <li>✅ Melhores preços do mercado</li>
            <li>✅ Pagamento seguro</li>
            <li>✅ Garantia em todos os produtos</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>📦 O Que Oferecemos</h2>
          <div className="products-grid">
            <div className="product-category">
              <h3>🎮 Jogos</h3>
              <p>Para PC, PlayStation, Xbox e Nintendo</p>
            </div>
            <div className="product-category">
              <h3>🖥️ Hardware</h3>
              <p>Placas de vídeo, processadores, memória RAM e mais</p>
            </div>
            <div className="product-category">
              <h3>🎯 Consoles</h3>
              <p>PlayStation, Xbox e Nintendo Switch</p>
            </div>
            <div className="product-category">
              <h3>🖱️ Periféricos</h3>
              <p>Mouses, teclados, headsets e monitores</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
