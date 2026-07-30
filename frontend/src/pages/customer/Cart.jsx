import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(items);
    } catch (e) {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    // Dispatch synchronization event for Layout Navbar badge
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleIncrement = (index) => {
    const updated = [...cart];
    const maxStock = updated[index].product.stockQuantity;
    if (updated[index].quantity < maxStock) {
      updated[index].quantity += 1;
      saveCart(updated);
    } else {
      alert(`Only ${maxStock} items available in stock.`);
    }
  };

  const handleDecrement = (index) => {
    const updated = [...cart];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      saveCart(updated);
    }
  };

  const handleRemove = (index) => {
    if (!window.confirm("Remove this product from cart?")) return;
    const updated = cart.filter((_, i) => i !== index);
    saveCart(updated);
  };

  const handleClear = () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    saveCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalProducts = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-800">Your Cart is Empty</h2>
          <p className="text-xs text-gray-400 font-semibold">Explore our crackers catalog to add items to your cart.</p>
        </div>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/15"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit text-gray-900">Your Shopping Cart</h1>
          <p className="text-gray-400 text-xs font-semibold mt-1">Review items, quantities, and proceed to placing order.</p>
        </div>
        <button
          onClick={handleClear}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Cracker</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((item, index) => (
                    <tr key={item.product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Cracker Name & Thumbnail */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product.imagePath ? (
                            <img src={item.product.imagePath} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={18} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-800 line-clamp-1">{item.product.name}</p>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.product.productCode}</span>
                        </div>
                      </td>

                      {/* Quantity Modifier */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center border border-gray-250 rounded-lg bg-gray-50 w-24 mx-auto overflow-hidden">
                          <button
                            onClick={() => handleDecrement(index)}
                            className="p-1 hover:bg-gray-150 text-gray-500 cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="flex-1 text-center font-bold text-gray-700 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(index)}
                            className="p-1 hover:bg-gray-150 text-gray-500 cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-right font-bold text-gray-600">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>

                      {/* Remove item */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRemove(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick link back */}
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Sidebar Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm h-fit space-y-6">
          <h3 className="font-extrabold text-md text-gray-800 border-b border-gray-100 pb-3 font-outfit">Order Tally</h3>
          
          <div className="space-y-3 font-semibold text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Total Cracker Items</span>
              <span className="text-gray-800 font-extrabold">{getTotalProducts()} items</span>
            </div>
            <div className="flex justify-between border-t border-gray-50 pt-3 text-sm font-black text-gray-900">
              <span>Grand Total</span>
              <span className="text-red-600">₹{getSubtotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-xs cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
