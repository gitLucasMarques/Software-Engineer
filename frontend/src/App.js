import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import CategoryProductsPage from './pages/CategoryProductsPage/CategoryProductsPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import SearchPage from './pages/SearchPage/SearchPage';
import CategoriesPage from './pages/CategoriesPage/CategoriesPage';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage';
import WishlistPage from './pages/WishlistPage/WishlistPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage/PaymentFailurePage';
import PaymentPixPage from './pages/PaymentPixPage/PaymentPixPage';
import PaymentBoletoPage from './pages/PaymentBoletoPage/PaymentBoletoPage';
import PaymentCardPage from './pages/PaymentCardPage/PaymentCardPage';
import PaymentReceiptPage from './pages/PaymentReceiptPage/PaymentReceiptPage';
import AboutPage from './pages/AboutPage/AboutPage';
import ContactPage from './pages/ContactPage/ContactPage';
import FAQPage from './pages/FAQPage/FAQPage';
import TermsPage from './pages/TermsPage/TermsPage';
import PrivacyPage from './pages/PrivacyPage/PrivacyPage';
import ReturnsPage from './pages/ReturnsPage/ReturnsPage';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner">Carregando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category-products" element={<CategoryProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={
            <PrivateRoute>
              <WishlistPage />
            </PrivateRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/checkout" element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          
          <Route path="/orders" element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          } />
          
          <Route path="/orders/:id" element={
            <PrivateRoute>
              <OrderDetailPage />
            </PrivateRoute>
          } />
          
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/payment/pix" element={
            <PrivateRoute>
              <PaymentPixPage />
            </PrivateRoute>
          } />
          <Route path="/payment/boleto" element={
            <PrivateRoute>
              <PaymentBoletoPage />
            </PrivateRoute>
          } />
          <Route path="/payment/card" element={
            <PrivateRoute>
              <PaymentCardPage />
            </PrivateRoute>
          } />
          <Route path="/payment/receipt/:orderId" element={
            <PrivateRoute>
              <PaymentReceiptPage />
            </PrivateRoute>
          } />
          
          <Route path="/about" element={<AboutPage />} />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
