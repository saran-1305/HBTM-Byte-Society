import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useCart } from '../../context/CartContext';
import { IconTrash, IconMinus, IconPlus, IconShoppingCart } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, itemCount } = useCart();

  const tax = totalPrice * 0.08; // 8% mock tax
  const finalTotal = totalPrice + tax;

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[28px] font-black text-[#111111] tracking-tight leading-tight">
            Your Cart
          </h1>
          <p className="text-[15px] text-[#5C5C52] mt-2 font-medium">
            Review your curated items before checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#F7F5EF] rounded-2xl border border-[#E5E5E5] border-dashed">
            <IconShoppingCart className="w-16 h-16 text-[#C4C4C4] mb-4" stroke={1} />
            <h2 className="text-xl font-bold text-[#111111] mb-2">Your cart is empty</h2>
            <p className="text-[#5C5C52] mb-6">Looks like you haven't added any products yet.</p>
            <Link 
              to="/lifestyle"
              className="px-6 py-3 bg-[#111111] text-white rounded-xl font-medium hover:bg-black transition-colors"
            >
              Explore Lifestyle
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-6 p-4 bg-white border-1.5 border-[#111111] rounded-2xl items-center relative group">
                  <div className="w-24 h-24 bg-[#F7F5EF] rounded-xl overflow-hidden shrink-0 border border-[#E5E5E5]">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-[#111111] text-[16px]">{item.title}</h3>
                    <p className="text-[13px] text-[#5C5C52] mb-2">{item.brand}</p>
                    <p className="font-bold text-[#111111]">{item.price}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-[#F7F5EF] rounded-xl p-1 border border-[#E5E5E5]">
                    <button 
                      onClick={() => updateQuantity(item.title, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-[#111111]"
                    >
                      <IconMinus size={16} stroke={2} />
                    </button>
                    <span className="w-4 text-center font-bold text-[14px]">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.title, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-[#111111]"
                    >
                      <IconPlus size={16} stroke={2} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.title)}
                    className="p-3 text-[#FF4444] hover:bg-[#FFF0F0] rounded-xl transition-colors shrink-0 ml-2"
                  >
                    <IconTrash size={20} stroke={2} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-[#111111] text-white rounded-3xl p-8 sticky top-8">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Estimated Tax</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Shipping</span>
                    <span className="font-medium text-[#44FF44]">Free</span>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-[#333333] mb-6"></div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-[16px] font-medium">Total</span>
                  <span className="text-[28px] font-black leading-none">₹{finalTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => alert("Checkout flow is not implemented in this mock.")}
                  className="w-full py-4 bg-white text-[#111111] rounded-xl font-bold text-[15px] hover:bg-[#F7F5EF] transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CartPage;
