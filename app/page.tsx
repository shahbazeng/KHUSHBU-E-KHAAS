"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

interface Perfume {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inspired_by: string;
  image_url: string;
  is_featured: boolean;
  is_coming_soon: boolean;
  tag?: string;
}

export default function LuxuryLanding() {
  const [products, setProducts] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cart, addToCart, removeFromCart, user } = useApp();

  useEffect(() => {
    async function getProducts() {
      try {
        const { data, error } = await supabase
          .from('mastan_perfumes')
          .select('*');
        
        if (error) {
          console.error("Database Error:", error.message);
          return;
        }
        
        if (data) setProducts(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  const bestSellers = products.filter(p => !p.is_coming_soon);
  const comingSoon = products.filter(p => p.is_coming_soon);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center">
        <p className="text-[#B8860B] tracking-[0.3em] font-sans uppercase text-[11px] font-bold animate-pulse">
          Loading Khushbu-e-Khaas...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] font-serif selection:bg-[#B8860B] selection:text-white relative antialiased">
      
      {/* 1. LUXURY NAVBAR */}
      <nav className="fixed w-full z-[100] px-6 md:px-16 py-5 flex justify-between items-center bg-white/80 backdrop-blur-lg border-b border-gray-100 transition-all">
        <Link href="/" className="tracking-[0.3em] text-lg font-bold text-gray-900 uppercase">
          Khushbu-e-Khaas
        </Link>
        
        <div className="hidden md:flex space-x-12 text-[11px] text-gray-500 uppercase tracking-[0.25em] font-sans font-bold">
          <a href="#collection" className="hover:text-[#B8860B] transition-colors">Our Collection</a>
          <a href="#coming-soon" className="hover:text-[#B8860B] transition-colors">New Drops</a>
          <Link href="/admin" className="text-gray-400 hover:text-gray-900 transition-colors">Dashboard</Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-bold">Logged In</span>
          ) : (
            <Link href="/auth" className="text-[11px] uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors font-sans font-bold">Login</Link>
          )}
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="text-[11px] text-white bg-gray-900 px-6 py-2.5 rounded-full hover:bg-[#B8860B] transition-all tracking-widest font-sans font-bold shadow-sm flex items-center gap-2"
          >
            CART 
            <span className="bg-[#B8860B] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold">
              {totalCartItems}
            </span>
          </button>
        </div>
      </nav>

      {/* 2. HERO BANNER */}
      <header className="relative h-[85vh] w-full bg-gradient-to-b from-white to-[#FAFAFA] flex items-center overflow-hidden pt-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full relative z-10">
          <div className="text-left space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[#B8860B] tracking-[0.3em] text-[11px] uppercase font-extrabold font-sans">Premium Inspired Fragrances</span>
              <div className="h-[1px] w-16 bg-[#B8860B]/30"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-light text-gray-900 leading-[1.15]">
              Elegance in <br />
              <span className="italic font-serif text-[#B8860B]">Every Single Spray</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-md font-sans">
              Discover beautifully crafted scents inspired by global luxury classics. Designed for lasting confidence, tailored for you.
            </p>
            <div className="pt-4">
              <a href="#collection" className="px-10 py-4 bg-gray-900 text-white rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-[#B8860B] transition-all shadow-xl font-sans inline-block">
                Browse Collection
              </a>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-full">
            <div className="absolute w-[90%] h-[90%] bg-[#B8860B]/5 rounded-full blur-3xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" 
              alt="Luxury Perfume Showcase" 
              className="h-[450px] md:h-[580px] object-cover rounded-[2.5rem] shadow-2xl relative z-20 transition-transform duration-700 hover:scale-[1.02]" 
            />
          </div>
        </div>
      </header>

      {/* 3. BEST SELLERS SECTION (REFINED HIGH-END UI CARDS) */}
      <section id="collection" className="py-28 px-6 md:px-16 bg-white border-t border-gray-50">
        <div className="text-center mb-20 space-y-2">
          <h2 className="text-[#B8860B] text-xs tracking-[0.4em] uppercase font-sans font-extrabold">Customer Favorites</h2>
          <h3 className="text-3xl md:text-5xl font-light text-gray-900">Our Best <span className="italic text-[#B8860B]">Sellers</span></h3>
        </div>
        
        {bestSellers.length === 0 ? (
          <p className="text-center text-gray-400 text-xs font-sans py-12">No products found in our storefront display right now.</p>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {bestSellers.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group">
                
                {/* Refined Image Container */}
                <div className="relative overflow-hidden bg-[#FBFBFB] rounded-[1.5rem] mb-6 aspect-[4/5] flex items-center justify-center">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80"} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  
                  {/* Premium Hover Add to Cart Action */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                    <button 
                      onClick={() => {
                        addToCart(item);
                        setIsCartOpen(true);
                      }}
                      className="w-full py-4 bg-gray-900 text-white rounded-xl text-[11px] tracking-widest uppercase font-bold hover:bg-[#B8860B] transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl font-sans"
                    >
                      Add to Basket
                    </button>
                  </div>
                </div>

                {/* Meta Description Elements */}
                <div className="px-2 pb-2 space-y-2 text-left">
                  <h4 className="text-gray-900 font-serif text-lg font-medium">{item.name}</h4>
                  <p className="text-gray-400 text-[10px] font-sans font-bold uppercase tracking-wider bg-gray-50 w-fit px-2.5 py-1 rounded-md border border-gray-100">
                    {item.inspired_by || 'Original Fragrance'}
                  </p>
                  <p className="text-gray-500 text-xs font-sans font-light line-clamp-2 leading-relaxed">
                    {item.description || 'No description available for this premium fragrance variant.'}
                  </p>
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-gray-400 text-[10px] font-sans uppercase font-bold tracking-wider">Price</span>
                    <span className="text-[#B8860B] font-sans font-bold text-base">Rs. {item.price}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. FUTURE RELEASES DROPS SECTION */}
      <section id="coming-soon" className="py-28 px-6 md:px-16 bg-[#FBFBFB] border-t border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-[#B8860B] text-[11px] tracking-[0.4em] uppercase font-extrabold font-sans mb-2">Exciting Future Additions</h2>
          <h3 className="text-4xl md:text-5xl font-light text-gray-900">Coming <span className="italic text-[#B8860B]">Soon</span></h3>
        </div>

        <div className="max-w-7xl mx-auto flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {comingSoon.map((perfume) => (
            <div key={perfume.id} className="min-w-[300px] md:min-w-[380px] snap-start flex-shrink-0 bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between p-4 group">
              <div className="relative h-[320px] rounded-[1.8rem] overflow-hidden bg-gray-50 mb-6">
                <img src={perfume.image_url || "/BLUE-DE.jpeg"} alt={perfume.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase font-sans tracking-widest">
                  Next Launch
                </div>
              </div>

              <div className="px-2 pb-2 space-y-3 text-left">
                <h4 className="text-gray-900 text-xl font-medium">{perfume.name}</h4>
                <p className="text-[#B8860B] text-[11px] font-sans tracking-wide uppercase italic">
                  {perfume.inspired_by ? `Inspired by ${perfume.inspired_by}` : 'Original Formula'}
                </p>
                <p className="text-gray-500 text-xs font-sans font-light line-clamp-2 leading-relaxed">
                  {perfume.description || 'Pre-booking slots opening up soon for this limited perfume batch.'}
                </p>
                <button className="w-full py-3.5 bg-gray-900 text-white text-[11px] font-bold tracking-widest uppercase rounded-xl hover:bg-[#B8860B] transition-colors font-sans mt-2">
                  Get Notified
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SIDEBAR LUXURY SHOPPING BASKET OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-black/40 backdrop-blur-md transition-all">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl p-8 flex flex-col justify-between border-l border-gray-100 animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 font-sans">Your Shopping Bag</h3>
                  <p className="text-[11px] text-gray-400 font-sans mt-0.5">Total selected items: {totalCartItems}</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-900 text-xs font-bold font-sans bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 transition-colors"
                >
                  Close ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                  <p className="text-gray-400 font-serif italic text-sm">Your luxury shopping basket is currently empty.</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-[11px] text-[#B8860B] uppercase font-bold font-sans tracking-widest border border-[#B8860B]/30 px-6 py-2.5 rounded-full hover:bg-[#B8860B] hover:text-white transition-all">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[58vh] space-y-4 pr-1 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                      <img src={item.image_url} alt="Product Thumbnail" className="w-16 h-16 object-cover rounded-xl border bg-white flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-left space-y-0.5">
                        <h4 className="text-xs font-bold text-gray-900 truncate uppercase font-sans tracking-wide">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-sans font-medium">Quantity: {item.quantity} × Rs. {item.price}</p>
                        <p className="text-xs font-bold text-[#B8860B] font-sans">Total: Rs. {item.price * item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-gray-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold font-sans">
                  <span className="text-gray-500 font-light">Subtotal Balance:</span>
                  <span className="text-xl text-[#B8860B] font-bold">Rs. {cartTotalPrice}</span>
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-sans tracking-wide leading-relaxed bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                  📦 Free standard shipping across Pakistan included with your order.
                </p>
                <Link 
                  href="/checkout" 
                  className="w-full py-4 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest text-center block hover:bg-[#B8860B] transition-all shadow-xl font-sans"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. GLOBAL FOOTER */}
      <footer className="py-16 px-12 bg-gray-50 text-center border-t border-gray-100">
        <p className="text-[11px] tracking-widest text-gray-400 uppercase font-sans">© 2026 Khushbu-e-Khaas | Pakistan</p>
      </footer>

    </div>
  );
}