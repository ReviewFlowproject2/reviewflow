"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, Mail, Lock, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard"); router.refresh();
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setError(error.message); setLoading(false); }
  };

  const ic = "w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 h-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white"><Activity size={18} /></span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ReviewFlow</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="font-bold text-xl text-slate-900 text-center mb-6">Log In to Your Account</h1>
          <button onClick={handleGoogle} disabled={loading}
            className="w-full h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-3 mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-slate-200"/><span className="text-xs text-slate-400">or</span><div className="flex-1 h-px bg-slate-200"/></div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="email" required placeholder="you@clinic.com" value={email} onChange={e=>setEmail(e.target.value)} className={ic}/></div></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type={show?"text":"password"} required placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} className={ic+" pr-10"}/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" className="rounded"/>Remember me</label>
              <Link href="/forgot-password" className="text-sm text-teal-600 font-semibold hover:text-teal-700">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors">{loading?"Logging in...":"Log In"}</button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href="/register" className="text-teal-600 font-semibold hover:text-teal-700">Start Free Trial</Link></div>
        </div>
      </div>
    </div>
  );
}
