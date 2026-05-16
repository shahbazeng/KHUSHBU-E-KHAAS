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
  const [isScrolled, setIsScrolled] = useState(false);

  const { cart, addToCart, removeFromCart, user } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="bg-white min-h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#B8860B] tracking-[0.4em] uppercase text-xs font-bold animate-pulse">
            Loading Luxury Experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans antialiased selection:bg-[#B8860B] selection:text-white relative w-full overflow-x-hidden">
      
      {/* 1. PREMIUM GLASSMORPHISM NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] px-6 md:px-16 py-5 flex justify-between items-center transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100 py-3 text-gray-900' 
          : 'bg-white/80 backdrop-blur-md text-gray-900 border-b border-gray-100'
      }`}>
        <Link href="/" className="flex items-center gap-2 group">
          <span className="tracking-[0.3em] text-sm md:text-base font-extrabold uppercase text-gray-900">
            Khushbu<span className="text-[#B8860B] font-serif lowercase italic font-normal tracking-normal">e</span>Khaas
          </span>
        </Link>
        
        <div className="hidden md:flex space-x-12 text-[11px] uppercase tracking-[0.25em] font-bold text-gray-600">
          <a href="#collection" className="hover:text-[#B8860B] transition-colors">Our Collection</a>
          <a href="#coming-soon" className="hover:text-[#B8860B] transition-colors">New Drops</a>
          <Link href="/admin" className="text-gray-400 hover:text-gray-900 transition-colors">Dashboard</Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Session
            </span>
          ) : (
            <Link href="/auth" className="text-[11px] uppercase tracking-wider transition-colors font-bold text-gray-500 hover:text-gray-900">Login</Link>
          )}
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="text-[11px] bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white px-6 py-2.5 rounded-full hover:brightness-110 transition-all tracking-widest font-bold shadow-md shadow-[#B8860B]/10 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
          >
            BAG 
            <span className="bg-white text-gray-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shadow-sm">
              {totalCartItems}
            </span>
          </button>
        </div>
      </nav>

      {/* 2. BRIGHT COMPACT HERO SHOWCASE */}
      <header className="relative min-h-[85vh] w-full bg-gradient-to-b from-gray-50 via-white to-white flex items-center overflow-hidden pt-24 px-6 md:px-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.03)_0%,transparent_60%)] z-0"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full relative z-10 py-12">
          
          <div className="text-left space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-[#B8860B] tracking-[0.4em] text-[11px] uppercase font-extrabold">Artisanal Inspired Perfumery</span>
              <div className="h-[1px] w-20 bg-[#B8860B]/30"></div>
            </div>
            <h1 className="text-5xl md:text-[5.5rem] font-light text-gray-900 leading-[1.08] tracking-tight font-serif">
              Elegance in <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] drop-shadow-sm">Every Spray</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-base font-normal leading-relaxed max-w-lg">
              Experience ultra-premium scent profiles meticulously matched to global luxury masterpieces. Long-lasting compositions configured for the refined connoisseur.
            </p>
            <div className="pt-4 flex items-center gap-6">
              <a href="#collection" className="px-10 py-4 bg-gray-900 text-white rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-[#B8860B] transition-all shadow-xl hover:scale-[1.03]">
                Explore Imperials
              </a>
              <a href="#coming-soon" className="text-gray-800 text-[11px] uppercase tracking-widest font-bold border-b border-[#B8860B]/50 pb-1 hover:text-[#B8860B] hover:border-[#B8860B] transition-all">
                View Pre-Drops
              </a>
            </div>
          </div>

          <div className="relative flex justify-center items-center h-full">
            <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-[#B8860B]/10 to-transparent rounded-full blur-3xl z-0"></div>
            <div className="relative p-2 bg-gray-100 rounded-[3.2rem] shadow-xl border border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" 
                alt="Luxury Bottle Showcase" 
                className="h-[420px] md:h-[540px] object-cover rounded-[3rem] shadow-lg relative z-20 transition-all duration-700 hover:scale-[1.01]" 
              />
            </div>
          </div>

        </div>
      </header>

      {/* 3. PREMIUM DESIGNER VIBRANT GRID */}
      <section id="collection" className="py-32 px-6 md:px-16 max-w-[1600px] mx-auto bg-white">
        <div className="text-center mb-24 space-y-3">
          <h2 className="text-[#B8860B] text-xs tracking-[0.5em] uppercase font-extrabold">Curated Exclusives</h2>
          <h3 className="text-3xl md:text-5xl font-light text-gray-900 font-serif">The Imperial Best <span className="italic text-[#B8860B]">Sellers</span></h3>
          <div className="w-12 h-[2px] bg-[#B8860B]/30 mx-auto pt-1"></div>
        </div>
        
        {bestSellers.length === 0 ? (
          <p className="text-center text-gray-400 text-xs font-sans py-16 bg-gray-50 rounded-3xl border border-gray-100">No premium drops initialized inside data nodes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {bestSellers.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group relative">
                
                <div className="relative overflow-hidden bg-gray-50 rounded-[2rem] mb-6 aspect-[4/5] flex items-center justify-center border border-gray-100">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80"} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" 
                  />
                  
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent p-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <button 
                      onClick={() => {
                        addToCart(item);
                        setIsCartOpen(true);
                      }}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] tracking-widest uppercase font-extrabold transition-colors shadow-lg font-sans"
                    >
                      Add To Basket
                    </button>
                  </div>
                </div>

                <div className="px-3 pb-3 space-y-3 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-gray-900 text-xl font-medium tracking-tight font-serif line-clamp-1">{item.name}</h4>
                    <span className="text-[#B8860B] font-mono font-extrabold text-base flex-shrink-0">Rs. {item.price}</span>
                  </div>
                  
                  <div className="inline-block text-[10px] text-[#B8860B] font-bold uppercase tracking-wider bg-[#B8860B]/5 px-3 py-1 rounded-md border border-[#B8860B]/10">
                    {item.inspired_by ? `Inspired by ${item.inspired_by}` : 'Original Formula'}
                  </div>
                  
                  <p className="text-gray-600 text-xs font-normal line-clamp-2 leading-relaxed font-sans pt-1">
                    {item.description || 'Premium master batch formulated with pristine essential perfume oil extractions.'}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. LUXURY PRE-RELEASES SLIDER */}
      <section id="coming-soon" className="py-32 px-6 md:px-16 bg-gray-50 border-t border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-20 text-left space-y-2">
          <h2 className="text-[#B8860B] text-[11px] tracking-[0.4em] uppercase font-extrabold">Exclusive Preview</h2>
          <h3 className="text-4xl md:text-5xl font-light text-gray-900 font-serif">Future <span className="italic text-[#B8860B]">Drops</span></h3>
        </div>

        <div className="max-w-7xl mx-auto flex gap-10 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {comingSoon.map((perfume) => (
            <div key={perfume.id} className="min-w-[310px] md:min-w-[400px] snap-start flex-shrink-0 bg-white border border-gray-200 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 p-5 flex flex-col justify-between group">
              <div className="relative h-[340px] rounded-[2.2rem] overflow-hidden bg-gray-100 mb-6 border border-gray-200">
                <img src={perfume.image_url || "/BLUE-DE.jpeg"} alt={perfume.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103" />
                <div className="absolute top-5 left-5 bg-gray-900 text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  Limited Batch
                </div>
              </div>

              <div className="px-3 pb-3 space-y-4 text-left">
                <h4 className="text-gray-900 text-2xl font-medium font-serif">{perfume.name}</h4>
                <p className="text-[#B8860B] text-[11px] tracking-wide uppercase font-bold bg-amber-50 border border-amber-100 px-3 py-1 rounded-md w-fit">
                  {perfume.inspired_by ? `Inspired by ${perfume.inspired_by}` : 'Vault Formula'}
                </p>
                <p className="text-gray-600 text-xs font-normal line-clamp-2 leading-relaxed font-sans">
                  {perfume.description || 'Pre-booking reservation queues opening up shortly for verified accounts.'}
                </p>
                <button className="w-full py-4 bg-gray-900 text-white text-[11px] font-bold tracking-widest uppercase rounded-2xl hover:bg-[#B8860B] transition-colors font-sans mt-2 shadow-sm">
                  Join Waitlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. REFINE LUXURY BASKET OVERLAY DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-black/30 backdrop-blur-md transition-all animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl p-8 flex flex-col justify-between border-l border-gray-100">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 font-sans">Your Shopping Bag</h3>
                  <p className="text-[11px] text-gray-400 font-sans mt-1">Total selections: <strong className="text-gray-800">{totalCartItems} items</strong></p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-900 text-xs font-bold font-sans bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200 transition-colors"
                >
                  Close ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-32 space-y-4">
                  <p className="text-gray-400 font-serif italic text-sm">Your luxury bag is currently empty.</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-[11px] text-[#B8860B] uppercase font-bold tracking-widest border border-[#B8860B]/30 px-6 py-3 rounded-full hover:bg-[#B8860B] hover:text-white transition-all shadow-sm">
                    Discover Fragrances
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-1 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-5 bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:bg-gray-100/50 transition-colors">
                      <img src={item.image_url} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl border bg-white flex-shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0 text-left space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate uppercase font-sans tracking-wide">{item.name}</h4>
                        <p className="text-[10px] text-gray-500 font-sans font-semibold">Qty: {item.quantity} × Rs. {item.price}</p>
                        <p className="text-xs font-extrabold text-[#B8860B] font-mono">Rs. {item.price * item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-6 space-y-5">
                <div className="flex justify-between items-center text-sm font-bold font-sans">
                  <span className="text-gray-500 font-light font-serif">Subtotal Balance:</span>
                  <span className="text-xl text-[#B8860B] font-mono font-extrabold">Rs. {cartTotalPrice}</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase font-sans tracking-wider leading-relaxed bg-[#FAF9F5] p-3.5 rounded-2xl text-center border border-[#D4AF37]/20 font-bold">
                  📦 Insured delivery across Pakistan included with this checkout row.
                </p>
                <Link 
                  href="/checkout" 
                  className="w-full py-4.5 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest text-center block hover:bg-[#B8860B] transition-all shadow-md font-sans"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. GRAND LUXURY BRIGHT FOOTER WITH SOCIALS */}
      <footer className="bg-[#FAF9F5] text-gray-600 font-sans text-xs pt-24 pb-12 px-6 md:px-16 border-t border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-200 pb-16 mb-10">
          
          {/* Brand Pillar */}
          <div className="space-y-5">
            <h3 className="tracking-[0.25em] text-sm font-extrabold text-gray-900 uppercase">
              Khushbu<span className="text-[#B8860B] font-serif lowercase italic font-normal tracking-normal">e</span>Khaas
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed font-normal">
              Crafting supreme, long-lasting fragrance variants inspired by iconic luxury scents from across the globe.
            </p>
            
            {/* INJECTED PREMIUM SOCIAL MEDIA INTERFACES */}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#B8860B] hover:text-white transition-all shadow-sm" aria-label="Instagram">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" h="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#B8860B] hover:text-white transition-all shadow-sm" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.72-1 1-1h2V2h-3a5 5 0 0 0-5 5v1z"></path>
                </svg>
              </a>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm" aria-label="WhatsApp">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-gray-900 text-[11px] uppercase tracking-widest font-extrabold">Navigation</h4>
            <ul className="space-y-2.5 text-gray-500 text-xs font-medium">
              <li><a href="#collection" className="hover:text-[#B8860B] transition-colors">Our Collection</a></li>
              <li><a href="#coming-soon" className="hover:text-[#B8860B] transition-colors">Future Releases</a></li>
              <li><Link href="/admin" className="hover:text-[#B8860B] transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Boutique Location */}
          <div className="space-y-4 md:col-span-2">
            <h4 className="text-gray-900 text-[11px] uppercase tracking-widest font-extrabold">Flagship Store Location</h4>
            <div className="flex items-start gap-4 text-gray-600 text-xs bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <svg className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-gray-900 font-bold font-serif text-sm mb-1">Khushbu-e-Khaas Boutique</p>
                <p className="font-semibold text-gray-700">Shop # E5-B2, Grand Square Mall,</p>
                <p className="text-gray-400 text-[11px] font-mono mt-1">Main Boulevard Gulberg, Lahore, Pakistan</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Base Subtext layer matrix */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-gray-500 text-[11px] font-medium">
          <p>© 2026 Khushbu-e-Khaas Scent Matrix. Built securely by Shahbaz Ali.</p>
          
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider font-bold">
            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">Easypaisa</span>
            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">NayaPay</span>
            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">Bank AL Habib</span>
          </div>
        </div>
      </footer>

    </div>
  );
}