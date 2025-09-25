import React, { useState } from "react";

const initialProducts = [
  { id: 1, name: "Minecraft", price: 110.0, image: "https://http2.mlstatic.com/D_NQ_NP_2X_954325-MLB54972665736_042023-F.webp" },
  { id: 2, name: "God of War: Ragnarok", price: 239.9, image: "https://http2.mlstatic.com/D_NQ_NP_2X_954325-MLB54972665736_042023-F.webp" },
  { id: 3, name: "Horizon", price: 239.9, image: "https://http2.mlstatic.com/D_NQ_NP_2X_954325-MLB54972665736_042023-F.webp" },
];

function Home() {
  const [products] = useState(initialProducts);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="header-content">
          <h1>Game Store 🎮</h1>

          <input
            id="search"
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div id="cart">🛒 {cartCount}</div>
        </div>
      </header>

      {/* Lista de produtos */}
      <section id="products">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product">
            <img src={product.image} alt={product.name} />
            <h2>{product.name}</h2>
            <p>Preço: R$ {product.price.toFixed(2)}</p>
            <button onClick={addToCart}>Comprar</button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
