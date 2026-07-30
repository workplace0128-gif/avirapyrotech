import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { ShoppingBag, ArrowLeft, ShieldAlert, CreditCard } from 'lucide-react';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(items);
      if (items.length === 0) {
        navigate('/cart');
      }
    } catch (e) {
      navigate('/cart');
    }
  }, [navigate]);

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !mobileNumber.trim() || !address.trim() || !district.trim() || !pincode.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    // Validate phone number format (simple length validation)
    const cleanPhone = mobileNumber.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Build orderItems payload
      const orderItems = cart.map(item => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        address: address.trim(),
        landmark: landmark.trim() || null,
        district: district.trim(),
        pincode: pincode.trim(),
        customerNotes: customerNotes.trim() || null,
        totalAmount: getSubtotal(),
        orderItems
      };

      const response = await api.post('/orders', payload);
      
      // Order placed successfully! Clear local storage cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));

      // Redirect to success page with parameters
      const orderId = response.data.id;
      navigate(`/order-success?id=${orderId}&name=${encodeURIComponent(customerName)}&total=${getSubtotal()}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to place your order. Please check item stock levels and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <ArrowLeft size={14} />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-3xl font-black font-outfit text-gray-900">Checkout Delivery Form</h1>
        <p className="text-gray-400 text-xs font-semibold mt-1">Provide your billing details. Payment will be collected during delivery or direct purchase.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 text-red-700 p-4 border border-red-200 rounded-2xl text-xs font-semibold animate-fade-in">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Billing Form + Order summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3 font-outfit">Delivery Information</h3>
            
            {/* Grid 1: Customer Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhan Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Grid 2: Address and Landmark */}
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Shipping Address *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Door No, Street name, Area details..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-855 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Vinayagar Temple"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Grid 3: District and Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virudhunagar / Sivakasi"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-855 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 626123"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-855 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Optional Customer Notes */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Order Notes / Special Requests (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Write any changes in delivery timing, package instructions..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-855 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-xs font-semibold leading-relaxed"
              ></textarea>
            </div>

            {/* Payment Method Note (No Payment Gateway) */}
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex gap-3 text-orange-850">
              <CreditCard size={20} className="shrink-0 text-orange-600 mt-0.5" />
              <div className="text-xs font-medium space-y-1">
                <p className="font-extrabold text-orange-950">Cash On Delivery / Store Pickup</p>
                <p className="leading-relaxed">There is no online payment gateway integrated. Our logistics team will call you to confirm order packaging and delivery slots. Payment will be collected in cash/UPI upon delivery or direct shop collection.</p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Place Order (₹{getSubtotal().toLocaleString('en-IN')})</span>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Order Items review card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm h-fit space-y-4">
          <h3 className="font-extrabold text-md text-gray-800 border-b border-gray-100 pb-3 font-outfit">Your Order Summary</h3>
          
          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex justify-between gap-3 text-xs">
                <div className="flex-1 font-semibold text-gray-700">
                  <p className="font-bold line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">Qty: {item.quantity} x ₹{item.price}</p>
                </div>
                <span className="font-extrabold text-gray-900 shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between text-sm font-black text-gray-900">
            <span>Payable Amount</span>
            <span className="text-red-600">₹{getSubtotal().toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
