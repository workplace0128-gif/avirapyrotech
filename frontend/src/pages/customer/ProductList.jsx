import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import { Search, SlidersHorizontal, Flame, X, ChevronDown } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterOpen, setFilterOpen] = useState(false); // Mobile filter drawer

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]             = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice]         = useState('5000');

  // Toast notification state
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || null,
        categoryId: selectedCategory || null,
        size: 200,
      };
      const response = await api.get('/products', { params });
      setProducts(response.data.content || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const filteredProducts = products.filter((prod) => {
    const price = prod.offerPrice || prod.originalPrice;
    const matchesPrice  = price <= parseFloat(maxPrice);
    const matchesSearch = search.trim() === '' ||
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.productCode.toLowerCase().includes(search.toLowerCase());
    return matchesPrice && matchesSearch;
  });

  const addToCartDirectly = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const idx  = cart.findIndex((i) => i.product.id === product.id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ product, quantity: 1, price: product.offerPrice || product.originalPrice });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`✅ ${product.name} added to cart!`);
  };

  /* ─── Filter panel (shared between sidebar & drawer) ─── */
  const FilterPanel = () => (
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
            placeholder="e.g. sparklers…"
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
            <option key={cat.id} value={cat.id}>{cat.name}</option>
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
          type="range" min="10" max="5000" step="50" value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
          <span>₹10</span>
          <span>₹5,000+</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl animate-fade-in whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Fireworks Catalog</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {loading ? 'Loading…' : `${filteredProducts.length} products found`}
          </p>
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-sm cursor-pointer"
        >
          <SlidersHorizontal size={14} className="text-red-600" />
          Filters
          <ChevronDown size={12} />
        </button>
      </div>

      {/* ── MOBILE FILTER DRAWER (bottom sheet) ── */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end lg:hidden"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-gray-900 text-base">Filter Products</span>
              <button onClick={() => setFilterOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-2xl text-sm cursor-pointer"
            >
              Apply Filters ({filteredProducts.length} results)
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout: sidebar + grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-gray-150 shadow-sm h-fit sticky top-20">
          <FilterPanel />
        </aside>

        {/* Products grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-9 h-9 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-14 text-center">
              <Flame className="mx-auto text-gray-200 mb-3 animate-pulse" size={52} />
              <p className="text-gray-400 font-bold text-sm">No crackers match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => {
                const discount = prod.offerPrice && prod.offerPrice < prod.originalPrice
                  ? Math.round(((prod.originalPrice - prod.offerPrice) / prod.originalPrice) * 100)
                  : 0;
                const isOutOfStock = prod.stockQuantity <= 0;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                  >
                    {/* Image */}
                    <div className="h-36 sm:h-44 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                      {prod.imagePath ? (
                        <img
                          src={prod.imagePath}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Flame className="text-gray-200" size={32} />
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black py-0.5 px-2 rounded-lg">
                          {discount}% OFF
                        </span>
                      )}
                      <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1 space-y-2">
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.productCode}</p>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-2 mt-0.5 leading-snug">{prod.name}</h3>
                      </div>

                      <div className="flex items-baseline gap-1.5 mt-auto">
                        <span className="text-sm sm:text-base font-extrabold text-red-600">
                          ₹{(prod.offerPrice || prod.originalPrice).toLocaleString('en-IN')}
                        </span>
                        {prod.offerPrice && prod.offerPrice < prod.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{prod.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Actions — stacked on mobile, side-by-side on sm+ */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <Link
                          to={`/product/${prod.id}`}
                          className="py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl text-center hover:bg-gray-50 transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => addToCartDirectly(prod)}
                          disabled={isOutOfStock}
                          className="py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                        >
                          {isOutOfStock ? 'Sold Out' : 'Add'}
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
