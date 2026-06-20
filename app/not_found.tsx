"use client";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (<div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center p-6"><div className="text-center max-w-md">
    <div className="font-extrabold text-8xl text-slate-200 mb-4">404</div>
    <h1 className="font-bold text-2xl text-slate-900 mb-2">Page Not Found</h1>
    <p className="text-slate-500 text-sm mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
    <div className="space-y-3">
      <Link href="/" className="w-full h-12 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 flex items-center justify-center gap-2"><Home size={16}/>Go Home</Link>
      <button onClick={()=>window.history.back()} className="w-full h-12 border-2 border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-2"><ArrowLeft size={16}/>Go Back</button>
    </div>
  </div></div>);}
