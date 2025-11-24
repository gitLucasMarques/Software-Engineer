import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Responderemos em breve.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="container">
        <h1>Fale Conosco</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>📞 Entre em Contato</h2>
            
            <div className="info-item">
              <h3>📧 Email</h3>
              <p>contato@gameecommerce.com</p>
              <p>suporte@gameecommerce.com</p>
            </div>

            <div className="info-item">
              <h3>📱 Telefone</h3>
              <p>(11) 3000-0000</p>
              <p>WhatsApp: (11) 99999-9999</p>
            </div>

            <div className="info-item">
              <h3>🕒 Horário de Atendimento</h3>
              <p>Segunda a Sexta: 9h às 18h</p>
              <p>Sábado: 9h às 13h</p>
              <p>Domingo: Fechado</p>
            </div>

            <div className="info-item">
              <h3>📍 Endereço</h3>
              <p>Rua dos Gamers, 123</p>
              <p>São Paulo - SP</p>
              <p>CEP: 01234-567</p>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>✉️ Envie sua Mensagem</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Assunto *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um assunto</option>
                  <option value="duvida">Dúvida sobre produto</option>
                  <option value="pedido">Acompanhar pedido</option>
                  <option value="troca">Troca/Devolução</option>
                  <option value="pagamento">Problema com pagamento</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Mensagem *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
