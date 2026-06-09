"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 先检查邮箱是否已注册
    const { data: existingUser, error: checkError } = await supabase
      .from("businesses")
      .select("id, owner_email")
      .eq("owner_email", email)
      .single();

    if (!existingUser) {
      // 再检查 auth.users
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy-check-password-12345",
      });

      const userExists = signInError && signInError.message.includes("Invalid login credentials");

      if (!userExists) {
        setError("No account found with this email. Please check your email or sign up.");
        setLoading(false);
        return;
      }
    }

    // 关键修改：redirectTo 指向 /auth/callback，由 callback 处理后再跳转到 reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-outfit font-bold text-2xl text-brand-blue">
            ReviewFlow
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E7F1] p-8 shadow-card">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="font-outfit font-bold text-xl text-brand-dark mb-2">
                Check Your Email
              </h1>
              <p className="text-brand-muted text-sm mb-6">
                We sent a password reset link to{" "}
                <span className="font-semibold text-brand-dark">{email}</span>.<br />
                Click the link in the email to set a new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-brand-blue font-semibold hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Log In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-outfit font-bold text-xl text-brand-dark text-center mb-2">
                Reset Password
              </h1>
              <p className="text-brand-muted text-sm text-center mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                  {error.includes("No account found") && (
                    <div className="mt-2">
                      <Link href="/register" className="text-brand-blue font-semibold hover:underline text-sm">
                        Sign up here &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="email"
                      required
                      placeholder="you@clinic.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-brand-soft pl-10 pr-3 py-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-brand-muted">
                Remember your password?{" "}
                <Link href="/login" className="text-brand-blue font-semibold hover:underline">
                  Log In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
