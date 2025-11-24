import React, { useState } from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: '📦 Pedidos e Entregas',
      questions: [
        {
          q: 'Qual o prazo de entrega?',
          a: 'O prazo varia de acordo com sua região: Sul e Sudeste: 3-7 dias úteis, Centro-Oeste e Nordeste: 5-10 dias úteis, Norte: 7-15 dias úteis. O prazo começa a contar após a confirmação do pagamento.'
        },
        {
          q: 'Como acompanhar meu pedido?',
          a: 'Acesse "Meus Pedidos" no seu perfil. Lá você encontra o status atualizado e código de rastreamento assim que o produto for despachado.'
        },
        {
          q: 'Posso alterar o endereço de entrega?',
          a: 'Sim, mas apenas antes do produto ser despachado. Entre em contato com nossa equipe o quanto antes através do WhatsApp ou email.'
        }
      ]
    },
    {
      category: '💳 Pagamentos',
      questions: [
        {
          q: 'Quais formas de pagamento são aceitas?',
          a: 'Aceitamos: Cartão de crédito (Visa, Mastercard, Elo), PIX, Boleto bancário e PayPal. Pagamentos via cartão e PIX são aprovados instantaneamente.'
        },
        {
          q: 'Quando o pagamento é processado?',
          a: 'PIX e cartão de crédito: aprovação instantânea. Boleto: até 2 dias úteis após o pagamento. PayPal: aprovação imediata.'
        },
        {
          q: 'É seguro comprar no site?',
          a: 'Sim! Usamos criptografia SSL e os pagamentos são processados pelos gateways MercadoPago e PayPal, que são certificados e seguros.'
        }
      ]
    },
    {
      category: '🔄 Trocas e Devoluções',
      questions: [
        {
          q: 'Qual o prazo para devolução?',
          a: 'Você tem até 7 dias após o recebimento para solicitar devolução, conforme o Código de Defesa do Consumidor. O produto deve estar lacrado e sem sinais de uso.'
        },
        {
          q: 'Como solicitar uma troca?',
          a: 'Acesse "Meus Pedidos", selecione o pedido e clique em "Solicitar Troca/Devolução". Nossa equipe analisará e entrará em contato em até 24h.'
        },
        {
          q: 'Quem paga o frete da devolução?',
          a: 'Se o produto estiver com defeito ou não corresponder ao anunciado, nós pagamos. Se for por desistência, o frete fica por conta do cliente.'
        }
      ]
    },
    {
      category: '🎮 Produtos',
      questions: [
        {
          q: 'Os jogos são originais?',
          a: 'Sim! Todos os nossos jogos e produtos são 100% originais e adquiridos diretamente de distribuidores oficiais.'
        },
        {
          q: 'Os produtos têm garantia?',
          a: 'Sim! Hardware tem garantia do fabricante (geralmente 1-3 anos). Jogos e periféricos seguem a garantia legal de 90 dias.'
        },
        {
          q: 'Posso pré-encomendar jogos?',
          a: 'Sim! Quando disponibilizamos pré-vendas, você pode garantir seu jogo antes do lançamento oficial.'
        }
      ]
    },
    {
      category: '👤 Conta',
      questions: [
        {
          q: 'Como criar uma conta?',
          a: 'Clique em "Cadastrar" no menu superior, preencha seus dados e pronto! Você receberá um email de confirmação.'
        },
        {
          q: 'Esqueci minha senha, e agora?',
          a: 'Na tela de login, clique em "Esqueci minha senha". Você receberá um email com instruções para redefinir.'
        },
        {
          q: 'Como atualizar meus dados?',
          a: 'Acesse "Meu Perfil" e clique em "Editar Perfil". Lá você pode alterar nome, email, senha e endereços.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="container">
        <h1>Perguntas Frequentes</h1>
        <p className="subtitle">Encontre respostas rápidas para as dúvidas mais comuns</p>

        <div className="faq-categories">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2>{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((item, qIndex) => {
                  const index = `${catIndex}-${qIndex}`;
                  const isOpen = openIndex === index;
                  
                  return (
                    <div key={qIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                      <button
                        className="faq-question"
                        onClick={() => toggleQuestion(catIndex, qIndex)}
                      >
                        <span>{item.q}</span>
                        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="faq-answer">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h2>Não encontrou sua resposta?</h2>
          <p>Entre em contato com nossa equipe de suporte!</p>
          <a href="/contact" className="btn btn-primary">
            Fale Conosco
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
