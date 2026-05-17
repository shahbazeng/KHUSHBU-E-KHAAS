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
  category_id: string;
  is_coming_soon: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const { cart, addToCart, removeFromCart, totalCartItems, cartTotalPrice } = useApp();

  useEffect(() => {
    async function fetchShopData() {
      try {
        const { data: pfs, error: pErr } = await supabase.from('mastan_perfumes').select('*');
        const { data: cats, error: cErr } = await supabase.from('mastan_categories').select('*');
        
        if (pErr) throw pErr;
        if (cErr) throw cErr;

        if (pfs) setProducts(pfs.filter(p => !p.is_coming_soon)); // Sirf active sellable items
        if (cats) setCategories(cats);
      } catch (err: any) {
        console.error("Shop Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchShopData();
  }, []);

  // Filter and Sort Processing Logic Matrix
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.inspired_by?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0; // Default sorting layout
    });

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-gray-900 antialiased font-sans pb-20">
      
      {/* 1. TRANSLUCENT NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-16 py-4 flex justify-between items-center bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100">
        <Link href="/" className="tracking-[0.3em] text-base font-extrabold uppercase text-gray-900">
          Khushbu<span className="text-[#B8860B] font-serif lowercase italic font-normal">e</span>Khaas
        </Link>
        <div className="hidden md:flex space-x-12 text-[11px] uppercase tracking-[0.25em] font-bold text-gray-600">
          <Link href="/" className="hover:text-[#B8860B] transition-colors">Home</Link>
          <Link href="/shop" className="text-[#B8860B]">Shop Catalog</Link>
          
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="text-[11px] bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white px-6 py-2.5 rounded-full font-bold shadow-md flex items-center gap-2"
        >
          BAG <span className="bg-white text-gray-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold">{totalCartItems}</span>
        </button>
      </nav>

      {/* 2. SHOP PAGE HEADER */}
      <header className="pt-36 pb-12 bg-white text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-light font-serif text-gray-900">The Scent <span className="italic text-[#B8860B]">Boutique</span></h1>
        <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-bold">Explore Premium Inspired Masterpieces</p>
      </header>

      {/* 3. CONTROLS HUB: SEARCH, FILTERS & SORTING */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        {/* Real-time Search Box */}
        <div className="md:col-span-2 relative">
          <input 
            type="text" 
            placeholder="Search fragrance name or designer inspiration..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B] bg-white shadow-sm"
          />
        </div>

        {/* Dynamic Category Selector Node */}
        <div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-white focus:outline-none focus:border-[#B8860B] shadow-sm font-semibold text-gray-700 cursor-pointer"
          >
            <option value="all">All Collections</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Price Sorting Evaluator */}
        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-white focus:outline-none focus:border-[#B8860B] shadow-sm font-semibold text-gray-700 cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </section>

      {/* 4. FILTERED PRODUCTS SHOWCASE CATALOG CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-6">
        {filteredProducts.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group">
            
            <div className="relative overflow-hidden bg-gray-50 rounded-[2rem] mb-6 aspect-[4/5] flex items-center justify-center border border-gray-100">
              <img src={item.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80"} alt={item.name} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-104" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent p-6 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <button 
                  onClick={() => { addToCart(item); setIsCartOpen(true); }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] tracking-widest uppercase font-extrabold transition-colors shadow-lg"
                >
                  Add To Basket
                </button>
              </div>
            </div>

            <div className="px-3 pb-3 space-y-3 text-left">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-gray-900 text-xl font-medium tracking-tight font-serif line-clamp-1">{item.name}</h4>
                <span className="text-[#B8860B] font-mono font-extrabold text-base">Rs. {item.price}</span>
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

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 italic font-serif text-sm">No fragrances found matching your search filters constraint settings.</p>
          </div>
        )}
      </main>

      {/* 5. SHOPPING CART OVERLAY BASKET TIMELINE */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-950/40 backdrop-blur-sm transition-all">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
          <div className="w-full max-w-md bg-white h-full relative p-8 flex flex-col justify-between border-l border-gray-100">
            <div>
              <div className="flex items-center justify-between border-b pb-6 mb-6">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 font-sans">Your Shopping Bag</h3>
                  <p className="text-[11px] text-gray-400 font-sans mt-1">Total items: <strong className="text-gray-800">{totalCartItems}</strong></p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 text-xs font-bold font-sans bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">Close ✕</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-gray-400 font-serif italic text-sm py-20">Your basket is currently empty.</p>
              ) : (
                <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-1 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <img src={item.image_url} alt="Thumb" className="w-16 h-16 object-cover rounded-xl border bg-white flex-shrink-0" />
                      <div className="flex-1 text-left space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate uppercase tracking-wide font-sans">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-sans">Qty: {item.quantity} × Rs. {item.price}</p>
                        <p className="text-xs font-extrabold text-[#B8860B] font-mono">Rs. {item.price * item.quantity}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-rose-600 p-2">✕</button>
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
                <Link href="/checkout" className="w-full py-4.5 bg-slate-950 text-white rounded-full text-xs font-bold uppercase tracking-widest text-center block bg-gradient-to-r from-slate-950 to-slate-900 hover:from-[#B8860B] hover:to-[#D4AF37] transition-all shadow-xl">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}