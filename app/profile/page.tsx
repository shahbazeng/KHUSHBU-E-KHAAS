"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  mastan_perfumes: {
    name: string;
    image_url: string;
    inspired_by: string;
  } | null;
}

interface UserOrder {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  order_items: OrderItem[];
}

export default function UserProfilePage() {
  const { user, totalCartItems } = useApp();
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrderHistory() {
      // Security Guard clause fallback
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching order history tree for secure context:", user.email);

        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total_price,
            status,
            order_items (
              id,
              quantity,
              price,
              mastan_perfumes (
                name,
                image_url,
                inspired_by
              )
            )
          `)
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setUserOrders(data as any);

      } catch (err: any) {
        console.error("❌ Profile History Sync Exception:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrderHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Authentication Fallback View
  if (!user) {
    return (
      <div className="bg-[#FAF9F5] min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 text-center space-y-6">
          <h2 className="text-xl font-light font-serif text-gray-900">Secure Profile <span className="italic text-[#B8860B]">Layer</span></h2>
          <p className="text-gray-500 text-xs font-sans leading-relaxed">Please authenticate your account session profile parameters to review your order history matrix.</p>
          <Link href="/auth" className="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#B8860B] transition-all block shadow-md pt-4">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-gray-900 antialiased font-sans pt-32 pb-20 px-6 md:px-16">
      
      {/* LUXURY APP HUB NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-16 py-4 flex justify-between items-center bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <Link href="/" className="tracking-[0.3em] text-base font-extrabold uppercase text-gray-900">
          Khushbu<span className="text-[#B8860B] font-serif lowercase italic font-normal">e</span>Khaas
        </Link>
        <div className="hidden md:flex space-x-12 text-[11px] uppercase tracking-[0.25em] font-bold text-gray-600">
          <Link href="/" className="hover:text-[#B8860B] transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-[#B8860B] transition-colors">Shop Catalog</Link>
          <Link href="/profile" className="text-[#B8860B]">My Account</Link>
        </div>
        <Link href="/shop" className="text-[11px] bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white px-6 py-2.5 rounded-full font-bold shadow-md flex items-center gap-2">
          BAG <span className="bg-white text-gray-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold">{totalCartItems}</span>
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 items-start mt-6">
        
        {/* LEFT COMPACT BOX: CURRENT USER CREDENTIALS CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6 text-center lg:text-left">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#B8860B] to-[#D4AF37] text-white font-serif text-3xl font-light rounded-full flex items-center justify-center shadow-md mx-auto lg:mx-0">
            {user.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-medium text-gray-900">Customer Session</h3>
            <p className="text-gray-400 font-mono text-[11px] break-all">{user.email}</p>
          </div>
          <div className="pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
            🔒 SSL Encrypted Token Verified
          </div>
        </div>

        {/* RIGHT LARGER BOX: ORDERS HISTORY TRACKING COMPONENT */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-2xl font-light font-serif text-gray-900">Purchase <span className="italic text-[#B8860B]">History</span></h2>
            <p className="text-gray-400 text-[10px] uppercase font-sans tracking-wider -mt-4 font-bold">Track live routing parameters for items under fulfillment.</p>

            <div className="space-y-6">
              {userOrders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/30 hover:bg-white transition-colors duration-300">
                  
                  {/* Order Meta Attributes */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase font-sans">Order ID Reference</p>
                      <p className="font-mono text-xs font-bold text-gray-900">#{order.id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Sub-Items Row Listing Matrix */}
                  <div className="divide-y divide-gray-100/50">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <img 
                          src={item.mastan_perfumes?.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80"} 
                          alt="Variant Asset" 
                          className="w-10 h-10 object-cover rounded-lg border bg-white flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-bold text-gray-900 text-xs truncate uppercase font-sans tracking-wide">
                            {item.mastan_perfumes?.name || "Fragrance Item"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Qty: {item.quantity} × Rs. {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Value Bar */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="text-gray-400 text-[10px] uppercase font-sans font-bold">Total Amount Paid</span>
                    <span className="text-sm font-mono font-extrabold text-[#B8860B]">Rs. {order.total_price}</span>
                  </div>

                </div>
              ))}

              {userOrders.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-serif italic text-sm">
                  You haven't initiated any orders in our data matrix yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 



