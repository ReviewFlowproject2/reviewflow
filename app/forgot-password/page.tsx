"use client";
import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, ArrowLeft, CheckCircle, Activity } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const { data: biz } = await supabase.from("businesses").select("id").eq("owner_email", email).single();
    if (!biz) { const { error: se } = await supabase.auth.signInWithPassword({ email, password: "dummy" }); if (!se?.message.includes("Invalid")) { setError("No account found."); setLoading(false); return; } }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dashboard?type=recovery` });
    if (error) { setError(error.message); } else { setSent(true); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><Link href="/" className="inline-flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white"><Activity size={18}/></span><span className="text-xl font-bold text-slate-900">ReviewFlow</span></Link></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {sent ? (<div className="text-center"><div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-teal-600"/></div><h1 className="font-bold text-xl text-slate-900 mb-2">Check Your Email</h1><p className="text-slate-500 text-sm mb-6">We sent a reset link to <span className="font-semibold text-slate-900">{email}</span>.</p><Link href="/login" className="inline-flex items-center gap-2 text-sm text-teal-600 font-semibold"><ArrowLeft size={16}/>Back to Log In</Link></div>) : (
            <><h1 className="font-bold text-xl text-slate-900 text-center mb-2">Reset Password</h1><p className="text-slate-500 text-sm text-center mb-6">Enter your email and we&apos;ll send you a secure link.</p>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label><div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input type="email" required placeholder="you@clinic.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 pl-10 pr-3 h-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"/></div></div>
                <button type="submit" disabled={loading} className="w-full h-12 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">{loading?"Sending...":"Send Reset Link"}</button></form>
              <div className="mt-6 text-center text-sm text-slate-500">Remember your password? <Link href="/login" className="text-teal-600 font-semibold">Log In</Link></div></>)}</div></div></div>);}
