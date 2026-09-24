import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api';
import { Sparkles, ArrowRight, ShieldCheck, Flame, ShoppingBag, Truck } from 'lucide-react';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [settings, setSettings] = useState({
    shop_name: 'AVIRA PYROTECH',
    homepage_title: 'AVIRA PYROTECH - Premium Sivakasi Fireworks & Crackers',
    footer_text: 'Quality Sivakasi Fireworks directly delivered to your doorstep!'
  });
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchData = async () => {
    try {
      // 1. Fetch Active Banners
      const bannerRes = await api.get('/banners/active');
      setBanners(bannerRes.data);

      // 2. Fetch Categories
      const catRes = await api.get('/categories');
      setCategories(catRes.data);

      // 3. Fetch Featured Products (fetch first page, size 8)
      const prodRes = await api.get('/products', { params: { size: 8 } });
      setFeaturedProducts(prodRes.data.content || []);

      // 4. Fetch Settings
      const settingsRes = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...settingsRes.data }));
    } catch (e) {
      console.error("Failed to load homepage data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Banner slide rotation loop
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Helper to add item directly to cart from cards
  const addToCartDirectly = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ product, quantity: 1, price: product.offerPrice || product.originalPrice });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`✅ ${product.name} added to cart!`);
  };

  return (
    <div className="space-y-12 pb-16">

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 1. HERO SLIDER BANNER */}
      <section className="relative h-[55vw] min-h-[280px] max-h-[520px] bg-gray-900 overflow-hidden shrink-0">
        {banners.length > 0 ? (
          banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                idx === activeBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background Cover Image */}
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <img
                src={getImageUrl(banner.imagePath)}
                alt={banner.title || 'AVIRA PYROTECH'}
                className="absolute inset-0 w-full h-full object-cover select-none"
              />

              {/* Caption Overlay */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-white space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-xs font-black rounded-full uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>Sivakasi Direct Crackers</span>
                </div>
                {banner.title && (
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight max-w-3xl leading-tight">
                    {banner.title}
                  </h1>
                )}
                {banner.subtitle && (
                  <p className="text-sm sm:text-md text-gray-300 font-semibold max-w-2xl leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                <div className="pt-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all text-sm"
                  >
                    <span>Shop Now</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Default Static Hero if no banners exist */
          <div className="absolute inset-0 flex items-center bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-wide">
                AVIRA <span className="text-red-500">PYROTECH</span>
              </h1>
              <p className="text-gray-300 max-w-2xl font-semibold text-sm leading-relaxed">
                {settings.footer_text || 'Premium sivakasi fireworks directly from Sivakasi to your doorstep! Order online and enjoy safety-tested crackers.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
                >
                  <span>Browse Crackers</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. WHY CHOOSE US BADGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">Sivakasi Direct</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Get authentic Sivakasi cracker prices without mediator markup.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">Premium Quality</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Strict quality standards ensure long display durations & colors.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">Safe Delivery</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Proper packaging & transport ensures safe crackers delivery.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">Instant Verification</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Orders immediately reach the shop owner for quick packaging.</p>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES QUICK NAV */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black font-outfit text-gray-900">Explore Cracker Categories</h2>
            <p className="text-gray-400 text-xs font-semibold">Choose your favorites from gift boxes, ground chakkars, sparklers, and more</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="bg-white p-4 border border-gray-150 rounded-2xl hover:border-red-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                  {cat.imagePath ? (
                    <img src={getImageUrl(cat.imagePath)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <Flame size={24} className="text-gray-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. FEATURED / NEW ARRIVALS PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black font-outfit text-gray-900">Featured Fireworks</h2>
            <p className="text-gray-400 text-xs font-semibold mt-1">Check out our best-selling cracker items at Sivakasi prices.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 hover:underline"
          >
            <span>View All Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-semibold">
            No products available at this moment. Stay tuned!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => {
              const discount = prod.offerPrice && prod.offerPrice < prod.originalPrice
                ? Math.round(((prod.originalPrice - prod.offerPrice) / prod.originalPrice) * 100)
                : 0;
              const isOutOfStock = prod.stockQuantity <= 0;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group relative"
                >
                  {/* Image Area */}
                  <div className="h-48 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                    {prod.imagePath ? (
                      <img
                        src={getImageUrl(prod.imagePath)}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Flame className="text-gray-300" size={32} />
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black py-0.5 px-2 rounded-lg">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Stock Status Badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      isOutOfStock
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </div>

                  {/* Caption & pricing details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.productCode}</p>
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-1 mt-0.5">{prod.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-md font-extrabold text-red-600">
                        ₹{(prod.offerPrice || prod.originalPrice).toLocaleString('en-IN')}
                      </span>
                      {prod.offerPrice && prod.offerPrice < prod.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        to={`/product/${prod.id}`}
                        className="py-2 px-3 border border-gray-250 text-gray-600 text-xs font-bold rounded-xl text-center hover:bg-gray-50 transition-colors"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => addToCartDirectly(prod)}
                        disabled={isOutOfStock}
                        className="py-2 px-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. PROMOTION CTA SECTION */}
      <section className="bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl font-black font-outfit max-w-2xl mx-auto leading-tight">
          Celebrate your festivals with beautiful, safe Sivakasi Crackers
        </h2>
        <p className="text-gray-300 text-xs font-semibold max-w-xl mx-auto">
          We offer high-quality display cracker combos, fancy flower pots, rockets, and custom gift box packs. Download our price catalog or shop directly!
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
