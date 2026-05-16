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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'profile'>('overview');
  const [categories, setCategories] = useState<Category[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    price: string;
    stock_quantity: string;
    is_coming_soon: boolean;
    is_featured: boolean;
    inspired_by: string;
    image_url: string;
  }>({
    name: '', price: '', stock_quantity: '', is_coming_soon: false, is_featured: false, inspired_by: '', image_url: ''
  });

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Fully Functional Real Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: 'Shahbaz Ali',
    email: 'admin@khushbuekhas.com',
    phone: '+92 300 1234567',
    role: 'Store Owner & Lead Developer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'
  });

  // Temporary Form fields during profile editing
  const [profileForm, setProfileForm] = useState({ ...adminProfile });

  // Creation Forms State
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
    
    const { data: ords } = await supabase
      .from('orders')
      .select(`
        *,
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
      .order('created_at', { ascending: false });
    
    if (cats) setCategories(cats);
    if (pfs) setPerfumes(pfs);
    if (ords) setOrders(ords);
  };

  // Calculations
  const totalSalesRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // Image Upload for Editing Row
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setEditUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('perfume-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('perfume-images')
        .getPublicUrl(filePath);

      setEditForm(prev => ({ ...prev, image_url: publicUrl }));
      alert("Product image updated successfully!");

    } catch (error: any) {
      alert(`Image upload failed: ${error.message}`);
    } finally {
      setEditUploading(false);
    }
  };

  const startEditing = (perfume: Perfume) => {
    setEditingId(perfume.id);
    setEditForm({
      name: perfume.name,
      price: perfume.price.toString(),
      stock_quantity: perfume.stock_quantity.toString(),
      is_coming_soon: perfume.is_coming_soon,
      is_featured: perfume.is_featured,
      inspired_by: perfume.inspired_by || '',
      image_url: perfume.image_url
    });
  };

  const handleUpdatePerfume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mastan_perfumes')
        .update({
          name: editForm.name,
          price: parseFloat(editForm.price),
          stock_quantity: parseInt(editForm.stock_quantity),
          is_coming_soon: editForm.is_coming_soon,
          is_featured: editForm.is_featured,
          inspired_by: editForm.inspired_by,
          image_url: editForm.image_url,
          slug: editForm.name.toLowerCase().replace(/ /g, '-')
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      fetchData();
      alert('Product updated successfully!');
    } catch (error: any) {
      alert(`Update failed: ${error.message}`);
    }
  };

  // Image Upload for New Product Form
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) throw new Error('Please select an image file.');

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('perfume-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('perfume-images')
        .getPublicUrl(filePath);

      setPForm({ ...pForm, image_url: publicUrl });
      setImagePreview(publicUrl);
      alert("Image uploaded to storage successfully!");

    } catch (error: any) {
      alert(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = catName.toLowerCase().replace(/ /g, '-');
    const { error } = await supabase.from('mastan_categories').insert([{ name: catName, slug }]);
    if (!error) { setCatName(''); fetchData(); alert('Category Added!'); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await supabase.from('mastan_categories').delete().eq('id', id);
      fetchData();
    }
  };

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
      setImagePreview('');
      fetchData();
      alert('Product published successfully!');
    }
  };

  const handleDeletePerfume = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await supabase.from('mastan_perfumes').delete().eq('id', id);
      fetchData();
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      fetchData();
      alert(`Order status updated to: ${newStatus}`);
    }
  };

  // Profile Save Action
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminProfile({ ...profileForm }); // Saves the data to top header state globally
    alert("Admin profile updated successfully!");
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex font-sans antialiased text-gray-900">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col justify-between border-r border-slate-800 shadow-xl z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-9 w-1 bg-[#B8860B] rounded-full"></div>
            <div>
              <h2 className="text-sm font-bold tracking-[0.25em] text-[#B8860B] uppercase">Khushbu-e-Khaas</h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Admin Dashboard v2.6</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'overview' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-14 0v8a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 112-2h2a2 2 0 012 2v4a2 2 0 002 2h2a2 2 0 002-2v-8m-14 0L12 5l7 7" /></svg>
              Overview
            </button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'products' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l-8 4" /></svg>
              Manage Products
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'categories' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
              Categories
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'orders' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Orders List
              {pendingOrdersCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-mono animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${activeTab === 'profile' ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/10' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Admin Profile
            </button>
          </nav>
        </div>

        {/* Sidebar Profile Sync Footer */}
        <div className="p-6 border-t border-slate-900 bg-slate-950/50 flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('profile')}>
          <img src={adminProfile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#B8860B]/30 group-hover:ring-[#B8860B] transition-all" />
          <div className="truncate">
            <p className="text-xs font-bold truncate group-hover:text-[#B8860B] transition-all">{adminProfile.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{adminProfile.email}</p>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN DASHBOARD HUB */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm relative z-20">
          <h1 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Navigation / <span className="text-gray-900 font-mono text-xs font-bold">{activeTab}</span>
          </h1>
        </header>

        <main className="flex-1 p-10 overflow-y-auto max-w-[1600px] w-full mx-auto">
          
          {/* TAB 0: OVERVIEW CONSOLE PANEL */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {adminProfile.name}</h2>
                <p className="text-xs text-gray-400 mt-1">Here is a summary of your online store diagnostics.</p>
              </div>

              {/* STATS COUNT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</p>
                    <h3 className="text-xl font-extrabold font-mono mt-2">Rs. {totalSalesRevenue}</h3>
                  </div>
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">PKR</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Products</p>
                    <h3 className="text-xl font-extrabold font-mono mt-2">{perfumes.length} Items</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Categories</p>
                    <h3 className="text-xl font-extrabold font-mono mt-2">{categories.length} Nodes</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Orders</p>
                    <h3 className="text-xl font-extrabold font-mono mt-2">{pendingOrdersCount} Wait</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent System Activity</h3>
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-left text-xs text-gray-500">
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {orders.slice(0, 4).map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-bold text-gray-900">{o.customer_name}</td>
                            <td className="px-4 py-3 font-mono font-bold">Rs. {o.total_price}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Watch */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Stock Alerts</h3>
                  <div className="space-y-3">
                    {perfumes.slice(0, 4).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2.5 bg-gray-50/70 rounded-xl text-xs">
                        <span className="font-bold text-gray-800 truncate">{p.name}</span>
                        <span className={`font-mono px-2 py-0.5 rounded-md text-[10px] font-bold ${p.stock_quantity > 3 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{p.stock_quantity} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CATEGORIES CRUD */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Manage Product Categories</h2>
                <p className="text-xs text-gray-400 mt-1">Add, update or view the categories structured inside your store catalog layout.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Create New Category</h3>
                  <input type="text" placeholder="Category Name (e.g., Winter Oud, Musks)" value={catName} onChange={(e) => setCatName(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B] bg-gray-50/50" />
                  <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B]">Add Category</button>
                </form>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
                  <table className="w-full text-left text-xs text-gray-500">
                    <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Category Title</th>
                        <th className="px-6 py-4 font-semibold">System Slug URL</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                          <td className="px-6 py-4 font-mono text-gray-400">{cat.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider text-[10px]">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PRODUCTS CATALOG MATRIX */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Products Inventory Hub</h2>
                <p className="text-xs text-gray-400 mt-1">Configure retail catalog values, stock quantity buffers, and active layout status flags.</p>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleAddPerfume} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Product Name</label>
                  <input type="text" placeholder="e.g., Mastan Gold Intense" value={pForm.name} onChange={(e) => setPForm({...pForm, name: e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Product Price (PKR)</label>
                  <input type="number" placeholder="e.g., 4500" value={pForm.price} onChange={(e) => setPForm({...pForm, price: e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Product Category Group</label>
                  <select value={pForm.category_id} onChange={(e) => setPForm({...pForm, category_id: e.target.value})} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-white focus:outline-none focus:border-[#B8860B]">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Product Description & Scent Notes</label>
                  <textarea rows={2} placeholder="Describe the top, heart, and base notes structure..." value={pForm.description} onChange={(e) => setPForm({...pForm, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B]"></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Inspired By Reference Scent</label>
                  <input type="text" placeholder="e.g., Inspired by Creed Aventus" value={pForm.inspired_by} onChange={(e) => setPForm({...pForm, inspired_by: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Product Bottle Image File</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-2.5 px-4 cursor-pointer hover:border-[#B8860B] bg-gray-50/50">
                      <span className="text-xs font-semibold text-gray-600">{uploading ? "Uploading File..." : "Choose Image File"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-xl border bg-white" />}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Initial Stock Available</label>
                  <input type="number" value={pForm.stock_quantity} onChange={(e) => setPForm({...pForm, stock_quantity: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#B8860B]" />
                </div>
                
                <div className="flex gap-8 items-center pt-2 md:col-span-2">
                  <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-semibold">
                    <input type="checkbox" checked={pForm.is_coming_soon} onChange={(e) => setPForm({...pForm, is_coming_soon: e.target.checked})} className="accent-[#B8860B]" /> Mark as Coming Soon
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer font-semibold">
                    <input type="checkbox" checked={pForm.is_featured} onChange={(e) => setPForm({...pForm, is_featured: e.target.checked})} className="accent-[#B8860B]" /> Feature on Hero Home Banner
                  </label>
                </div>
                <div className="text-right">
                  <button type="submit" className="bg-slate-950 text-white px-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B]">Publish Product Entry</button>
                </div>
              </form>

              {/* PRODUCTS LIST TABLE VIEW GRID WITH INLINE IMAGE EXTRA ENGINES */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product Specifications</th>
                      <th className="px-6 py-4 font-semibold">Price Node</th>
                      <th className="px-6 py-4 font-semibold">Stock Allocation</th>
                      <th className="px-6 py-4 font-semibold">Catalog Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {perfumes.map((perfume) => {
                      const isCurrentlyEditing = editingId === perfume.id;

                      return (
                        <tr key={perfume.id} className={`transition-colors ${isCurrentlyEditing ? 'bg-amber-50/40' : 'hover:bg-gray-50/70'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative group">
                                <img src={isCurrentlyEditing ? editForm.image_url : (perfume.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80')} alt="Product File Asset" className="w-12 h-12 object-cover rounded-xl border bg-gray-50 flex-shrink-0" />
                                
                                {isCurrentlyEditing && (
                                  <label className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center cursor-pointer text-[8px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {editUploading ? "..." : "CHANGE"}
                                    <input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={editUploading} className="hidden" />
                                  </label>
                                )}
                              </div>
                              
                              <div className="w-full max-w-xs">
                                {isCurrentlyEditing ? (
                                  <div className="space-y-1.5">
                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none font-bold" placeholder="Product Name" />
                                    <input type="text" value={editForm.inspired_by} onChange={(e) => setEditForm({...editForm, inspired_by: e.target.value})} className="w-full border border-gray-200 rounded-lg px-2 py-0.5 text-[10px] focus:outline-none text-gray-500" placeholder="Inspired by..." />
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{perfume.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{perfume.inspired_by || 'Original Formula'}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold font-mono text-gray-900">
                            {isCurrentlyEditing ? (
                              <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-xs" />
                            ) : (
                              `Rs. ${perfume.price}`
                            )}
                          </td>

                          <td className="px-6 py-4 font-mono">
                            {isCurrentlyEditing ? (
                              <input type="number" value={editForm.stock_quantity} onChange={(e) => setEditForm({...editForm, stock_quantity: e.target.value})} className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-xs" />
                            ) : (
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${perfume.stock_quantity > 3 ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>{perfume.stock_quantity} units</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {isCurrentlyEditing ? (
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold flex items-center gap-1"><input type="checkbox" checked={editForm.is_coming_soon} onChange={(e) => setEditForm({...editForm, is_coming_soon: e.target.checked})} /> Coming Soon</label>
                                <label className="text-[10px] font-semibold flex items-center gap-1"><input type="checkbox" checked={editForm.is_featured} onChange={(e) => setEditForm({...editForm, is_featured: e.target.checked})} /> Featured Hero</label>
                              </div>
                            ) : (
                              <div>
                                {perfume.is_coming_soon ? <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">Coming Soon</span> : perfume.is_featured ? <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">Hero Featured</span> : <span className="bg-green-50 text-green-600 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">Active</span>}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {isCurrentlyEditing ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleUpdatePerfume(perfume.id)} className="text-green-600 hover:text-green-800 font-bold text-[10px] bg-green-50 px-2.5 py-1 rounded-md border">Save</button>
                                <button onClick={() => setEditingId(null)} className="text-gray-400 font-bold text-[10px] bg-gray-50 px-2 py-1 rounded-md border">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-3">
                                <button onClick={() => startEditing(perfume)} className="text-blue-600 hover:text-blue-800 font-bold text-[10px]">Edit</button>
                                <span className="text-gray-200">|</span>
                                <button onClick={() => handleDeletePerfume(perfume.id)} className="text-rose-600 hover:text-rose-800 font-bold text-[10px]">Purge</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SECURE LIVE ORDERS MANAGEMENTS TRACKING */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">Incoming Orders Router</h2>
                  <p className="text-xs text-gray-400 mt-1">Review user purchase transactions, shipment routes, and logistics processing status pipelines.</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="Search customer name/email..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs w-64 bg-white shadow-sm" />
                  <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-white shadow-sm">
                    <option value="all">All Lifecycles</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs text-gray-500">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Customer Account</th>
                      <th className="px-6 py-4 font-semibold">Items Requested</th>
                      <th className="px-6 py-4 font-semibold">Total Price</th>
                      <th className="px-6 py-4 font-semibold">Logistics Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="align-top hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm">{order.customer_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2 max-w-sm">
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border">
                                <img src={item.mastan_perfumes?.image_url} alt="Thumbnail asset" className="w-6 h-6 object-cover rounded-md border" />
                                <p className="font-bold text-xs truncate text-gray-800">{item.mastan_perfumes?.name} <span className="text-gray-400 text-[10px] font-normal">(x{item.quantity})</span></p>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-gray-900 text-sm pt-5">Rs. {order.total_price}</td>
                        <td className="px-6 py-4 pt-5">
                          <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right pt-4">
                          <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 bg-white text-gray-700 shadow-sm cursor-pointer">
                            <option value="pending">Mark Pending</option>
                            <option value="shipped">Mark Shipped</option>
                            <option value="delivered">Mark Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADVANCED ACTIVE ADMIN PROFILE SYSTEM MODIFICATION LAYER */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in max-w-4xl">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Admin Account Credentials</h2>
                <p className="text-xs text-gray-400 mt-1">Modify global header layout metadata identities, communication paths, and roles dynamically.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 pb-8 mb-8">
                  <img src={adminProfile.avatar_url} alt="Admin Main Master Image" className="w-24 h-24 rounded-full object-cover ring-4 ring-[#B8860B]/20 shadow-inner" />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{adminProfile.name}</h3>
                    <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider font-mono mt-1">{adminProfile.role}</p>
                    <p className="text-[11px] text-gray-400 mt-2">Active session root keys loaded safely.</p>
                  </div>
                </div>

                {/* Profile Edit Submission Form */}
                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Public Profile Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Primary Communications Email</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Hotline Telephone Node</label>
                    <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Profile Avatar Image Anchor URL</label>
                    <input type="text" value={profileForm.avatar_url} onChange={(e) => setProfileForm({...profileForm, avatar_url: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs bg-gray-50/50 focus:outline-none focus:border-[#B8860B] text-gray-900 font-semibold" />
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