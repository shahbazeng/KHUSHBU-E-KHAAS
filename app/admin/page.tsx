"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Perfume {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inspired_by: string;
  image_url: string;
  category_id: string;
  stock_quantity: number;
  is_coming_soon: boolean;
  is_featured: boolean;
}

export default function AdminDashboard() {
  // Tabs update kiya with profile and analytics tabs
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'profile'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Search state for smart orders lookup
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Admin Profile Local States
  const [adminProfile, setAdminProfile] = useState({
    name: 'Shahbaz Ali',
    email: 'admin@khushbuekhas.com',
    phone: '+92 300 1234567',
    role: 'Store Owner / Principal Developer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'
  });

  // Forms State
  const [catName, setCatName] = useState('');
  const [pForm, setPForm] = useState({
    name: '', slug: '', description: '', price: '',
    inspired_by: '', image_url: '', category_id: '',
    stock_quantity: '10', is_coming_soon: false, is_featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: cats } = await supabase.from('mastan_categories').select('*');
    const { data: pfs } = await supabase.from('mastan_perfumes').select('*');
    const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (cats) setCategories(cats);
    if (pfs) setPerfumes(pfs);
    if (ords) setOrders(ords);
  };

  // 1. Category CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  const slug = catName.toLowerCase().replace(/ /g, '-');
  
  console.log("Inserting category into table: mastan_categories...");
  
  const { data, error } = await supabase
    .from('mastan_categories') // Check karein agar aapke table ka naam exact yahi hai
    .insert([{ name: catName, slug }])
    .select();

  if (error) {
    // Yeh line aapko inspect element -> console mein exact error batayegi
    console.error("❌ Supabase Category Add Error:", error.message, error.details, error.hint);
    alert(`Category add nahi hui! Error: ${error.message}`);
  } else {
    console.log("✅ Category added successfully:", data);
    setCatName(''); 
    fetchData(); 
    alert('Category Added Successfully!'); 
  }
};

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await supabase.from('mastan_categories').delete().eq('id', id);
      fetchData();
    }
  };

  // 2. Perfume CRUD
  const handleAddPerfume = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = pForm.name.toLowerCase().replace(/ /g, '-');
    const { error } = await supabase.from('mastan_perfumes').insert([{
      ...pForm,
      slug,
      price: parseFloat(pForm.price),
      stock_quantity: parseInt(pForm.stock_quantity),
    }]);
    if (!error) {
      setPForm({
        name: '', slug: '', description: '', price: '', inspired_by: '',
        image_url: '', category_id: '', stock_quantity: '10', is_coming_soon: false, is_featured: false
      });
      fetchData();
      alert('Premium Scent Added to Inventory!');
    } else {
      console.error(error);
    }
  };

  const handleDeletePerfume = async (id: string) => {
    if (confirm("Delete this fragrance variant?")) {
      await supabase.from('mastan_perfumes').delete().eq('id', id);
      fetchData();
    }
  };

  // 3. Orders Management Logic
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      fetchData();
    }
  };

  // 4. Admin Profile Save Logic
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Admin Security Credentials & Settings Profile updated dynamically!");
  };

  // Filter and search computation for live orders lookup
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          order.customer_email.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex font-sans antialiased text-gray-900">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col justify-between border-r border-slate-800 shadow-xl z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-9 w-1 bg-[#B8860B] rounded-full"></div>
            <div>
              <h2 className="text-sm font-bold tracking-[0.25em] text-[#B8860B] uppercase">Khushbu-e-Khaas</h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Control Terminal v2.6</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'products' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l-8 4" /></svg>
              Fragrance Variant Matrix
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'categories' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
              Classification CRUD
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'orders' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Live Order Routing
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-mono animate-pulse">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'profile' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Admin Security Profile
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-6 border-t border-slate-900 bg-slate-950/50 flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('profile')}>
          <img src={adminProfile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#B8860B]/30 group-hover:ring-[#B8860B] transition-all" />
          <div className="truncate">
            <p className="text-xs font-bold truncate group-hover:text-[#B8860B] transition-all">{adminProfile.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{adminProfile.email}</p>
          </div>
        </div>
      </aside>

      {/* DASHBOARD CORE RIGHT FRAME CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* PREMIUM GLOBAL HEADER BAR (TOPBAR) */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Context Layer / <span className="text-gray-900">{activeTab}</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick Metrics Badge Overview */}
            <div className="hidden md:flex items-center gap-4 text-xs font-mono border-r pr-6 border-gray-100">
              <span className="text-gray-400">Total Items: <strong className="text-gray-900">{perfumes.length}</strong></span>
              <span className="text-gray-400">Orders Routed: <strong className="text-gray-900">{orders.length}</strong></span>
            </div>

            {/* Topbar User Controller */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('profile')}>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800 group-hover:text-[#B8860B] transition-colors">{adminProfile.name}</p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400">{adminProfile.role}</p>
              </div>
              <img src={adminProfile.avatar_url} alt="Profile Admin" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
            </div>
          </div>
        </header>

        {/* WORKSPACE MIDDLE VIEW WRAPPER */}
        <main className="flex-1 p-10 overflow-y-auto max-w-[1600px] w-full mx-auto">
          
          {/* TAB 1: CLASSIFICATION (CATEGORIES) RENDERING FRAME */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Classification & System Nodes</h2>
                <p className="text-xs text-gray-400 mt-1">Manage luxury collections and system-wide indexing structures parameters.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Create New Category</h3>
                  <input type="text" placeholder="Category Name (e.g., Intense Oud, Royal Florals)" value={catName} onChange={(e) => setCatName(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B] bg-gray-50/50" />
                  <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] transition-all shadow-md">Add Node</button>
                </form>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
                  <table className="w-full text-left text-xs text-gray-500">
                    <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Category Name</th>
                        <th className="px-6 py-4 font-semibold">System Routing URL / Slug</th>
                        <th className="px-6 py-4 font-semibold text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                          <td className="px-6 py-4 font-mono text-gray-400">{cat.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider text-[10px] transition-all px-3 py-1 rounded-md hover:bg-red-50">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRAGRANCE VARIANT MATRIX (PRODUCTS) RENDERING FRAME */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Fragrance Inventory Registry</h2>
                <p className="text-xs text-gray-400 mt-1">Configure premium inventory rows, pricing schemas, and front-page flags.</p>
              </div>

              {/* Add Perfume Form */}
              <form onSubmit={handleAddPerfume} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-3 border-b border-gray-50 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Information Profile</h3>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Perfume Variant Title</label>
                  <input type="text" placeholder="Mastan Blue Intense" value={pForm.name} onChange={(e) => setPForm({...pForm, name: e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/30 focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Retail Valuation Price (PKR)</label>
                  <input type="number" placeholder="4500" value={pForm.price} onChange={(e) => setPForm({...pForm, price: e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/30 focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Classification Node Group</label>
                  <select value={pForm.category_id} onChange={(e) => setPForm({...pForm, category_id: e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-white focus:outline-none focus:border-[#B8860B]">
                    <option value="">Choose Classification</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Fragrance Accord Profile & Description</label>
                  <textarea rows={2} placeholder="Detail notes structure (Top notes, Heart notes, Base logs)..." value={pForm.description} onChange={(e) => setPForm({...pForm, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/30 focus:outline-none focus:border-[#B8860B]"></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Olfactory Reference Connection (Inspired By)</label>
                  <input type="text" placeholder="Inspired by Bleu de Chanel" value={pForm.inspired_by} onChange={(e) => setPForm({...pForm, inspired_by: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/30 focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Image Content Engine URL</label>
                  <input type="text" placeholder="Paste structural image URL path" value={pForm.image_url} onChange={(e) => setPForm({...pForm, image_url: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/30 focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Initial Allocations Stock</label>
                  <input type="number" value={pForm.stock_quantity} onChange={(e) => setPForm({...pForm, stock_quantity: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/30 focus:outline-none focus:border-[#B8860B]" />
                </div>
                
                <div className="flex gap-8 items-center pt-2 md:col-span-2">
                  <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-semibold">
                    <input type="checkbox" checked={pForm.is_coming_soon} onChange={(e) => setPForm({...pForm, is_coming_soon: e.target.checked})} className="w-4 h-4 rounded accent-[#B8860B]" />
                    Assign Flag: Future Coming Soon Launch
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-semibold">
                    <input type="checkbox" checked={pForm.is_featured} onChange={(e) => setPForm({...pForm, is_featured: e.target.checked})} className="w-4 h-4 rounded accent-[#B8860B]" />
                    Assign Flag: Hero Banner Featured Variant
                  </label>
                </div>
                <div className="text-right">
                  <button type="submit" className="w-full md:w-auto bg-slate-950 text-white px-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] transition-all shadow-md">Publish Variant Matrix</button>
                </div>
              </form>

              {/* Perfumes Listing Grid Matrix */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Variant Specifications</th>
                      <th className="px-6 py-4 font-semibold">Price Node</th>
                      <th className="px-6 py-4 font-semibold">Stock Allocation</th>
                      <th className="px-6 py-4 font-semibold">System Matrix State</th>
                      <th className="px-6 py-4 font-semibold text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {perfumes.map((perfume) => (
                      <tr key={perfume.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={perfume.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80'} alt="Perfume Core" className="w-10 h-10 object-cover rounded-xl border bg-gray-50" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{perfume.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{perfume.inspired_by || 'Original Scent Architecture'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-gray-900">Rs. {perfume.price}</td>
                        <td className="px-6 py-4 font-mono">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${perfume.stock_quantity > 3 ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                            {perfume.stock_quantity} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {perfume.is_coming_soon ? (
                            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Future Drop</span>
                          ) : perfume.is_featured ? (
                            <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Hero Flagged</span>
                          ) : (
                            <span className="bg-green-50 text-green-600 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Active Catalog</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeletePerfume(perfume.id)} className="text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider text-[10px] transition-all px-3 py-1 rounded-md hover:bg-rose-50/50">Purge</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE ORDERS MANAGEMENT MATRIX (WITH LIVE SEARCH FILTER TRACKING) */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">Order Dispatch Router</h2>
                  <p className="text-xs text-gray-400 mt-1">Review live user requests, logistics paths tracking, and transactional flags metrics.</p>
                </div>
                
                {/* Advanced Search & Filtering Mechanism */}
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="Search customer name/email..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#B8860B] w-64 bg-white shadow-sm" />
                  <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-[#B8860B] shadow-sm">
                    <option value="all">All Lifecycles</option>
                    <option value="pending">Pending Processing</option>
                    <option value="shipped">Logistics Shipped</option>
                    <option value="delivered">Finalized Delivered</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User Matrix Account</th>
                      <th className="px-6 py-4 font-semibold">Total Order Valuation</th>
                      <th className="px-6 py-4 font-semibold">Logistics Lifecycle Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Update Order Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-gray-400 font-medium">No system order items tracked on specified filter constraints.</td>
                      </tr>
                    ) : filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold font-mono text-slate-700">
                              {order.customer_name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order.customer_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-gray-900 text-sm">Rs. {order.total_price}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' : 
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                            'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#B8860B] shadow-sm cursor-pointer text-gray-700">
                            <option value="pending">Mark Pending</option>
                            <option value="shipped">Mark Logistics Shipped</option>
                            <option value="delivered">Mark Finalized Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADVANCED ADMIN SECURITY PROFILE CONTROL SYSTEM FRAME */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in max-w-4xl">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Admin Identity Credentials</h2>
                <p className="text-xs text-gray-400 mt-1">Configure security layers, change public meta data view parameters, and operational roles.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 pb-8 mb-8">
                  <img src={adminProfile.avatar_url} alt="Admin Big Core" className="w-24 h-24 rounded-full object-cover ring-4 ring-[#B8860B]/20" />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{adminProfile.name}</h3>
                    <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider font-mono mt-1">{adminProfile.role}</p>
                    <p className="text-[11px] text-gray-400 mt-2 font-sans">System access granted via secure root configuration.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Public Profile Name</label>
                    <input type="text" value={adminProfile.name} onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Primary Store Communications Email</label>
                    <input type="email" value={adminProfile.email} onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Secure Telephone / Hotline Address</label>
                    <input type="text" value={adminProfile.phone} onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Avatar URL Image Anchor</label>
                    <input type="text" value={adminProfile.avatar_url} onChange={(e) => setAdminProfile({...adminProfile, avatar_url: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div className="md:col-span-2 border-t border-gray-50 pt-4 text-right">
                    <button type="submit" className="bg-slate-950 text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] transition-all shadow-md">Update Store Credentials</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}