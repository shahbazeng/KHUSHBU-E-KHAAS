"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, clearCart, user } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const router = useRouter();

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");

    // 1. Insert into Orders Table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: name,
        customer_email: email,
        total_price: totalPrice,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) return alert(orderError.message);

    // 2. Insert into Order Items
    const itemsToInsert = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

    if (!itemsError) {
      clearCart();
      alert("🎉 Order Placed Successfully! Cash on Delivery confirmed.");
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-24 px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
      {/* Checkout Form */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-light text-gray-800 mb-6 tracking-wide">Shipping & Billing Details</h2>
        <form onSubmit={handlePlaceOrder} className="space-y-5">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]" />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]" />
          <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]" />
          <textarea placeholder="Complete Delivery Address" rows={4} value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]"></textarea>
          <button type="submit" className="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#B8860B] transition-all">
            Confirm Order (COD)
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
        <h2 className="text-xl font-light text-gray-800 mb-6 tracking-wide">Order Summary</h2>
        <div className="divide-y divide-gray-100 mb-6">
          {cart.map(item => (
            <div key={item.id} className="py-4 flex justify-between items-center text-sm">
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-sans text-gray-600">Rs. {item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center border-t pt-4 font-bold text-lg">
          <span className="text-gray-800 font-light">Total Amount:</span>
          <span className="text-[#B8860B] font-sans">Rs. {totalPrice}</span>
        </div>
      </div>
    </div>
  );
}