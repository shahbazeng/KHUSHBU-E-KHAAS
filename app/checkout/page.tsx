"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotalPrice, clearCart } = useApp();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Checkout Form Fields States
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lahore'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your basket is empty!");
      return;
    }

    setLoading(true);
    try {
      console.log("Initializing secure checkout routing pipeline...");

      // 🛠️ FALLBACK RESOLUTION STATE ENGINE:
      // Agar cartTotalPrice null/undefined ho, to client side par value recalculate karein taake constraint fail na ho.
      const evaluatedTotalPrice = cartTotalPrice && !isNaN(cartTotalPrice) 
        ? parseFloat(cartTotalPrice) 
        : cart.reduce((total, item) => total + (item.price * item.quantity), 0);

      console.log("Evaluated Total Price Payload Target:", evaluatedTotalPrice);

      if (isNaN(evaluatedTotalPrice) || evaluatedTotalPrice <= 0) {
        throw new Error("Invalid order computation amount. Total must be greater than 0.");
      }

      // 1. Insert Core Data Inside Orders Table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: form.name,
          customer_email: form.email,
          total_price: evaluatedTotalPrice, // Fixed using robust checked context float value
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Prepare Order Items Array Mapping Relational References
      const orderItemsPayload = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // 3. Bulk Insert Inside Order Items Table Matrix
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // 4. Reset Cart Memory state
      clearCart();
      alert("🎉 Order Placed Successfully! Cash on Delivery matrix initiated.");
      
      router.push('/');
      router.refresh();

    } catch (error: any) {
      console.error("❌ Checkout Exception Error:", error.message);
      alert(`Checkout failed to sync: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Safe layout render computation fallback tool
  const currentRenderTotal = cartTotalPrice && !isNaN(cartTotalPrice)
    ? cartTotalPrice 
    : cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-gray-900 antialiased font-sans pt-32 pb-20 px-6 md:px-16">
      
      {/* HEADER TOP NAVBAR LOOK */}
      <nav className="fixed top-0 w-full left-0 z-50 px-6 md:px-16 py-5 flex justify-between items-center bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <Link href="/" className="tracking-[0.3em] text-base font-extrabold uppercase text-gray-900">
          Khushbu<span className="text-[#B8860B] font-serif lowercase italic font-normal">e</span>Khaas
        </Link>
        <Link href="/shop" className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-gray-900 transition-colors">✕ Cancel Checkout</Link>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start mt-6">
        
        {/* LEFT COLUMN: CONTACT & SHIPPING DETAILS FORM CONTAINER */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-2xl font-light font-serif text-gray-900">Shipping <span className="italic text-[#B8860B]">Information</span></h2>
          <p className="text-gray-400 text-[10px] uppercase font-sans tracking-wider -mt-4 font-bold">Please fill in your valid operational courier deployment markers.</p>

          <form onSubmit={handlePlaceOrder} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInputChange} required disabled={loading} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" placeholder="Shahbaz Ali" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} required disabled={loading} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" placeholder="shahbaz@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">Mobile Number (For Courier Contact)</label>
              <input type="text" name="phone" value={form.phone} onChange={handleInputChange} required disabled={loading} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" placeholder="e.g., 03001234567" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">Complete Shipping Address</label>
              <textarea name="address" value={form.address} onChange={handleInputChange} required rows={3} disabled={loading} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B] text-gray-900 font-medium" placeholder="Apartment, Street Name, Sector, Near Landmark..."></textarea>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-bold">City Location</label>
              <select name="city" value={form.city} onChange={handleInputChange} disabled={loading} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-white focus:outline-none focus:border-[#B8860B] font-semibold text-gray-700">
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Multan">Multan</option>
              </select>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#B8860B] transition-all shadow-xl disabled:bg-gray-400">
                {loading ? "Authorizing Secure Node Transaction..." : "Confirm Order (Cash on Delivery)"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: BASKET ORDER ITEMS OVERVIEW AND RECEIPT SUMMARY */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Summary</h3>
          
          <div className="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3.5 first:pt-0">
                <img src={item.image_url} alt="Variant" className="w-12 h-12 object-cover rounded-xl border bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-gray-900 text-xs truncate uppercase tracking-wide">{item.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity} × Rs. {item.price}</p>
                </div>
                <span className="font-mono font-bold text-xs text-gray-900">Rs. {item.price * item.quantity}</span>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-gray-400 font-serif italic text-xs py-6">Your shopping bag is completely empty.</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-3 font-sans text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Standard Insured Shipping</span>
              <span className="text-green-600 font-bold uppercase text-[10px]">Free Delivery</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold text-sm border-t border-dashed pt-4">
              <span>Total Payable Amount</span>
              <span className="text-xl text-[#B8860B] font-mono font-extrabold">Rs. {currentRenderTotal}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 




