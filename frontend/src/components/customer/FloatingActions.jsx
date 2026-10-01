import React, { useState, useEffect } from 'react';
import { MessageSquare, ShoppingBag, ArrowUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FloatingActions({ whatsappNumber = "8610315901" }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerFireworks = () => {
    sessionStorage.setItem('aviraTriggerFireworks', 'true');
    window.location.reload();
  };

  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^\d]/g, '') : '918610315901';
  const fullWaNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
  const whatsappUrl = `https://wa.me/${fullWaNumber}?text=${encodeURIComponent(
    "Hi Avira Pyrotech, I would like to enquire about Sivakasi crackers price list and bulk orders."
  )}`;

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none select-none">
      {/* Replay Fireworks Mini Action */}
      <button
        onClick={triggerFireworks}
        title="Replay Fireworks Show"
        aria-label="Replay Fireworks Show"
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/90 hover:bg-black text-amber-300 text-xs font-bold shadow-lg border border-amber-400/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Sparkles size={14} className="text-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Fireworks Show</span>
      </button>

      {/* Quick Price List Button */}
      <Link
        to="/products"
        className="pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/20"
      >
        <ShoppingBag size={17} className="group-hover:rotate-12 transition-transform" />
        <span>Price List</span>
      </Link>

      {/* Floating WhatsApp Button with Pulsing Radar Ring */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="pointer-events-auto relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
      >
        {/* Pulsing Ping Ripple */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40 group-hover:opacity-60" />
        <MessageSquare size={26} className="relative z-10 fill-current" />
      </a>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-800 shadow-md border border-gray-200 transition-all hover:-translate-y-1 active:scale-90 cursor-pointer animate-fade-in"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
