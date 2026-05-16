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
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  
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
    if (cats) setCategories(cats);
    if (pfs) setPerfumes(pfs);
  };

  // 1. Category Insert
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = catName.toLowerCase().replace(/ /g, '-');
    const { error } = await supabase.from('mastan_categories').insert([{ name: catName, slug }]);
    if (!error) { setCatName(''); fetchData(); alert('Category Added!'); }
  };

  // 2. Category Delete
  const handleDeleteCategory = async (id: string) => {
    await supabase.from('mastan_categories').delete().eq('id', id);
    fetchData();
  };

  // 3. Perfume Insert
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
      alert('Perfume Uploaded Successfully!');
    } else {
      console.error(error);
    }
  };
// Is portion ko apne Admin Dashboard ke state variables ke sath merge karein:
const [orders, setOrders] = useState<any[]>([]);
const [adminProfile, setAdminProfile] = useState({ name: 'Shahbaz Ali', avatar: '', phone: '' });

// Fetch data mein orders call add karein:
const fetchOrders = async () => {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (data) setOrders(data);
};

// Status Change Handler
const handleStatusChange = async (orderId: string, newStatus: string) => {
  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  fetchOrders();
  alert(`Order status updated to ${newStatus}`);
};
  // 4. Perfume Delete
  const handleDeletePerfume = async (id: string) => {
    await supabase.from('mastan_perfumes').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-[#B8860B] mb-10">KHUSHBU-E-KHAAS ADMIN</h2>
          <nav className="space-y-4">
            <button onClick={() => setActiveTab('products')} className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'products' ? 'bg-[#B8860B] text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
              Manage Perfumes
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'categories' ? 'bg-[#B8860B] text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
              Categories CRUD
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* Main Content Area */}
<main className="flex-1 p-10 overflow-y-auto">
  
  {/* 1. CATEGORIES TAB */}
  {activeTab === 'categories' && (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Categories Management</h1>
      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mb-8 flex gap-4">
        <input type="text" placeholder="Category Name (e.g., Luxury, Woody)" value={catName} onChange={(e) => setCatName(e.target.value)} required className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#B8860B]" />
        <button type="submit" className="bg-[#B8860B] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#966F0A] transition-all">Add</button>
      </form>
      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-md">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* 2. PERFUMES TAB */}
  {activeTab === 'products' && (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Perfume Upload & Management</h1>
      {/* Add Perfume Form */}
      <form onSubmit={handleAddPerfume} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Perfume Name</label>
          <input type="text" placeholder="Mastan Intense" value={pForm.name} onChange={(e) => setPForm({...pForm, name: e.target.value})} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8860B]" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Price (PKR)</label>
          <input type="number" placeholder="4500" value={pForm.price} onChange={(e) => setPForm({...pForm, price: e.target.value})} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8860B]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Description</label>
          <textarea rows={3} placeholder="Describe the luxury notes..." value={pForm.description} onChange={(e) => setPForm({...pForm, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8860B]"></textarea>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Inspired By Reference</label>
          <input type="text" placeholder="Inspired by Tom Ford Oud Wood" value={pForm.inspired_by} onChange={(e) => setPForm({...pForm, inspired_by: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8860B]" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Image URL</label>
          <input type="text" placeholder="https://unsplash.com/... or paste image link" value={pForm.image_url} onChange={(e) => setPForm({...pForm, image_url: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8860B]" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Select Category</label>
          <select value={pForm.category_id} onChange={(e) => setPForm({...pForm, category_id: e.target.value})} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#B8860B]">
            <option value="">Choose Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Initial Stock</label>
          <input type="number" value={pForm.stock_quantity} onChange={(e) => setPForm({...pForm, stock_quantity: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8860B]" />
        </div>
        <div className="flex gap-8 items-center pt-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={pForm.is_coming_soon} onChange={(e) => setPForm({...pForm, is_coming_soon: e.target.checked})} className="accent-[#B8860B]" />
            Mark as Coming Soon Drop
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={pForm.is_featured} onChange={(e) => setPForm({...pForm, is_featured: e.target.checked})} className="accent-[#B8860B]" />
            Feature on Home Hero
          </label>
        </div>
        <div className="md:col-span-2 text-right">
          <button type="submit" className="bg-gray-900 text-white px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] transition-all shadow-md">Publish Perfume Product</button>
        </div>
      </form>

      {/* Perfumes Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Perfume</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {perfumes.map((perfume) => (
              <tr key={perfume.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{perfume.name}</td>
                <td className="px-6 py-4">Rs. {perfume.price}</td>
                <td className="px-6 py-4">
                  {perfume.is_coming_soon ? <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Coming Soon</span> : <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeletePerfume(perfume.id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* 3. LIVE ORDERS MANAGEMENT TAB (Jo aapne poocha!) */}
  {activeTab === 'orders' && (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Order Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Total Amount</th>
              <th className="px-6 py-3">Current Status</th>
              <th className="px-6 py-3 text-right">Update Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">{order.customer_email}</p>
                </td>
                <td className="px-6 py-4 font-sans font-bold">Rs. {order.total_price}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    order.status === 'delivered' ? 'bg-green-50 text-green-600' : 
                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>{order.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border border-gray-200 text-xs rounded-lg px-2 py-1 bg-white focus:outline-none">
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</main>
    </div>
  );
}