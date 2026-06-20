"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="font-extrabold text-8xl text-slate-700 mb-4">404</div>
        <h1 className="font-bold text-2xl text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="space-y-3">
          <Link href="/" className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
            <Home size={16} />Go to Homepage
          </Link>
          <Link href="/dashboard" className="w-full py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-full text-sm hover:border-slate-400 hover:text-white transition-colors inline-flex items-center justify-center gap-2">
            <Search size={16} />Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="w-full py-3 text-slate-400 font-semibold rounded-full text-sm hover:text-white transition-colors inline-flex items-center justify-center gap-2">
            <ArrowLeft size={16} />Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
