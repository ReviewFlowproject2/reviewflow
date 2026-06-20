"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, ArrowLeft, CheckCircle, Star } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data: existingUser } = await supabase.from("businesses").select("id, owner_email").eq("owner_email", email).single();
    if (!existingUser) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: "dummy-check-password-12345" });
      const userExists = signInError && signInError.message.includes("Invalid login credentials");
      if (!userExists) { setError("No account found with this email. Please check your email or sign up."); setLoading(false); return; }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dashboard?type=recovery` });
    if (error) { setError(error.message); } else { setSent(true); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Star size={14} className="text-white" fill="white" /></div>
            <span className="font-bold text-2xl text-white tracking-tight">ReviewFlow</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="font-bold text-xl text-slate-900 mb-2">Check Your Email</h1>
              <p className="text-slate-500 text-sm mb-6">
                We sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>.<br />Click the link to log in and reset your password.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-blue-700 font-medium mb-1">What&apos;s next?</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>1. Open your email inbox</li><li>2. Click the secure login link</li><li>3. You&apos;ll be logged in automatically</li><li>4. A password reset dialog will appear</li>
                </ul>
              </div>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:text-emerald-700"><ArrowLeft size={16} />Back to Log In</Link>
            </div>
          ) : (
            <>
              <h1 className="font-bold text-xl text-slate-900 text-center mb-2">Reset Password</h1>
              <p className="text-slate-500 text-sm text-center mb-6">Enter your email and we&apos;ll send you a secure login link to reset your password.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                  {error.includes("No account found") && <div className="mt-2"><Link href="/register" className="text-emerald-600 font-semibold hover:underline text-sm">Sign up here &rarr;</Link></div>}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required placeholder="you@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-500">
                Remember your password? <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Log In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
