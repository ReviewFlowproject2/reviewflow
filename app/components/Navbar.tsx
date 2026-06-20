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
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Star size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">ReviewFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={`#${l.href}`} onClick={(e) => scrollToSection(e, l.href)}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{l.label}</a>
          ))}
          <Link href="/free-audit" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Free Audit</Link>
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</Link>
          <Link href="/register"
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400">
            Get Started
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.href} href={`#${l.href}`} onClick={(e) => scrollToSection(e, l.href)}
              className="block text-sm font-medium text-slate-400 hover:text-white">{l.label}</a>
          ))}
          <Link href="/free-audit" className="block text-sm font-medium text-emerald-400" onClick={()=>setMobileOpen(false)}>Free Audit</Link>
          <Link href="/login" className="block text-sm font-medium text-slate-300" onClick={()=>setMobileOpen(false)}>Log In</Link>
          <Link href="/register" className="block px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-full text-center" onClick={()=>setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
