"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clinic: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 走API路由注册
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          clinic: form.clinic,
          name: form.name,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // 注册成功，自动登录
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
          Already have an account?{" "}
          <Link href="/login" className="text-brand-blue font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: "480px" }}>
          <div className="bg-white rounded-[20px] p-10 shadow-card">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-outfit font-bold text-[28px] text-brand-dark mb-2">
                Create Your Account
              </h1>
              <p className="text-[15px] text-brand-muted">
                30 days free. No credit card required.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-[10px] bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Clinic Name */}
              <div className="space-y-2">
                <label className="text-[15px] text-brand-dark font-medium block">
                  Dental Office Name
                </label>
                <input
                  placeholder="e.g. Sunshine Dental"
                  value={form.clinic}
                  onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                  className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[15px] text-brand-dark font-medium block">
                  Your Name
                </label>
                <input
                  placeholder="Dr. Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>

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

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[15px] text-brand-dark font-medium block">
                  Office Phone
                </label>
                <input
                  type="tel"
                  placeholder="(713) 555-0123"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[15px] text-brand-dark font-medium block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 pr-12 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    required
                    minLength={8}
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

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-brand-blue hover:bg-brand-dark text-white font-semibold rounded-[10px] transition-all hover:scale-[1.01] text-[15px] disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Start Free Trial"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/forgot-password"
                className="text-[14px] text-brand-blue hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-6 text-center text-[13px] text-brand-muted">
              By signing up, you agree to our{" "}
              <span className="text-brand-blue hover:underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-brand-blue hover:underline cursor-pointer">Privacy Policy</span>
            </div>
          </div>

          <p className="text-center mt-5 text-[15px] text-brand-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-blue font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
