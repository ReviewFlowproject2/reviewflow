"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, CheckCircle, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    // 从 URL 获取 access_token
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get("access_token");

    if (!accessToken) {
      setError("Invalid or expired reset link. Please request a new one.");
      setLoading(false);
      return;
    }

    // 设置 session，然后更新密码
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "",
    });

    if (sessionError) {
      setError(sessionError.message);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 3000);
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
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="font-outfit font-bold text-xl text-brand-dark mb-2">
                Password Updated
              </h1>
              <p className="text-brand-muted text-sm mb-4">
                Your password has been successfully reset. Redirecting to login...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors"
              >
                Go to Log In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-outfit font-bold text-xl text-brand-dark text-center mb-2">
                Set New Password
              </h1>
              <p className="text-brand-muted text-sm text-center mb-6">
                Enter your new password below.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                  {error.includes("expired") && (
                    <div className="mt-2">
                      <Link href="/forgot-password" className="text-brand-blue font-semibold hover:underline text-sm">
                        Request new link &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-brand-soft pl-10 pr-10 py-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-brand-soft pl-10 pr-3 py-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-brand-muted">
                <Link href="/forgot-password" className="text-brand-blue font-semibold hover:underline">
                  Request new link
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
