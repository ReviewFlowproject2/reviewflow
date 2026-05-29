"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex flex-col">
      {/* Top Nav */}
      <div className="h-16 flex items-center px-6 lg:px-8">
        <Link href="/" className="font-outfit font-bold text-xl text-brand-blue">
          ReviewFlow
        </Link>
        <div className="ml-auto text-sm text-brand-muted">
          No account yet?{" "}
          <Link href="/register" className="text-brand-blue font-semibold hover:underline">
            Sign up free
          </Link>
        </div>
      </div>

      {/* Form — 更大的卡片 */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: "440px" }}>
          <div className="bg-white rounded-[20px] p-10 shadow-card">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-outfit font-bold text-[28px] text-brand-dark mb-2">
                Log In to Dashboard
              </h1>
              <p className="text-[15px] text-brand-muted">
                Manage your clinic reputation
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-[10px] bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[15px] text-brand-dark font-medium block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@clinic.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[15px] text-brand-dark font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[14px] text-brand-blue hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 pr-12 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CTA Button — 更大 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-brand-blue hover:bg-brand-dark text-white font-semibold rounded-[10px] transition-all hover:scale-[1.01] text-[15px] disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="mt-6 text-center text-[13px] text-brand-muted">
              By logging in, you agree to our{" "}
              <span className="text-brand-blue hover:underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-brand-blue hover:underline cursor-pointer">Privacy Policy</span>
            </div>
          </div>

          {/* Bottom link */}
          <p className="text-center mt-5 text-[15px] text-brand-muted">
            No account yet?{" "}
            <Link href="/register" className="text-brand-blue font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
