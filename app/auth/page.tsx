"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName } }
      });
      if (error) alert(error.message);
      else alert("Check your email for confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
        <h2 className="tracking-[0.4em] text-lg font-light text-[#B8860B] uppercase mb-2">Khushbu-e-Khaas</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">{isSignUp ? 'Create Luxury Account' : 'Sign In To Your Essence'}</p>
        
        <form onSubmit={handleAuth} className="space-y-5 text-left">
          {isSignUp && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]" />
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#B8860B]" />
          </div>
          <button type="submit" className="w-full py-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#B8860B] transition-all shadow-md pt-4">
            {isSignUp ? 'Register Now' : 'Sign In'}
          </button>
        </form>
        
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-[11px] text-gray-400 hover:text-[#B8860B] transition-all tracking-wider">
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}