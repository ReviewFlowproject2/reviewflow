"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, CheckCircle, Lock, Activity } from "lucide-react";

export default function ResetPasswordPage() {
  const [p, setP] = useState(""); const [cp, setCp] = useState(""); const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => { (async()=>{const{data:{session}}=await supabase.auth.getSession();if(session)setHasSession(true);else{const u=new URL(window.location.href);if(u.searchParams.get("error"))setError("Invalid or expired link.");}setChecking(false);})(); },[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if(!hasSession){setError("Invalid or expired link.");return;}
    if(p.length<6){setError("Password must be at least 6 characters");return;}
    if(p!==cp){setError("Passwords do not match");return;}
    setLoading(true); const {error:ue}=await supabase.auth.updateUser({password:p});
    if(ue){setError(ue.message);setLoading(false);return;}
    setSuccess(true);setLoading(false);
  };

  if(checking) return (<div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"/></div>);

  const ic = "w-full rounded-lg border border-slate-200 pl-10 pr-3 h-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";

  return (<div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center p-6"><div className="w-full max-w-md">
    <div className="text-center mb-8"><Link href="/" className="inline-flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white"><Activity size={18}/></span><span className="text-xl font-bold text-slate-900">ReviewFlow</span></Link></div>
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      {success ? (<div className="text-center"><div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-teal-600"/></div><h1 className="font-bold text-xl text-slate-900 mb-2">Password Updated</h1><Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700">Go to Log In</Link></div>) : (
        <><h1 className="font-bold text-xl text-slate-900 text-center mb-2">Set New Password</h1><p className="text-slate-500 text-sm text-center mb-6">Enter your new password below.</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}{error.includes("expired")&&<div className="mt-2"><Link href="/forgot-password" className="text-teal-600 font-semibold">Request new link &rarr;</Link></div>}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label><div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input type={show?"text":"password"} required minLength={6} placeholder="Enter new password" value={p} onChange={e=>setP(e.target.value)} className={ic+" pr-10"}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label><div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input type={show?"text":"password"} required placeholder="Confirm new password" value={cp} onChange={e=>setCp(e.target.value)} className={ic}/></div></div>
            <button type="submit" disabled={loading||!hasSession} className="w-full h-12 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">{loading?"Updating...":"Reset Password"}</button></form>
          <div className="mt-6 text-center text-sm text-slate-500"><Link href="/forgot-password" className="text-teal-600 font-semibold">Request new link</Link></div></>)}</div></div></div>);}
