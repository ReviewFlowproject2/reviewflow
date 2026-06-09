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

    // 先检查用户是否存在且已验证
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: "dummy-check-password-12345",
    });

    // 如果返回 "Invalid login credentials"，可能是用户不存在或密码错
    // 我们无法区分，但如果是 "Email not confirmed"，说明用户存在但未验证
    if (signInError?.message.includes("Email not confirmed")) {
      setError("This email is registered but not verified. Please check your inbox for the verification email.");
      setLoading(false);
      return;
    }

    // 使用 Magic Link 代替重置密码
    // 用户点击邮件后直接登录，然后可以修改密码
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard?action=reset-password`,
      },
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
                We sent a secure login link to{" "}
                <span className="font-semibold text-brand-dark">{email}</span>.<br />
                Click the link to log in and reset your password from your account settings.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-blue-700 font-medium mb-1">What&apos;s next?</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>1. Open your email inbox</li>
                  <li>2. Click the secure login link</li>
                  <li>3. You&apos;ll be logged in automatically</li>
                  <li>4. Go to Settings to change your password</li>
                </ul>
              </div>
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
                Enter your email and we&apos;ll send you a secure login link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                  {error.includes("not verified") && (
                    <div className="mt-2">
                      <Link href="/login" className="text-brand-blue font-semibold hover:underline text-sm">
                        Log in here &rarr;
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
                  {loading ? "Sending..." : "Send Login Link"}
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
