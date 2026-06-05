"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, CheckCircle, Star, Users, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 自动创建 business 记录
    if (data.user) {
      await supabase.from("businesses").insert({
        user_id: data.user.id,
        name: "My Clinic",
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        google_review_link: "",
        plan: "free",
      });
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-outfit font-bold text-2xl text-brand-blue">
            ReviewFlow
          </Link>
          <p className="text-brand-muted text-sm mt-2">Google Review Automation for Dental Offices</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E7F1] p-8 shadow-card">
          <h1 className="font-outfit font-bold text-xl text-brand-dark text-center mb-2">
            Create Your Account
          </h1>

          {/* No credit card badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
              <CheckCircle size={12} />
              No credit card required
            </span>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-brand-muted">
            <span className="flex items-center gap-1">
              <Users size={12} />
              500+ clinics
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-brand-yellow text-brand-yellow" />
              4.9/5 rating
            </span>
            <span className="flex items-center gap-1">
              <Shield size={12} />
              HIPAA compliant
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-brand-soft p-3 pr-10 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-brand-muted mt-1.5">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Start Free Trial"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-brand-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-blue font-semibold hover:underline">
              Log In
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-brand-muted/60">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-brand-blue hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-blue hover:underline">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
