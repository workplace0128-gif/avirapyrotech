import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import { Search, SlidersHorizontal, Flame, Sparkles } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState('5000');

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || null,
        categoryId: selectedCategory || null,
        // Frontend filtering will handle price to avoid complex specs, or we can fetch all and filter client side!
        // To make the filters extremely fast and dynamic, fetching all (or a large page) and filtering client-side is incredibly responsive!
        size: 200 // Fetch a large batch to filter client side instantly
      };
      const response = await api.get('/products', { params });
      setProducts(response.data.content || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]); // Re-fetch on category changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Client-side filtering for immediate feedback on price and query
  const filteredProducts = products.filter(prod => {
    const priceToCheck = prod.offerPrice || prod.originalPrice;
    const matchesPrice = priceToCheck <= parseFloat(maxPrice);
    
    // If search was submitted, we already did server-side search,
    // but doing a client-side match also ensures perfect alignment
    const matchesSearch = search.trim() === '' || 
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.productCode.toLowerCase().includes(search.toLowerCase());

    return matchesPrice && matchesSearch;
  });

  const addToCartDirectly = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ product, quantity: 1, price: product.offerPrice || product.originalPrice });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger custom event to notify Navbar
    window.dispatchEvent(new Event('cart-updated'));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-outfit text-gray-900">Our Fireworks Catalog</h1>
        <p className="text-gray-400 text-xs font-semibold mt-1">Browse all available firecrackers. Search, filter, and buy directly at Sivakasi prices.</p>
      </div>

      {/* Grid: Filters Sidebar + Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 1. FILTERS SIDEBAR PANELS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6 h-fit">
          <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-3">
            <SlidersHorizontal size={18} className="text-red-600" />
            <span className="font-extrabold text-sm font-outfit tracking-wide">Filter Options</span>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search Crackers</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. sparklers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold"
              />
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 pointer-events-none">
                <Search size={14} />
              </span>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 px-3 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Category Dropdown/Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchParams(e.target.value ? { category: e.target.value } : {});
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl focus:outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price</label>
              <span className="text-xs font-extrabold text-red-600">₹{parseFloat(maxPrice).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="10"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold">
              <span>₹10</span>
              <span>₹5,000+</span>
            </div>
          </div>
        </div>

        {/* 2. PRODUCTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center">
              <Flame className="mx-auto text-gray-300 mb-3 animate-pulse" size={48} />
              <p className="text-gray-400 font-bold text-sm">No crackers match your selected filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {filteredProducts.map((prod) => {
                const discount = prod.offerPrice && prod.offerPrice < prod.originalPrice
                  ? Math.round(((prod.originalPrice - prod.offerPrice) / prod.originalPrice) * 100)
                  : 0;
                const isOutOfStock = prod.stockQuantity <= 0;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group relative"
                  >
                    {/* Cracker Photo */}
                    <div className="h-44 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                      {prod.imagePath ? (
                        <img
                          src={prod.imagePath}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Flame className="text-gray-300" size={32} />
                      )}

                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black py-0.5 px-2 rounded-lg">
                          {discount}% OFF
                        </span>
                      )}

                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Metadata & Prices */}
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

                      {/* Control buttons */}
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
        </div>

      </div>

    </div>
  );
}
