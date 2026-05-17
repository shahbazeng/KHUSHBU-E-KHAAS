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

  // Handle Navbar Background Shift on Scroll
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
      <div className="bg-[#0A0D14] min-h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-xs font-bold animate-pulse">
            Elevating Your Essence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-[#1C1B17] font-sans antialiased selection:bg-[#B8860B] selection:text-white relative w-full overflow-x-hidden">
      
      {/* GLOBAL CSS KEYFRAMES ANIMATIONS */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. PREMIUM GOLD GLASSMORPHISM NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] px-6 md:px-16 py-4 flex justify-between items-center transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-md border-b border-[#D4AF37]/20 py-3' 
          : 'bg-gradient-to-b from-[#111622]/95 to-[#111622]/80 backdrop-blur-md text-white border-b border-[#D4AF37]/10'
      }`}>
        <Link href="/" className="flex items-center gap-2 group">
          <span className={`tracking-[0.3em] text-sm md:text-base font-extrabold uppercase transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
            Khushbu<span className="text-[#D4AF37] font-serif lowercase italic font-normal tracking-normal">e</span>Khaas
          </span>
        </Link>
        
        {/* Clean Public Navigation Context Links */}
        <div className="hidden md:flex space-x-12 text-[11px] uppercase tracking-[0.25em] font-bold">
          <a href="#collection" className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-[#B8860B]' : 'text-gray-300 hover:text-[#D4AF37]'}`}>Our Collection</a>
          <a href="#gifts" className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-[#B8860B]' : 'text-gray-300 hover:text-[#D4AF37]'}`}>Gifting</a>
          <a href="#eid-specials" className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-[#B8860B]' : 'text-gray-300 hover:text-[#D4AF37]'}`}>Eid Offers</a>
          <a href="#coming-soon" className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-[#B8860B]' : 'text-gray-300 hover:text-[#D4AF37]'}`}>New Drops</a>
          <Link href="/shop" className={`transition-colors duration-300 ${isScrolled ? 'text-gray-600 hover:text-[#B8860B]' : 'text-gray-300 hover:text-[#D4AF37]'}`}>Shop</Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <span className={`text-[10px] font-mono uppercase px-3 py-1 rounded-full font-bold transition-all duration-300 ${
              isScrolled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white/10 text-emerald-400 border border-emerald-500/30'
            }`}>Active Session</span>
          ) : (
            <Link href="/auth" className={`text-[11px] uppercase tracking-wider transition-colors font-bold ${isScrolled ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}>Login</Link>
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

      {/* 2. PREMIUM HERO SHOWCASE SECTION */}
      <header className="relative min-h-[90vh] w-full bg-[#111622] flex items-center overflow-hidden pt-24 px-6 md:px-20 border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.08)_0%,transparent_70%)] z-0"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full relative z-10 py-12">
          
          <div className="text-left space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="text-[#D4AF37] tracking-[0.4em] text-[11px] uppercase font-extrabold">Artisanal Inspired Perfumery</span>
              <div className="h-[1px] w-20 bg-[#D4AF37]/30"></div>
            </div>
            <h1 className="text-5xl md:text-[5.5rem] font-light text-white leading-[1.08] tracking-tight font-serif">
              Elegance in <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] via-[#F3E5AB] to-[#D4AF37] drop-shadow-sm">Every Spray</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-normal leading-relaxed max-w-lg">
              Experience ultra-premium scent profiles meticulously matched to global luxury masterpieces. Long-lasting compositions configured for the refined connoisseur.
            </p>
            <div className="pt-4 flex items-center gap-6">
              <a href="#collection" className="px-10 py-4 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white rounded-full text-[11px] uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-xl shadow-[#B8860B]/10 hover:scale-[1.03]">
                Explore Imperials
              </a>
              <a href="#eid-specials" className="text-white text-[11px] uppercase tracking-widest font-bold border-b border-[#D4AF37]/50 pb-1 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all">
                View Eid Offers
              </a>
            </div>
          </div>

          <div className="relative flex justify-center items-center h-full">
            <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-[#B8860B]/20 to-transparent rounded-full blur-3xl z-0"></div>
            <div className="relative p-3 bg-gradient-to-b from-[#D4AF37]/20 to-transparent rounded-[3.2rem] shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" 
                alt="Luxury Bottle Showcase" 
                className="h-[420px] md:h-[560px] object-cover rounded-[3rem] shadow-2xl relative z-20 border border-white/5 transition-all duration-700 hover:scale-[1.01]" 
              />
            </div>
          </div>

        </div>
      </header>

      {/* 3. PREMIUM DESIGNER CARDS GRID */}
      <section id="collection" className="py-32 px-6 md:px-16 max-w-[1600px] mx-auto">
        <div className="text-center mb-24 space-y-3">
          <h2 className="text-[#B8860B] text-xs tracking-[0.5em] uppercase font-extrabold">Curated Exclusives</h2>
          <h3 className="text-3xl md:text-5xl font-light text-gray-900 font-serif">The Imperial Best <span className="italic text-[#B8860B]">Sellers</span></h3>
          <div className="w-12 h-[2px] bg-[#B8860B]/30 mx-auto pt-1"></div>
        </div>
        
        {bestSellers.length === 0 ? (
          <p className="text-center text-gray-400 text-xs font-sans py-16 bg-white rounded-3xl border border-gray-100">No premium drops initialized inside data nodes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {bestSellers.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100/80 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group relative">
                
                <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white rounded-[2rem] mb-6 aspect-[4/5] flex items-center justify-center border border-gray-50">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80"} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" 
                  />
                  
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent p-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <button 
                      onClick={() => {
                        addToCart(item);
                        setIsCartOpen(true);
                      }}
                      className="w-full py-4 bg-white hover:bg-gray-900 text-gray-900 hover:text-white rounded-2xl text-[11px] tracking-widest uppercase font-extrabold transition-colors shadow-2xl font-sans"
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
                  
                  <p className="text-gray-500 text-xs font-normal line-clamp-2 leading-relaxed font-sans pt-1">
                    {item.description || 'Premium master batch formulated with pristine essential perfume oil extractions.'}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. GIFTS FOR HIM & HER SPLIT MATRIX */}
      <section id="gifts" className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-gray-100">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-[#B8860B] text-xs tracking-[0.4em] uppercase font-extrabold">The Art of Gifting</h2>
          <h3 className="text-3xl md:text-5xl font-light text-gray-900 font-serif">Thoughtful Curation for <span className="italic text-[#B8860B]">Everyone</span></h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative group rounded-[2.5rem] overflow-hidden shadow-md h-[400px] flex flex-col justify-end p-10 border border-gray-200/50">
            <img 
              src="https://images.unsplash.com/photo-1615655096345-61a54750068d?auto=format&fit=crop&q=80&w=800" 
              alt="Gifts For Him" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="relative z-10 space-y-3 text-left">
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-extrabold">Bold & Sophisticated</span>
              <h4 className="text-white text-3xl font-serif font-light">Gifts For Him</h4>
              <p className="text-gray-300 text-xs font-sans max-w-sm font-light">Intense woody ambers, dynamic spicy leathers, and corporate oceanic signatures evaluated for the modern man.</p>
              <a href="#collection" className="inline-block mt-2 px-6 py-2.5 bg-white text-gray-900 rounded-xl text-[10px] font-bold uppercase tracking-wider font-sans hover:bg-[#B8860B] hover:text-white transition-all shadow-md">Explore Noir Series</a>
            </div>
          </div>

          <div className="relative group rounded-[2.5rem] overflow-hidden shadow-md h-[400px] flex flex-col justify-end p-10 border border-gray-200/50">
            <img 
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800" 
              alt="Gifts For Her" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="relative z-10 space-y-3 text-left">
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-extrabold">Graceful & Radiant</span>
              <h4 className="text-white text-3xl font-serif font-light">Gifts For Her</h4>
              <p className="text-gray-300 text-xs font-sans max-w-sm font-light">Velvety rich florals, smooth sweet vanillas, and elegant fresh powdered drop attributes crafted to absolute perfection.</p>
              <a href="#collection" className="inline-block mt-2 px-6 py-2.5 bg-white text-gray-900 rounded-xl text-[10px] font-bold uppercase tracking-wider font-sans hover:bg-[#B8860B] hover:text-white transition-all shadow-md">Explore Pour Femme</a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EID SPECIAL OFFERS EXCLUSIVES */}
      <section id="eid-specials" className="py-16 px-6 md:px-16 max-w-7xl mx-auto mb-10 animate-fade-in-up">
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-[#111622] to-[#1F293D] p-8 md:p-16 border border-[#D4AF37]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1)_0%,transparent_60%)]"></div>
          
          <div className="space-y-5 text-left max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest font-sans">Seasonal Limited Offer</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-light text-white font-serif leading-tight">
              The Eid Special <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] to-[#D4AF37]">Luxury Festive Box</span>
            </h3>
            <p className="text-gray-400 text-xs font-sans leading-relaxed">
              Celebrate Eid with our exclusive limited-edition gifting set. Select any 3 premium fragrances from our entire catalog row map and get a complimentary luxury presentation travel vault case along with insured express shipping across Pakistan.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-white font-mono text-2xl font-bold">Rs. 10,999</span>
              <span className="text-gray-500 line-through font-mono text-xs">Rs. 14,500</span>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <button 
              onClick={() => {
                alert("Eid Special Festival Box added right into your shopping bag pipeline!");
                setIsCartOpen(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:brightness-110 transition-all shadow-xl shadow-[#B8860B]/20 hover:scale-[1.03]"
            >
              Claim Festive Gift Box
            </button>
          </div>
        </div>
      </section>

      {/* 6. LUXURY PRE-RELEASES SNAP CAROUSEL SLIDER */}
      <section id="coming-soon" className="py-32 px-6 md:px-16 bg-[#F6F5F0] border-t border-gray-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-20 text-left space-y-2">
          <h2 className="text-[#B8860B] text-[11px] tracking-[0.4em] uppercase font-extrabold">Exclusive Preview</h2>
          <h3 className="text-4xl md:text-5xl font-light text-gray-900 font-serif">Future <span className="italic text-[#B8860B]">Drops</span></h3>
        </div>

        <div className="max-w-7xl mx-auto flex gap-10 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {comingSoon.map((perfume) => (
            <div key={perfume.id} className="min-w-[310px] md:min-w-[400px] snap-start flex-shrink-0 bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 p-5 flex flex-col justify-between group">
              <div className="relative h-[340px] rounded-[2.2rem] overflow-hidden bg-gray-50 mb-6 border border-gray-100">
                <img src={perfume.image_url || "/BLUE-DE.jpeg"} alt={perfume.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103" />
                <div className="absolute top-5 left-5 bg-slate-950 text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Limited Batch
                </div>
              </div>

              <div className="px-3 pb-3 space-y-4 text-left">
                <h4 className="text-gray-900 text-2xl font-medium font-serif">{perfume.name}</h4>
                <p className="text-[#B8860B] text-[11px] tracking-wide uppercase font-bold bg-amber-50 border border-amber-100 px-3 py-1 rounded-md w-fit">
                  {perfume.inspired_by ? `Inspired by ${perfume.inspired_by}` : 'Vault Formula'}
                </p>
                <p className="text-gray-500 text-xs font-normal line-clamp-2 leading-relaxed font-sans">
                  {perfume.description || 'Pre-booking reservation queues opening up shortly for verified accounts.'}
                </p>
                <button className="w-full py-4 bg-slate-950 text-white text-[11px] font-bold tracking-widest uppercase rounded-2xl hover:bg-[#B8860B] transition-colors font-sans mt-2 shadow-md">
                  Join Waitlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REFINE LUXURY BASKET OVERLAY DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/40 backdrop-blur-md transition-all animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl p-8 flex flex-col justify-between border-l border-gray-100">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
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
                    <div key={item.id} className="flex items-center gap-5 bg-gray-50/60 p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <img src={item.image_url} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl border bg-white flex-shrink-0 shadow-inner" />
                      <div className="flex-1 min-w-0 text-left space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate uppercase font-sans tracking-wide">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-sans font-semibold">Qty: {item.quantity} × Rs. {item.price}</p>
                        <p className="text-xs font-extrabold text-[#B8860B] font-mono">Rs. {item.price * item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-rose-600 p-2 hover:bg-rose-50/50 rounded-xl transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 pt-6 space-y-5">
                <div className="flex justify-between items-center text-sm font-bold font-sans">
                  <span className="text-gray-500 font-light font-serif">Subtotal Balance:</span>
                  <span className="text-xl text-[#B8860B] font-mono font-extrabold">Rs. {cartTotalPrice}</span>
                </div>
                <p className="text-[10px] text-gray-400 uppercase font-sans tracking-wider leading-relaxed bg-[#FAF9F5] p-3.5 rounded-2xl text-center border border-[#D4AF37]/20 font-bold">
                  📦 Insured delivery across Pakistan included with this checkout row.
                </p>
                <Link 
                  href="/checkout" 
                  className="w-full py-4.5 bg-slate-950 text-white rounded-full text-xs font-bold uppercase tracking-widest text-center block bg-gradient-to-r from-slate-950 to-slate-900 hover:from-[#B8860B] hover:to-[#D4AF37] transition-all shadow-xl font-sans"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. GRAND LUXURY DYNAMIC FOOTER */}
      <footer className="bg-[#0B0F19] text-gray-400 font-sans text-xs pt-24 pb-12 px-6 md:px-16 border-t border-[#D4AF37]/10 relative z-10 antialiased w-full select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-16 mb-10 items-start">
          
          <div className="space-y-6 flex flex-col justify-start">
            <h3 className="tracking-[0.25em] text-sm font-extrabold text-white uppercase">
              Khushbu<span className="text-[#D4AF37] font-serif lowercase italic font-normal tracking-normal">e</span>Khaas
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed font-light">
              Crafting supreme, long-lasting fragrance variants inspired by iconic luxury scents from across the globe.
            </p>
            
            <div className="flex items-center gap-3.5 pt-1">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-[#D4AF37] hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] transition-all duration-300 shadow-sm group" aria-label="Instagram">
                <svg className="w-4 h-4 transition-colors group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" h="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-[#3b5998] hover:bg-[#3b5998] transition-all duration-300 shadow-sm group" aria-label="Facebook">
                <svg className="w-4 h-4 transition-colors group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.72-1 1-1h2V2h-3a5 5 0 0 0-5 5v1z"></path>
                </svg>
              </a>
              <a href="https://threads.net" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-white hover:bg-black transition-all duration-300 shadow-sm group" aria-label="Threads">
                <svg className="w-4 h-4 transition-colors group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.36 12.3c-.29.29-.65.43-1.06.43-.42 0-.78-.14-1.07-.43-.28-.28-.42-.64-.42-1.06V9.8c0-.41.14-.77.42-1.05.29-.29.65-.43 1.07-.43.41 0 .77.14 1.06.43.29.28.43.64.43 1.05v3.44c0 .42-.14.78-.43 1.06z"></path>
                </svg>
              </a>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-[#25D366] hover:bg-[#25D366] transition-all duration-300 shadow-sm group" aria-label="WhatsApp">
                <svg className="w-4 h-4 transition-colors group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-start">
            <h4 className="text-white text-[11px] uppercase tracking-widest font-bold">Navigation</h4>
            <ul className="space-y-2.5 text-gray-400 font-medium text-xs">
              <li><a href="#collection" className="hover:text-[#D4AF37] transition-colors duration-200">Our Collection</a></li>
              <li><a href="#gifts" className="hover:text-[#D4AF37] transition-colors duration-200">Gifting Matrix</a></li>
              <li><a href="#eid-specials" className="hover:text-[#D4AF37] transition-colors duration-200">Eid Specials</a></li>
              <li><a href="#coming-soon" className="hover:text-[#D4AF37] transition-colors duration-200">Future Drops</a></li>
            </ul>
          </div>

          <div className="space-y-4 flex flex-col justify-start">
            <h4 className="text-white text-[11px] uppercase tracking-widest font-bold">Bespoke Services</h4>
            <ul className="space-y-2.5 text-gray-400 font-medium text-xs">
              <li><a href="#consultation" className="hover:text-[#D4AF37] transition-colors duration-200">Private Consultation</a></li>
              <li><a href="#gifting" className="hover:text-[#D4AF37] transition-colors duration-200">Corporate Gifting</a></li>
              <li><a href="#custom" className="hover:text-[#D4AF37] transition-colors duration-200">Custom Scent Blends</a></li>
            </ul>
          </div>

          <div className="space-y-4 flex flex-col justify-start">
            <h4 className="text-white text-[11px] uppercase tracking-widest font-bold">Flagship Boutique</h4>
            <div className="flex items-start gap-4 text-gray-400 text-xs font-normal leading-relaxed bg-white/[0.02] p-5 rounded-[1.5rem] border border-white/5 shadow-inner w-full hover:border-[#D4AF37]/30 transition-colors duration-300">
              <svg className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-white font-bold font-serif text-sm mb-1 truncate">Khushbu-e-Khaas Boutique</p>
                <p className="font-semibold text-gray-300 truncate">Shop # E5-B2, Grand Square Mall,</p>
                <p className="text-gray-500 text-[11px] font-mono mt-1 tracking-wide truncate">Main Boulevard Gulberg, Lahore</p>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-gray-500 text-[11px] font-medium pt-6 border-t border-gray-800/40">
          <p className="tracking-wide text-center sm:text-left font-sans text-gray-500">
            © 2026 Khushbu-e-Khaas Scent Matrix. Engineered securely by Shahbaz Ali.
          </p>
          
          <div className="flex items-center gap-3 font-sans text-[10px] tracking-wide font-bold flex-wrap justify-center">
            <span className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl text-gray-400 hover:text-[#249a43] hover:border-[#249a43]/40 transition-colors cursor-default flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#249a43]"></span> Easypaisa
            </span>
            <span className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl text-gray-400 hover:text-[#00aaff] hover:border-[#00aaff]/40 transition-colors cursor-default flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00aaff]"></span> NayaPay
            </span>
            <span className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl text-gray-400 hover:text-[#005a9c] hover:border-[#005a9c]/40 transition-colors cursor-default flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#005a9c]"></span> Bank AL Habib
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}