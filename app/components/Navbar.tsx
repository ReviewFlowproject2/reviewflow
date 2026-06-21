"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Star } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); window.history.pushState(null, "", `#${id}`); }
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Features", href: "features" },
    { label: "Pricing", href: "pricing" },
    { label: "FAQ", href: "faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <Star size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">ReviewFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={`#${l.href}`} onClick={(e) => scrollToSection(e, l.href)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l.label}</a>
          ))}
          <Link href="/free-audit" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">Free Audit</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log In</Link>
          <Link href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 transition">
            Get Started
          </Link>
        </div>

        <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.href} href={`#${l.href}`} onClick={(e) => scrollToSection(e, l.href)}
              className="block text-sm font-medium text-gray-500 hover:text-gray-900">{l.label}</a>
          ))}
          <Link href="/free-audit" className="block text-sm font-medium text-teal-600" onClick={()=>setMobileOpen(false)}>Free Audit</Link>
          <Link href="/login" className="block text-sm font-medium text-gray-600" onClick={()=>setMobileOpen(false)}>Log In</Link>
          <Link href="/register" className="block px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg text-center" onClick={()=>setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
