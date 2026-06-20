"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Activity } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Features", href: "features" },
    { label: "Pricing", href: "pricing" },
    { label: "FAQ", href: "faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">ReviewFlow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`#${link.href}`}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link href="/free-audit" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            Free Audit
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Log In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-slate-500" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link.href} href={`#${link.href}`} onClick={(e) => scrollToSection(e, link.href)}
              className="block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              {link.label}
            </a>
          ))}
          <Link href="/free-audit" className="block text-sm font-medium text-teal-600" onClick={() => setMobileOpen(false)}>Free Audit</Link>
          <Link href="/login" className="block text-sm font-medium text-slate-500" onClick={() => setMobileOpen(false)}>Log In</Link>
          <Link href="/register" className="block px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg text-center"
            onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
