"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, CheckCircle, ArrowRight, RefreshCw, Activity } from "lucide-react";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => { (async()=>{const{data:{user}}=await supabase.auth.getUser();if(user?.email)setEmail(user.email);})(); },[]);

  const handleResend = async () => { if(!email)return;setResending(true);const{error}=await supabase.auth.resend({type:"signup",email,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});if(!error)setResent(true);setResending(false); };

  return (<div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center p-6"><div className="w-full max-w-md text-center">
    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-8"><span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white"><Activity size={18}/></span><span className="text-xl font-bold text-slate-900">ReviewFlow</span></Link>
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-teal-600"/></div>
      <h1 className="font-bold text-xl text-slate-900 mb-2">Verify Your Email</h1>
      <p className="text-slate-500 text-sm mb-6">We sent a verification link to <span className="font-semibold text-slate-900">{email||"your email"}</span>.</p>
      {resent && <div className="mb-4 p-3 bg-teal-50 text-teal-600 text-sm rounded-lg flex items-center justify-center gap-2"><CheckCircle size={16}/>Verification email resent!</div>}
      <div className="space-y-3"><button onClick={handleResend} disabled={resending} className="w-full h-12 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg text-sm hover:bg-teal-600 hover:text-white disabled:opacity-50 flex items-center justify-center gap-2"><RefreshCw size={16} className={resending?"animate-spin":""}/>{resending?"Resending...":"Resend Email"}</button>
        <Link href="/login" className="w-full h-12 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 flex items-center justify-center gap-2">I&apos;ve Verified <ArrowRight size={16}/></Link></div>
      <p className="text-xs text-slate-400 mt-4">Check spam folder if you don&apos;t see it.</p></div></div></div>);}
