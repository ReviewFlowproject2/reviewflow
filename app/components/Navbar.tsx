"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // 更新 URL hash
      window.history.pushState(null, "", `#${id}`);
    }
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Features", href: "features" },
    { label: "How It Works", href: "how-it-works" },
    { label: "Pricing", href: "pricing" },
    { label: "FAQ", href: "faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E9F1FA]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-outfit font-bold text-xl text-brand-blue">
          ReviewFlow
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`#${link.href}`}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-sm font-medium text-brand-muted hover:text-brand-dark transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm font-medium text-brand-blue hover:text-brand-dark transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-brand-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E9F1FA] px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`#${link.href}`}
              onClick={(e) => scrollToSection(e, link.href)}
              className="block text-sm font-medium text-brand-muted hover:text-brand-dark transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="block text-sm font-medium text-brand-blue"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="block px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-xl text-center"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
