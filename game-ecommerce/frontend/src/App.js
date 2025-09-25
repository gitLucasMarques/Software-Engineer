import React from "react";
import { Routes, Route } from "react-router-dom";

// Páginas
import Home from "./pages/home";
// você pode criar depois Login.js, Cart.js, Product.js etc.

function App() {
  return (
    <div>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<Home />} />

        {/* Exemplo de rotas futuras */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/cart" element={<Cart />} /> */}
        {/* <Route path="/product/:id" element={<Product />} /> */}
      </Routes>
    </div>
  );
}

export default App;
