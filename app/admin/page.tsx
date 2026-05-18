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
    setAdminProfile({ ...profileForm });
    alert("Admin profile updated successfully!");
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#090D16] flex font-sans antialiased text-gray-200 w-full overflow-x-hidden relative">
      
      {/* BACKGROUND GRAPHICS MATRIX AMBIENCE */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#B8860B]/10 to-transparent rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#0C1220]/90 border-r border-gray-800/60 backdrop-blur-md flex flex-shrink-0 flex-col justify-between shadow-2xl z-30 relative">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-14">
            <div className="h-9 w-[3px] bg-gradient-to-b from-[#B8860B] to-[#D4AF37] rounded-full"></div>
            <div>
              <h2 className="text-sm font-extrabold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] to-[#D4AF37] uppercase">Khushbu-e-Khaas</h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5 font-bold">Imperial Matrix v2.6</p>
            </div>
          </div>
          
          <nav className="space-y-2.5">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 ${activeTab === 'overview' ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white shadow-lg shadow-[#B8860B]/20 scale-[1.02]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-14 0v8a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 112-2h2a2 2 0 012 2v4a2 2 0 002 2h2a2 2 0 002-2v-8m-14 0L12 5l7 7" /></svg>
              Overview Console
            </button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 ${activeTab === 'products' ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white shadow-lg shadow-[#B8860B]/20 scale-[1.02]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l-8 4" /></svg>
              Manage Vault
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 ${activeTab === 'categories' ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white shadow-lg shadow-[#B8860B]/20 scale-[1.02]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
              Scent Families
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 ${activeTab === 'orders' ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white shadow-lg shadow-[#B8860B]/20 scale-[1.02]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Fulfillment Logs
              {pendingOrdersCount > 0 && (
                <span className="ml-auto bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-black shadow-sm shadow-red-500/30">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-300 ${activeTab === 'profile' ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white shadow-lg shadow-[#B8860B]/20 scale-[1.02]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Boutique Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Profile Sync Footer */}
        <div className="p-6 border-t border-gray-800/40 bg-slate-950/40 flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('profile')}>
          <img src={adminProfile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#B8860B]/40 group-hover:ring-[#D4AF37] transition-all duration-300 shadow-md" />
          <div className="truncate text-left">
            <p className="text-xs font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">{adminProfile.name}</p>
            <p className="text-[10px] text-gray-500 truncate font-mono mt-0.5">{adminProfile.email}</p>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN DASHBOARD HUB */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full">
        <header className="h-20 bg-[#0C1220]/40 backdrop-blur-md border-b border-gray-800/40 flex items-center justify-between px-10 shadow-sm relative z-20">
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            System Workspace / <span className="text-white font-mono font-black bg-white/5 px-2.5 py-1 rounded-md">{activeTab}</span>
          </h1>
        </header>

        <main className="flex-1 p-10 overflow-y-auto w-full mx-auto">
          
          {/* TAB 0: OVERVIEW CONSOLE PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-fade-in-up">
              <div className="text-left">
                <h2 className="text-3xl font-light font-serif text-white tracking-tight">Imperial Operations Console, <span className="italic text-[#D4AF37] font-normal">{adminProfile.name}</span></h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Real-time metrics log matrix configuration tracker for your premium essences brand row.</p>
              </div>

              {/* STATS COUNT CARDS - DESIGNER RE-ARCH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-b from-[#111726] to-[#0C1220] p-6 rounded-[2rem] border border-gray-800/60 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Liquidity Flow</p>
                    <h3 className="text-2xl font-extrabold font-mono text-white tracking-tight">Rs. {totalSalesRevenue}</h3>
                    <p className="text-[9px] text-emerald-500 font-medium bg-emerald-500/10 w-fit px-2 py-0.5 rounded-md">Delivered Gross</p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-mono font-black text-xs">PKR</div>
                </div>

                <div className="bg-gradient-to-b from-[#111726] to-[#0C1220] p-6 rounded-[2rem] border border-gray-800/60 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#B8860B]/5 rounded-full blur-2xl group-hover:bg-[#B8860B]/10 transition-all"></div>
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Bottlings</p>
                    <h3 className="text-2xl font-extrabold font-mono text-white tracking-tight">{perfumes.length} SKUs</h3>
                    <p className="text-[9px] text-[#D4AF37] font-medium bg-[#B8860B]/10 w-fit px-2 py-0.5 rounded-md">Live Storefront</p>
                  </div>
                  <div className="w-11 h-11 bg-[#B8860B]/10 border border-[#B8860B]/20 text-[#D4AF37] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" /></svg>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-[#111726] to-[#0C1220] p-6 rounded-[2rem] border border-gray-800/60 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Olfactory Categories</p>
                    <h3 className="text-2xl font-extrabold font-mono text-white tracking-tight">{categories.length} Nodes</h3>
                    <p className="text-[9px] text-blue-400 font-medium bg-blue-500/10 w-fit px-2 py-0.5 rounded-md">Families Linked</p>
                  </div>
                  <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-[#111726] to-[#0C1220] p-6 rounded-[2rem] border border-gray-800/60 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Awaiting Shipments</p>
                    <h3 className="text-2xl font-extrabold font-mono text-white tracking-tight">{pendingOrdersCount} Queue</h3>
                    <p className="text-[9px] text-amber-500 font-medium bg-amber-500/10 w-fit px-2 py-0.5 rounded-md">Pending Manifest</p>
                  </div>
                  <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
              </div>

              {/* RECENT MATRIX AND STOCK CONTROLS SPLIT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Luxury Sheet */}
                <div className="bg-[#0C1220]/60 backdrop-blur-md p-6 rounded-[2rem] border border-gray-800/60 shadow-xl lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Recent Pipeline Manifests</h3>
                  <div className="overflow-hidden rounded-2xl border border-gray-800/40">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="bg-white/5 border-b border-gray-800/40 text-[10px] uppercase font-bold text-gray-500">
                        <tr>
                          <th className="px-5 py-3.5">Consignee</th>
                          <th className="px-5 py-3.5">Order Total</th>
                          <th className="px-5 py-3.5 text-right">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/30 text-gray-300 bg-white/[0.01]">
                        {orders.slice(0, 4).map(o => (
                          <tr key={o.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 font-bold text-white">{o.customer_name}</td>
                            <td className="px-5 py-4 font-mono font-bold text-[#D4AF37]">Rs. {o.total_price}</td>
                            <td className="px-5 py-4 text-right">
                              <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${o.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Watcher Alerts Block */}
                <div className="bg-[#0C1220]/60 backdrop-blur-md p-6 rounded-[2rem] border border-gray-800/60 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Olfactory Oils Reserves Alerts</h3>
                  <div className="space-y-3.5">
                    {perfumes.slice(0, 4).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3.5 bg-white/[0.02] border border-gray-800/40 rounded-xl text-xs hover:border-gray-800 transition-colors">
                        <span className="font-bold text-gray-200 truncate pr-4 text-left">{p.name}</span>
                        <span className={`font-mono px-2.5 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0 ${p.stock_quantity > 3 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{p.stock_quantity} ml batch</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CATEGORIES CRUD */}
          {activeTab === 'categories' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-light font-serif text-white">Scent Families Architecture</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Add or manage taxonomy groups inside your centralized olfactory catalog.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <form onSubmit={handleAddCategory} className="bg-[#0C1220]/60 backdrop-blur-md p-6 rounded-[2rem] border border-gray-800/60 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Initialize Scent Family</h3>
                  <input type="text" placeholder="e.g., Floral Ambers, Woody Musk" value={catName} onChange={(e) => setCatName(e.target.value)} required className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#B8860B] bg-slate-950 text-white placeholder-gray-600 font-medium" />
                  <button type="submit" className="w-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-md">Compile Node Entry</button>
                </form>
                <div className="bg-[#0C1220]/60 backdrop-blur-md rounded-[2rem] border border-gray-800/60 shadow-xl overflow-hidden lg:col-span-2">
                  <table className="w-full text-left text-xs text-gray-400">
                    <thead className="bg-white/5 border-b border-gray-800/40 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Scent Family Title</th>
                        <th className="px-6 py-4">URL Routing slug</th>
                        <th className="px-6 py-4 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/30 text-gray-300 bg-white/[0.01]">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold text-white text-sm">{cat.name}</td>
                          <td className="px-6 py-4 font-mono text-gray-500 text-xs">{cat.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-rose-400 hover:text-rose-500 font-bold uppercase tracking-wider text-[10px] bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">Purge</button>
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
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-light font-serif text-white">Perfumes & Infusions Vault</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Configure high-end catalog specs, fluid ounces data stock, and home layout flags.</p>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleAddPerfume} className="bg-[#0C1220]/60 backdrop-blur-md p-8 rounded-[2rem] border border-gray-800/60 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Essence Name</label>
                  <input type="text" placeholder="e.g., Mastan Gold Intense" value={pForm.name} onChange={(e) => setPForm({...pForm, name: e.target.value})} required className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#B8860B] bg-slate-950 text-white font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Price Allocation (PKR)</label>
                  <input type="number" placeholder="e.g., 4500" value={pForm.price} onChange={(e) => setPForm({...pForm, price: e.target.value})} required className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#B8860B] bg-slate-950 text-white font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Scent Family Relational Link</label>
                  <select value={pForm.category_id} onChange={(e) => setPForm({...pForm, category_id: e.target.value})} required className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs bg-slate-950 text-gray-400 focus:outline-none focus:border-[#B8860B] font-bold cursor-pointer">
                    <option value="">Select Family Row</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Olfactory Pyramid Description (Top, Heart, Base Notes)</label>
                  <textarea rows={2} placeholder="Describe the structural aromatic compound transition pipeline layers..." value={pForm.description} onChange={(e) => setPForm({...pForm, description: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#B8860B] bg-slate-950 text-white leading-relaxed"></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Inspired By Global Luxury Classic</label>
                  <input type="text" placeholder="e.g., Inspired by Creed Aventus" value={pForm.inspired_by} onChange={(e) => setPForm({...pForm, inspired_by: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#B8860B] bg-slate-950 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Bespoke Flacon Asset Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center border border-gray-800 border-dashed rounded-xl py-3 px-4 cursor-pointer hover:border-[#B8860B] bg-slate-950 text-gray-400 transition-colors">
                      <span className="text-xs font-bold uppercase tracking-wide">{uploading ? "Pushing Binary..." : "Upload Image Asset"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-gray-800 bg-slate-950 shadow-md" />}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Initial Volume Inventory Allocation</label>
                  <input type="number" value={pForm.stock_quantity} onChange={(e) => setPForm({...pForm, stock_quantity: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#B8860B] bg-slate-950 text-white font-mono" />
                </div>
                
                <div className="flex gap-8 items-center pt-2 md:col-span-2">
                  <label className="flex items-center gap-2.5 text-xs text-gray-400 cursor-pointer font-bold select-none group">
                    <input type="checkbox" checked={pForm.is_coming_soon} onChange={(e) => setPForm({...pForm, is_coming_soon: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-slate-950 accent-[#B8860B]" /> Mark as Coming Soon
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-gray-400 cursor-pointer font-bold select-none group">
                    <input type="checkbox" checked={pForm.is_featured} onChange={(e) => setPForm({...pForm, is_featured: e.target.checked})} className="w-4 h-4 rounded border-gray-700 bg-slate-950 accent-[#B8860B]" /> Feature on Home Hero Banner
                  </label>
                </div>
                <div className="text-right">
                  <button type="submit" className="bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white px-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg w-full md:w-auto">Publish Product Entry</button>
                </div>
              </form>

              {/* PRODUCTS LIST TABLE VIEW */}
              <div className="bg-[#0C1220]/60 backdrop-blur-md rounded-[2rem] border border-gray-800/60 shadow-xl overflow-hidden">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-white/5 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-800/40">
                    <tr>
                      <th className="px-6 py-4">Product Specifications</th>
                      <th className="px-6 py-4">Price Node</th>
                      <th className="px-6 py-4">Inventory Units</th>
                      <th className="px-6 py-4">System Tag status</th>
                      <th className="px-6 py-4 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/30 text-gray-300 bg-white/[0.01]">
                    {perfumes.map((perfume) => {
                      const isCurrentlyEditing = editingId === perfume.id;

                      return (
                        <tr key={perfume.id} className={`transition-colors ${isCurrentlyEditing ? 'bg-[#B8860B]/10' : 'hover:bg-white/5'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative group flex-shrink-0">
                                <img src={isCurrentlyEditing ? editForm.image_url : (perfume.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80')} alt="Asset file" className="w-14 h-14 object-cover rounded-xl border border-gray-800 bg-slate-950 shadow-md" />
                                {isCurrentlyEditing && (
                                  <label className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center cursor-pointer text-[8px] text-white font-black tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    {editUploading ? "..." : "REPLACE"}
                                    <input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={editUploading} className="hidden" />
                                  </label>
                                )}
                              </div>
                              
                              <div className="w-full max-w-xs text-left">
                                {isCurrentlyEditing ? (
                                  <div className="space-y-1.5">
                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-950 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none text-white font-bold" />
                                    <input type="text" value={editForm.inspired_by} onChange={(e) => setEditForm({...editForm, inspired_by: e.target.value})} className="w-full bg-slate-950 border border-gray-800 rounded-lg px-2 py-1 text-[10px] focus:outline-none text-gray-400" />
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-extrabold text-white text-base tracking-tight">{perfume.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{perfume.inspired_by || 'Original Composition Formula'}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold font-mono text-[#D4AF37] text-sm">
                            {isCurrentlyEditing ? (
                              <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-24 bg-slate-950 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white" />
                            ) : (
                              `Rs. ${perfume.price}`
                            )}
                          </td>

                          <td className="px-6 py-4 font-mono">
                            {isCurrentlyEditing ? (
                              <input type="number" value={editForm.stock_quantity} onChange={(e) => setEditForm({...editForm, stock_quantity: e.target.value})} className="w-20 bg-slate-950 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white" />
                            ) : (
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${perfume.stock_quantity > 3 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>{perfume.stock_quantity} available</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {isCurrentlyEditing ? (
                              <div className="flex flex-col gap-1 text-left">
                                <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><input type="checkbox" checked={editForm.is_coming_soon} onChange={(e) => setEditForm({...editForm, is_coming_soon: e.target.checked})} className="accent-[#B8860B]" /> Coming Soon</label>
                                <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><input type="checkbox" checked={editForm.is_featured} onChange={(e) => setEditForm({...editForm, is_featured: e.target.checked})} className="accent-[#B8860B]" /> Featured Hero</label>
                              </div>
                            ) : (
                              <div className="text-left">
                                {perfume.is_coming_soon ? <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Vault Preview</span> : perfume.is_featured ? <span className="bg-amber-500/10 border border-amber-500/20 text-[#D4AF37] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Hero Banner</span> : <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Active Roll</span>}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {isCurrentlyEditing ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleUpdatePerfume(perfume.id)} className="text-green-400 hover:text-green-500 font-bold text-[10px] bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">Commit</button>
                                <button onClick={() => setEditingId(null)} className="text-gray-400 font-bold text-[10px] bg-white/5 px-2.5 py-1.5 rounded-lg border border-gray-800">Close</button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-4 font-bold text-[11px]">
                                <button onClick={() => startEditing(perfume)} className="text-blue-400 hover:text-blue-500">Edit Specs</button>
                                <span className="text-gray-800">|</span>
                                <button onClick={() => handleDeletePerfume(perfume.id)} className="text-rose-400 hover:text-rose-500">Purge</button>
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
            <div className="space-y-8 animate-fade-in text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light font-serif text-white">Incoming Orders Hub</h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Review customer purchases manifest rows, logistics sorting nodes, and dispatch tracks.</p>
                </div>
                <div className="flex items-center gap-3.5">
                  <input type="text" placeholder="Search client credentials..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="border border-gray-800 rounded-xl px-4 py-2.5 text-xs w-64 bg-slate-950 text-white placeholder-gray-600 focus:outline-none focus:border-[#B8860B]" />
                  <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="border border-gray-800 rounded-xl px-4 py-2.5 text-xs bg-slate-950 text-gray-400 font-bold focus:outline-none focus:border-[#B8860B] cursor-pointer">
                    <option value="all">All Lifecycles</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#0C1220]/60 backdrop-blur-md rounded-[2rem] border border-gray-800/60 shadow-xl overflow-hidden">
                <table className="w-full text-left text-xs text-gray-400">
                  <thead className="bg-white/5 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-800/40">
                    <tr>
                      <th className="px-6 py-4">Customer Credentials</th>
                      <th className="px-6 py-4">Composition Request</th>
                      <th className="px-6 py-4">Total Price</th>
                      <th className="px-6 py-4">Logistics State</th>
                      <th className="px-6 py-4 text-right">Dispatched Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/30 text-gray-300 bg-white/[0.01]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="align-top hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-base tracking-tight">{order.customer_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2 max-w-sm">
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-gray-800/40">
                                <img src={item.mastan_perfumes?.image_url} alt="Variant thumbnail" className="w-7 h-7 object-cover rounded-lg border border-gray-800 bg-slate-950 flex-shrink-0 shadow-inner" />
                                <p className="font-extrabold text-xs text-gray-200 truncate">{item.mastan_perfumes?.name} <span className="text-[#D4AF37] text-[10px] font-mono font-bold">({item.quantity} units)</span></p>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-[#D4AF37] text-base pt-5">Rs. {order.total_price}</td>
                        <td className="px-6 py-4 pt-5">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right pt-4">
                          <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border border-gray-800 text-xs font-bold rounded-xl px-3 py-2 bg-slate-950 text-gray-400 shadow-md cursor-pointer focus:outline-none focus:border-[#B8860B]">
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

          {/* TAB 4: ADVANCED ACTIVE ADMIN PROFILE SYSTEM */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in max-w-4xl text-left space-y-8">
              <div>
                <h2 className="text-2xl font-light font-serif text-white">Boutique Administration Nodes</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Modify top layout branding metrics metadata keys and owner tokens.</p>
              </div>

              <div className="bg-[#0C1220]/60 backdrop-blur-md rounded-[2rem] border border-gray-800/60 shadow-xl p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-800/40 pb-8 mb-8 relative z-10">
                  <img src={adminProfile.avatar_url} alt="Master avatar key" className="w-24 h-24 rounded-full object-cover ring-4 ring-[#D4AF37]/30 shadow-2xl" />
                  <div className="text-center sm:text-left space-y-0.5">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{adminProfile.name}</h3>
                    <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest font-mono">{adminProfile.role}</p>
                    <p className="text-[10px] text-gray-500 font-medium pt-1.5">Secure core session active. Hardware token authorized configuration nodes loaded safely.</p>
                  </div>
                </div>

                {/* Profile Edit Submission Form */}
                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Public Admin Identity Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs bg-slate-950 text-white font-bold focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Primary Operations Gateway Email</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs bg-slate-950 text-white font-bold focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Hotline Telephone Comms Node</label>
                    <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs bg-slate-950 text-white font-bold focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Avatar Profile Secure Public URL</label>
                    <input type="text" value={profileForm.avatar_url} onChange={(e) => setProfileForm({...profileForm, avatar_url: e.target.value})} className="w-full border border-gray-800 rounded-xl px-4 py-3.5 text-xs bg-slate-950 text-white font-mono focus:outline-none focus:border-[#B8860B]" />
                  </div>
                  <div className="md:col-span-2 border-t border-gray-800/40 pt-4 text-right">
                    <button type="submit" className="bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#B8860B]/10">Update Global Store Credentials</button>
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
