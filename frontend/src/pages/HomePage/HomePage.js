import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import api from '../../services/api';
import { GridScan } from '../../components/GridScan/GridScan';
import ProductCard from '../../components/ProductCard/ProductCard';

const HomePage = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para extrair ID da categoria
  const getCategoryId = (categoryId) => {
    if (!categoryId) return null;
    return typeof categoryId === 'object' ? categoryId._id : categoryId;
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchFeaturedGames = async () => {
      try {
        // Buscar produtos featured (jogos marcados como destaque)
        const productsResponse = await api.get('/api/products?limit=100', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        const allProducts = productsResponse.data.data.products || [];
        
        // Filtrar produtos featured
        const featured = allProducts.filter(product => product.featured === true);
        
        if (featured.length >= 8) {
          if (isMounted) setFeaturedGames(featured.slice(0, 8));
        } else {
          // Se não houver featured suficientes, buscar jogos da categoria "Jogos"
          const categoriesResponse = await api.get('/api/categories?onlyMain=true', {
            signal: abortController.signal
          });
          
          if (!isMounted) return;
          
          const categories = categoriesResponse.data.data.categories || [];
          const jogosCategory = categories.find(cat => cat.name === 'Jogos');
          
          if (jogosCategory) {
            const subcatsResponse = await api.get(`/categories/${jogosCategory._id}/subcategories`, {
              signal: abortController.signal
            });
            
            if (!isMounted) return;
            
            const subcategories = subcatsResponse.data.data.categories || [];
            const subcatIds = subcategories.map(sub => sub._id);
            
            const games = allProducts.filter(product => {
              const catId = getCategoryId(product.categoryId);
              return catId && subcatIds.includes(catId);
            });
            
            if (isMounted) setFeaturedGames(games.slice(0, 8));
          } else {
            if (isMounted) setFeaturedGames(allProducts.slice(0, 8));
          }
        }
      } catch (error) {
        if (error.name === 'CanceledError') return; // Ignorar erros de cancelamento
        console.error('Erro ao carregar jogos:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeaturedGames();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  return (
    <div className="home-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <GridScan
          enableWebcam={false}
          showPreview={false}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title fade-in">
            🎮 Bem-vindo à<br />
            <span className="gradient-text">Voxel</span>
          </h1>
          <p className="hero-subtitle slide-up">
            Descubra os melhores jogos com os melhores preços
          </p>
          <Link to="/products" className="btn btn-primary btn-large pulse">
            Explorar Jogos
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">🔥 Jogos em Destaque</h2>
          
          {loading ? (
            <div className="loading-spinner">Carregando jogos...</div>
          ) : featuredGames.length === 0 ? (
            <div className="no-games">
              <h2>Nenhum jogo disponível no momento</h2>
              <p>Volte em breve para ver novos jogos!</p>
            </div>
          ) : (
            <div className="games-grid">
              {featuredGames.map(game => (
                <ProductCard key={game._id || game.id} product={game} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-40">
            <Link to="/products" className="btn btn-secondary">
              Ver Todos os Jogos
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Por que escolher a gente?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Entrega Instantânea</h3>
              <p>Receba seus jogos imediatamente após a compra</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Pagamento Seguro</h3>
              <p>MercadoPago e PayPal para sua segurança</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Melhores Preços</h3>
              <p>Promoções e descontos exclusivos</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3>Suporte 24/7</h3>
              <p>Estamos sempre prontos para ajudar</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;