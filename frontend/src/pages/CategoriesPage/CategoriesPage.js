import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchMainCategories = async () => {
      try {
        const response = await api.get('/api/categories?onlyMain=true', {
          signal: abortController.signal
        });
        
        if (!isMounted) return;
        
        setMainCategories(response.data.data.categories || []);
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Erro ao carregar categorias:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMainCategories();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      const response = await api.get(`/categories/${category._id}/subcategories`);
      setSubcategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSubcategories([]);
  };

  const handleSubcategoryClick = (subcategoryId, mainCategoryName) => {
    // Se for uma subcategoria de Jogos, vai para /products (página de jogos)
    if (mainCategoryName === 'Jogos') {
      navigate(`/products?category=${subcategoryId}`);
    } else {
      // Para outras categorias (Componentes, Acessórios, Consoles), vai para página genérica
      navigate(`/category-products?category=${subcategoryId}`);
    }
  };

  const categoryIcons = {
    'Jogos': '🎮',
    'Componentes': '🖥️',
    'Consoles': '🎯',
    'Acessórios': '🖱️',
    // Subcategorias de Jogos
    'Ação e Aventura': '⚔️',
    'FPS e Shooter': '🎯',
    'RPG': '🎲',
    'Estratégia': '♟️',
    'Esportes': '⚽',
    'Terror': '👻',
    'Indie': '🎨',
    'Multiplayer': '👥',
    'Simulação': '✈️',
    // Subcategorias de Componentes
    'Placas de Vídeo': '🎮',
    'Processadores': '🖥️',
    'Memória RAM': '💾',
    'Armazenamento': '💿',
    'Placas-Mãe': '🔌',
    'Fontes': '🔋',
    'Gabinetes': '📦',
    // Subcategorias de Consoles
    'PlayStation': '🎮',
    'Xbox': '🎮',
    'Nintendo': '🎮',
    // Subcategorias de Acessórios
    'Teclados': '⌨️',
    'Mouses': '🖱️',
    'Headsets': '🎧',
    'Controles': '🎮',
    'Monitores': '🖥️',
    'Cadeiras': '🪑'
  };

  if (loading && mainCategories.length === 0) {
    return (
      <div className="categories-page">
        <div className="container">
          <div className="loading-spinner">Carregando categorias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container">
        {!selectedCategory ? (
          <>
            <h1>Categorias</h1>
            <p className="subtitle">Explore nossos produtos por categoria</p>
            
            <div className="categories-grid">
              {mainCategories.map(category => (
                <div 
                  key={category._id} 
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-icon">
                    {categoryIcons[category.name] || '📦'}
                  </div>
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Veja todos os produtos desta categoria'}</p>
                  <div className="category-arrow">→</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button className="back-button" onClick={handleBack}>
              ← Voltar para categorias principais
            </button>
            
            <h1>{selectedCategory.name}</h1>
            <p className="subtitle">{selectedCategory.description}</p>
            
            {loading ? (
              <div className="loading-spinner">Carregando subcategorias...</div>
            ) : subcategories.length === 0 ? (
              <div className="no-subcategories">
                <p>Nenhuma subcategoria disponível no momento.</p>
              </div>
            ) : (
              <div className="categories-grid">
                {subcategories.map(subcat => (
                  <div 
                    key={subcat._id} 
                    className="category-card subcategory-card"
                    onClick={() => handleSubcategoryClick(subcat._id, selectedCategory.name)}
                  >
                    <div className="category-icon">
                      {categoryIcons[subcat.name] || '📦'}
                    </div>
                    <h3>{subcat.name}</h3>
                    <p>{subcat.description || 'Ver produtos'}</p>
                    <div className="category-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
