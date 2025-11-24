import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Voxel</h1>
        </Link>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar jogos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        <nav className="nav">
          <Link to="/products">Jogos</Link>
          <Link to="/categories">Categorias</Link>
          
          {user ? (
            <>
              <Link to="/wishlist">❤️ Favoritos</Link>
              <Link to="/cart" className="cart-link">
                🛒 Carrinho {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              <Link to="/orders">📦 Meus Pedidos</Link>
              <Link to="/profile">👤 Perfil</Link>
              <button onClick={logout} className="logout-btn">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
