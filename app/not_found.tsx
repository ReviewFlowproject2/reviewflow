"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="font-outfit font-bold text-8xl text-brand-blue/20 mb-4">404</div>
        <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">Page Not Found</h1>
        <p className="text-brand-muted text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home size={16} />Go to Homepage
          </Link>

          <Link
            href="/dashboard"
            className="w-full py-3 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors inline-flex items-center justify-center gap-2"
          >
            <Search size={16} />Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full py-3 text-brand-muted font-semibold rounded-xl text-sm hover:text-brand-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
