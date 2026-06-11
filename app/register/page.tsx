"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, CheckCircle, Star, Users, Shield, Building2, Phone, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clinicName: "",
    doctorName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 验证
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // 通过服务端 API 注册（跳过邮件验证，直接创建用户+Business）
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          clinic: formData.clinicName,
          name: formData.doctorName,
          phone: formData.phone,
        }),
      });
      const result = await res.json();

      if (!res.ok || result.error) {
        if (result.error?.includes("already") || result.error?.includes("exists")) {
          setError("This email is already registered. Please log in instead.");
        } else {
          setError(result.error || "Registration failed");
        }
        setLoading(false);
        return;
      }

      // 注册成功 → 自动登录
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        // 登录失败但注册成功 → 提示用户手动登录
        setSuccess(true);
        setLoading(false);
        return;
      }

      // 成功 → 直接进 Dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error, please try again");
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="font-outfit font-bold text-2xl text-brand-blue">
              ReviewFlow
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0E7F1] p-8 shadow-card text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-outfit font-bold text-xl text-brand-dark mb-2">
              Registration Successful
            </h1>
            <p className="text-brand-muted text-sm mb-4">
              Your account <span className="font-semibold text-brand-dark">{formData.email}</span> has been created.<br />
              Log in to start your 15-day free trial.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors"
            >
              Go to Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
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

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
              <CheckCircle size={12} />No credit card required
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4 text-xs text-brand-muted">
            <span className="flex items-center gap-1"><Users size={12} />500+ clinics</span>
            <span className="flex items-center gap-1"><Star size={12} className="fill-brand-yellow text-brand-yellow" />4.9/5 rating</span>
            <span className="flex items-center gap-1"><Shield size={12} />HIPAA compliant</span>
          </div>

          {/* Google Register */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full py-3 border-2 border-[#E0E7F1] text-brand-dark font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E0E7F1]" />
            <span className="text-xs text-brand-muted">or</span>
            <div className="flex-1 h-px bg-[#E0E7F1]" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
              {error.includes("already registered") && (
                <div className="mt-2">
                  <Link href="/login" className="text-brand-blue font-semibold hover:underline text-sm">
                    Log in here &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                <Building2 size={14} className="inline mr-1" />Clinic Name
              </label>
              <input
                type="text"
                name="clinicName"
                required
                placeholder="e.g., Smile Dental Care"
                value={formData.clinicName}
                onChange={handleChange}
                className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                <User size={14} className="inline mr-1" />Doctor / Owner Name
              </label>
              <input
                type="text"
                name="doctorName"
                required
                placeholder="Dr. John Smith"
                value={formData.doctorName}
                onChange={handleChange}
                className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                <Phone size={14} className="inline mr-1" />Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@clinic.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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
