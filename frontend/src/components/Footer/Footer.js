import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Voxel</h3>
          <p>Sua loja favorita de jogos digitais com os melhores preços e promoções.</p>
        </div>
        
        <div className="footer-section">
          <h4>Links Rápidos</h4>
          <ul>
            <li><Link to="/products">Jogos</Link></li>
            <li><Link to="/about">Sobre Nós</Link></li>
            <li><Link to="/contact">Contato</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Suporte</h4>
          <ul>
            <li><Link to="/faq">Central de Ajuda</Link></li>
            <li><Link to="/terms">Termos de Uso</Link></li>
            <li><Link to="/privacy">Privacidade</Link></li>
            <li><Link to="/returns">Devoluções</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Pagamento Seguro</h4>
          <div className="payment-icons">
            {/* MercadoPago */}
            <img 
              src="https://lojaintegrada.com.br/assets/img/mercado-pago-logo.png" 
              alt="MercadoPago"
              className="payment-logo"
            />
            {/* PayPal */}
            <img 
              src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
              alt="PayPal"
              className="payment-logo"
            />
            {/* Visa */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" 
              alt="Visa"
              className="payment-logo"
            />
            {/* Mastercard */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
              alt="Mastercard"
              className="payment-logo"
            />
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Voxel. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
