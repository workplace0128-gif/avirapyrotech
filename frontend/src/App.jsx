import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin panel pages & components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Banners from './pages/Banners';
import Orders from './pages/Orders';
import Settings from './pages/Settings';

// Customer website pages & components
import CustomerLayout from './components/customer/CustomerLayout';
import Home from './pages/customer/Home';
import ProductList from './pages/customer/ProductList';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import About from './pages/customer/About';
import Contact from './pages/customer/Contact';

// Admin Protected Route security guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

// Customer Layout Wrapper to avoid redundancy
function CustomerRoute({ children }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}

function App() {
  return (
    <Router>
      <Routes>
        
        {/* ========================================== */}
        {/* PUBLIC CUSTOMER WEBSITE ROUTES             */}
        {/* ========================================== */}
        <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} />
        <Route path="/products" element={<CustomerRoute><ProductList /></CustomerRoute>} />
        <Route path="/product/:id" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
        <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
        <Route path="/order-success" element={<CustomerRoute><OrderSuccess /></CustomerRoute>} />
        <Route path="/about" element={<CustomerRoute><About /></CustomerRoute>} />
        <Route path="/contact" element={<CustomerRoute><Contact /></CustomerRoute>} />

        {/* ========================================== */}
        {/* ADMIN SECURITY & CONTROL PANEL ROUTES      */}
        {/* ========================================== */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Secure Admin Pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <ProtectedRoute>
              <Banners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop-settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/website-settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ========================================== */}
        {/* FALLBACK & REDIRECT ROUTES                 */}
        {/* ========================================== */}
        {/* Legacy redirect for old logins */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        
        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
