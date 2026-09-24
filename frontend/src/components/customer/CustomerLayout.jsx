import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, MessageSquare, MapPin, Clock, Sparkles } from 'lucide-react';
import api from '../../api';

export default function CustomerLayout({ children }) {
  const [settings, setSettings] = useState({
    shop_name: 'AVIRA PYROTECH',
    phone_number: '8610315901, 9092180927',
    whatsapp_number: '8610315901',
    email: 'info@avirapyrotech.com',
    address: '112, Paraipatti, Sattur Road, Sivakasi - 626189',
    business_hours: '9:00 AM - 8:00 PM',
    footer_text: 'Premium Sivakasi Fireworks & Crackers',
    copyright_text: '© 2026 Avira Pyrotech. All Rights Reserved.'
  });

  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Load cart count from localStorage
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQty);
    } catch (e) {
      setCartCount(0);
    }
  };

  // Fetch shop settings
  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    updateCartCount();

    // Listen for custom events to sync cart count when items are added
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  // Listen to path changes to close mobile menu and update cart count
  useEffect(() => {
    setMobileMenuOpen(false);
    updateCartCount();
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-red-700 to-orange-600 text-white text-xs font-bold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-1.5 shrink-0">
        <Sparkles size={12} className="animate-pulse" />
        <span>Direct Sivakasi Crackers Delivery! Call or WhatsApp us to place custom orders directly.</span>
      </div>

      {/* 2. STICKY NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-150 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo brand */}
          <Link to="/" className="flex items-center select-none">
            <img src="/logo.png" alt="Avira Pyrotech" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-bold tracking-wide transition-colors ${
                  location.pathname === link.path
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Cart and Menu Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-955 rounded-xl transition-all"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. MOBILE DRAWER NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <aside className="w-72 bg-white h-full flex flex-col p-6 shadow-2xl relative animate-slide-left">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-800 rounded-lg cursor-pointer"
            >
              <X size={22} />
            </button>

            {/* Logo */}
            <div className="flex items-center mb-8 mt-2">
              <img src="/logo.png" alt="Avira Pyrotech" className="h-12 w-auto object-contain" />
            </div>

            {/* Nav list */}
            <nav className="flex-1 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-md font-bold py-2 border-b border-gray-55 transition-colors ${
                    location.pathname === link.path
                      ? 'text-red-600 border-red-100'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Contact quick cards */}
            <div className="border-t border-gray-100 pt-6 space-y-4 text-xs font-semibold text-gray-500">
              {settings.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-red-600" />
                  <span>{settings.phone_number}</span>
                </div>
              )}
              {settings.business_hours && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  <span>{settings.business_hours}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* 4. PUBLIC PAGE CONTENT OUTLET */}
      <main className="flex-1">
        {children}
      </main>

      {/* 5. PUBLIC WEBSITE FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Avira Pyrotech" className="h-14 w-auto object-contain brightness-200" />
            </div>
            <p className="text-gray-400 text-xs leading-relaxed font-semibold">
              {settings.footer_text}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">Admin Console</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4">Contact Info</h4>
            {(settings.phone_number || '8610315901, 9092180927') && (
              <div className="text-xs text-gray-400 leading-relaxed font-semibold flex items-start gap-2">
                <Phone size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  {(settings.phone_number || '8610315901, 9092180927').split(',').map((num, idx) => (
                    <a
                      key={idx}
                      href={`tel:${num.trim().replace(/\s+/g, '')}`}
                      className="hover:text-white transition-colors"
                    >
                      {num.trim()}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {settings.whatsapp_number && (
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-2">
                <MessageSquare size={16} className="text-green-500 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {settings.whatsapp_number}
                </a>
              </p>
            )}
            {settings.address && (
              <p className="text-xs text-gray-400 leading-relaxed font-semibold flex items-start gap-2">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
            )}
            {settings.business_hours && (
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-2">
                <Clock size={16} className="text-orange-500 shrink-0" />
                <span>{settings.business_hours}</span>
              </p>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto pt-6 text-center text-xs text-gray-500 font-semibold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p>{settings.copyright_text}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/admin/login" className="hover:text-gray-400 transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>

      {/* 6. FLOATING DOCK ACTIONS FOR DIRECT CHATS (CALL / WHATSAPP) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Floating Call Button */}
        {settings.phone_number && (
          <a
            href={`tel:${settings.phone_number.split(',')[0].replace(/\s+/g, '')}`}
            className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Call Us Now"
          >
            <Phone size={22} />
          </a>
        )}

        {/* Floating WhatsApp Button */}
        {settings.whatsapp_number && (
          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="WhatsApp Chat"
          >
            <MessageSquare size={22} />
          </a>
        )}
      </div>

    </div>
  );
}
