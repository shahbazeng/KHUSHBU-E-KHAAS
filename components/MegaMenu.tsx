"use client";

import React from 'react';
import Link from 'next/link';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isScrolled: boolean;
}

export default function MegaMenu({ isOpen, onClose, isScrolled }: MegaMenuProps) {
  if (!isOpen) return null;

  // 2026 E-Commerce Standards Framework Categories Tree Array
  const menuData = [
    {
      title: "French Fine Perfumes",
      slug: "perfumes",
      items: ["Mastan Intense Gold", "Blue Ocean Imperial", "Oud Wood Designer", "Vanilla Velvet Drop"]
    },
    {
      title: "Pure Royal Attars",
      slug: "attar",
      items: ["White Musk Dehn-al-Oud", "Kasturi Kashmiri Oud", "Mukhallat Imperial Rose", "Sandalwood Silk Splendid"]
    },
    {
      title: "Exclusive Offers & Gift Boxes",
      slug: "specials",
      items: ["Eid Festive Gift Box Set", "His & Her Travel Vault Pack", "Discovery Tester Scent Row", "Bespoke Corporate Bundle"]
    }
  ];

  return (
    <div 
      className="absolute left-0 w-full bg-white text-gray-900 border-b border-gray-100 shadow-2xl animate-fade-in-up z-[90] transition-all"
      style={{ top: '100%' }}
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-16 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {menuData.map((section, idx) => (
          <div key={idx} className="space-y-4 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#B8860B] border-b border-gray-50 pb-2 font-sans">
              {section.title}
            </h4>
            <ul className="space-y-2.5">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <Link 
                    href={`/shop?search=${encodeURIComponent(item)}`}
                    onClick={onClose}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 group font-sans"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}