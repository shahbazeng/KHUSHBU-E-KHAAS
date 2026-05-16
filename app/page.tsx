"use client"; // Client interactivity (carousel, buttons) ke liye

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Client client connect kiya

// Type safety ke liye interface define kar diya
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

  // Database se data fetch karne ka clean tree
  useEffect(() => {
  async function getProducts() {
    try {
      const { data, error } = await supabase
        .from('mastan_perfumes') // 'products' ko badal kar 'perfumes' kar diya
        .select('*');
      
      if (error) {
        console.error("Supabase Database Error Details:", error.message);
        return;
      }
      
      if (data) setProducts(data);
    } catch (err) {
      console.error("General Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }
  getProducts();
}, []);

  // Filter items based on Supabase boolean flags
  const bestSellers = products.filter(p => !p.is_coming_soon);
  const comingSoon = products.filter(p => p.is_coming_soon);

  if (loading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center">
        <p className="text-[#B8860B] tracking-widest font-sans uppercase text-[10px] animate-pulse">
          Khushbu-e-Khaas loading...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] font-serif selection:bg-[#B8860B] selection:text-white">
      
      {/* 1. Navbar */}
      <nav className="fixed w-full z-[100] px-8 md:px-12 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="tracking-[0.4em] text-lg font-light text-[#B8860B]">
          <img src="/khusbuekhas.png" alt="Logo" className="h-10 brightness-90" />
        </div>
        <div className="hidden md:flex space-x-10 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-sans">
          <a href="#collection" className="hover:text-[#B8860B] transition-all">Collections</a>
          <a href="#categories" className="hover:text-[#B8860B] transition-all">Categories</a>
          <a href="#reviews" className="hover:text-[#B8860B] transition-all">Reviews</a>
        </div>
        <button className="text-[10px] text-[#B8860B] border border-[#B8860B]/30 px-8 py-2.5 rounded-full hover:bg-[#B8860B] hover:text-white transition-all tracking-widest font-sans font-bold shadow-sm">
          CART (0)
        </button>
      </nav>

      {/* 2. Hero Section */}
      <header className="relative h-[70vh] md:h-[80vh] w-full bg-[#FAFAFA] flex items-center overflow-hidden mt-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center w-full relative z-10">
          <div className="text-left animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#B8860B] tracking-[0.4em] text-[10px] uppercase font-bold">Premium Inspired Series</span>
              <div className="h-[1px] w-12 bg-[#B8860B]/30"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-light text-[#1A1A1A] leading-tight mb-6">
              Elegance in <br />
              <span className="italic font-serif text-[#B8860B]">Every Spray</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed mb-10 max-w-md font-sans">
              Khushbu-e-Khaas brings you the world's most loved fragrances. Crafted for those who seek confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-10 py-4 bg-[#1A1A1A] text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#B8860B] transition-all shadow-lg">Shop Now</button>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-full group">
            <div className="absolute w-[80%] h-[80%] bg-[#B8860B]/5 rounded-full blur-3xl"></div>
            <div className="relative z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" alt="Bottle" className="h-[400px] md:h-[550px] object-contain rounded-[3rem]" />
            </div>
          </div>
        </div>
      </header>

      {/* 4. Best Selling Section (Connected to Supabase) */}
      <section id="collection" className="py-24 px-6 md:px-12 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-[#B8860B] text-xs tracking-[0.5em] uppercase mb-4 font-sans font-bold">Most Loved</h2>
          <h3 className="text-3xl md:text-5xl font-light text-[#1A1A1A]">Best <span className="italic text-[#B8860B]">Sellers</span></h3>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {bestSellers.map((item) => (
            <div key={item.id} className="group cursor-pointer text-center">
              <div className="relative overflow-hidden bg-[#f9f9f9] mb-6 rounded-[2rem] shadow-md hover:shadow-xl border border-gray-50 transition-all duration-500">
                <img src={item.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80"} alt={item.name} className="w-full aspect-[4/5] object-cover opacity-90 group-hover:scale-110 transition-all duration-1000" />
                <button className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] py-3 bg-white/90 backdrop-blur-md rounded-full text-[10px] tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg text-[#1A1A1A]">Add to Cart</button>
              </div>
              <h4 className="text-[#1A1A1A] tracking-widest text-xs uppercase mb-2 font-bold">{item.name}</h4>
              <p className="text-[#B8860B] text-sm font-sans italic">Rs. {item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NEW: Coming Soon - Inspired Luxury Series (Connected to Supabase) */}
      <section className="py-24 px-6 md:px-12 bg-[#F9F9F9] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4">
            <div>
              <h2 className="text-[#B8860B] text-[10px] tracking-[0.5em] uppercase mb-4 font-bold font-sans">Future Drops</h2>
              <h3 className="text-4xl md:text-6xl font-light text-[#1A1A1A] font-serif">Coming <span className="italic text-[#B8860B]">Soon</span></h3>
            </div>
          </div>

          <div className="flex flex-nowrap gap-6 overflow-x-auto pb-12 pt-4 px-4 no-scrollbar snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing">
            {comingSoon.map((perfume) => (
              <div key={perfume.id} className="min-w-[280px] md:min-w-[350px] snap-start flex-shrink-0 group">
                <div className="relative h-[450px] bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-gray-100">
                  <div className="absolute inset-0 z-0">
                    <img src={perfume.image_url || "/BLUE-DE.jpeg"} alt={perfume.name} className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-1000 ease-in-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700"></div>
                  </div>
                  <div className="absolute top-6 left-6 z-10">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-bold px-4 py-2 rounded-full tracking-widest uppercase font-sans shadow-lg">
                      Summer 2026
                    </span>
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-end p-8">
                    <span className="text-[#D4AF37] text-[9px] uppercase tracking-[0.3em] font-bold mb-2">{perfume.tag || "Premium Scent"}</span>
                    <h4 className="text-white font-light text-2xl mb-1 font-serif">{perfume.name}</h4>
                    <p className="text-white/60 text-[10px] uppercase tracking-widest mb-6 italic">{perfume.inspired_by}</p>
                    <button className="w-full py-4 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-[#B8860B] hover:text-white transition-all duration-500 shadow-xl">
                      Notify Me
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-16 px-12 bg-gray-50 text-center">
        <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-8 font-sans">© 2026 Khushbu-e-Khaas | Pakistan</p>
      </footer>

    </div>
  );
}