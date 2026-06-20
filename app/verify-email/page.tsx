"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, CheckCircle, ArrowRight, RefreshCw, Star } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    };
    getEmail();
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup", email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (!error) setResent(true);
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Star size={14} className="text-white" fill="white" /></div>
          <span className="font-bold text-2xl text-white tracking-tight">ReviewFlow</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="font-bold text-xl text-slate-900 mb-2">Verify Your Email</h1>
          <p className="text-slate-500 text-sm mb-6">
            We sent a verification link to <span className="font-semibold text-slate-900">{email || "your email"}</span>.<br />Click the link to activate your account.
          </p>

          {resent && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={16} />Verification email resent!
            </div>
          )}

          <div className="space-y-3">
            <button onClick={handleResend} disabled={resending}
              className="w-full py-3 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-full text-sm hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2">
              <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
              {resending ? "Resending..." : "Resend Email"}
            </button>
            <Link href="/login"
              className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              I&apos;ve Verified My Email <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">Didn&apos;t receive it? Check your spam folder or try resending.</p>
        </div>
      </div>
    </div>
  );
}
