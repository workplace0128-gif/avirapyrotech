import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api';
import { Search, SlidersHorizontal, Flame, X, ChevronDown, Minus, Plus, CheckCircle, ArrowRight } from 'lucide-react';
import CrackerBlast from '../../components/customer/CrackerBlast';

export default function ProductList() {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterOpen, setFilterOpen]     = useState(false); // Mobile filter drawer

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]             = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice]         = useState('10000');
  const [quantities, setQuantities]     = useState({});

  // Toast notification state
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || null,
        categoryId: selectedCategory || null,
        size: 250,
      };
      const response = await api.get('/products', { params });
      setProducts(response.data?.content || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const filteredProducts = products.filter((prod) => {
    const price = prod.offerPrice || prod.originalPrice;
    const matchesPrice = price <= parseFloat(maxPrice);
    const matchesSearch =
      search.trim() === '' ||
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      (prod.productCode && prod.productCode.toLowerCase().includes(search.toLowerCase()));
    return matchesPrice && matchesSearch;
  });

  const addToCartDirectly = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const idx = cart.findIndex((i) => i.product.id === product.id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({
        product,
        quantity: 1,
        price: product.offerPrice || product.originalPrice,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`✅ ${product.name} added to cart!`);
  };

  /* ─── Filter panel (shared between sidebar & drawer) ─── */
  const renderFilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-3">
        <SlidersHorizontal size={16} className="text-red-600" />
        <span className="font-extrabold text-sm">Filter Options</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. sparklers, rockets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium"
          />
          <Search size={14} className="absolute inset-y-0 left-2.5 my-auto text-gray-400 pointer-events-none" />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSearchParams(e.target.value ? { category: e.target.value } : {});
          }}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none text-sm font-medium cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price</label>
          <span className="text-xs font-extrabold text-red-600">₹{parseFloat(maxPrice).toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="10"
          max="10000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
          <span>₹10</span>
          <span>₹10,000+</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900/95 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle size={18} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-0.5">
            Direct Sivakasi Fireworks
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-gray-900">Crackers Online Shop</h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            {loading ? 'Loading catalog…' : `${filteredProducts.length} items available at factory prices`}
          </p>
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          <SlidersHorizontal size={14} className="text-red-600" />
          Filters
          <ChevronDown size={12} />
        </button>
      </div>

      {/* ── MOBILE FILTER DRAWER (bottom sheet) ── */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end lg:hidden"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-gray-900 text-base">Filter Crackers</span>
              <button onClick={() => setFilterOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            {renderFilterPanel()}
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-2xl text-sm cursor-pointer shadow-md"
            >
              Apply Filters ({filteredProducts.length} results)
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout: sidebar + grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-gray-150 shadow-xs h-fit sticky top-20">
          {renderFilterPanel()}
        </aside>

        {/* Products grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-14 text-center">
              <Flame className="mx-auto text-gray-200 mb-3 animate-pulse" size={52} />
              <p className="text-gray-500 font-bold text-sm">No crackers match your filters</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setMaxPrice('10000');
                  setSearchParams({});
                }}
                className="mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => {
                const currentQty = quantities[prod.id] || 1;
                const discount =
                  prod.offerPrice && prod.offerPrice < prod.originalPrice
                    ? Math.round(((prod.originalPrice - prod.offerPrice) / prod.originalPrice) * 100)
                    : 20; // 20% discount badge default
                const finalPrice = prod.offerPrice || Math.round(prod.originalPrice * 0.8);
                const isOutOfStock = prod.stockQuantity <= 0;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-amber-900/10 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 group relative cracker-card-glow"
                  >
                    {/* Image Area with Zoom effect & Cracker Blast on hover */}
                    <div className="h-44 sm:h-52 bg-[#FAF7F4] border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                      <CrackerBlast />
                      {prod.imagePath ? (
                        <img
                          src={getImageUrl(prod.imagePath)}
                          alt={prod.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-108 transition-transform duration-400"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <Flame className="text-gray-300 group-hover:scale-115 transition-transform duration-300" size={42} />
                        </div>
                      )}

                      {/* 20% OFF Green Discount Label Badge */}
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-[#198754] text-white text-[10px] font-black py-0.5 px-2 rounded-md shadow-sm">
                          {discount}% OFF
                        </span>
                      )}

                      {/* Stock Status Badge */}
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isOutOfStock
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between space-y-3">
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {prod.productCode || 'AP_101'}
                        </p>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-1 mt-0.5 leading-snug">
                          {prod.name}
                        </h3>
                      </div>

                      {/* Pricing Details */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-extrabold text-red-600">
                          ₹{(prod.offerPrice || prod.originalPrice)?.toLocaleString('en-IN')}
                        </span>
                        {prod.offerPrice && prod.offerPrice < prod.originalPrice && (
                          <span className="text-xs text-gray-400 line-through font-medium">
                            ₹{prod.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Actions — Details and Add to Cart matching user image */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          to={`/product/${prod.id}`}
                          className="py-2 px-3 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl text-center hover:bg-gray-50 transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => addToCartDirectly(prod)}
                          disabled={isOutOfStock}
                          className="py-2 px-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-xs"
                        >
                          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
