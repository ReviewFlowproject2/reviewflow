"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, CheckCircle, Star, Users, Shield, Building2, Phone, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ clinicName: "", doctorName: "", phone: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: formData.doctorName, clinic_name: formData.clinicName, phone: formData.phone },
      },
    });
    if (error) {
      setError(error.message.includes("already") || error.message.includes("exists")
        ? "This email is already registered. Please log in instead." : error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Star size={14} className="text-white" fill="white" /></div>
              <span className="font-bold text-2xl text-white tracking-tight">ReviewFlow</span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="font-bold text-xl text-slate-900 mb-2">Check Your Email</h1>
            <p className="text-slate-500 text-sm mb-4">
              We sent a verification link to <span className="font-semibold text-slate-900">{formData.email}</span>.<br />
              Click the link to activate your account and start your 15-day free trial.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-blue-700 font-medium mb-1">Didn&apos;t get the email?</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Check your spam / junk folder</li>
                <li>• Wait 1-2 minutes and refresh</li>
                <li>• Still nothing? <Link href="/login" className="underline font-medium">Try logging in</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Star size={14} className="text-white" fill="white" /></div>
            <span className="font-bold text-2xl text-white tracking-tight">ReviewFlow</span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Google Review Automation for Dental Offices</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
          <h1 className="font-bold text-xl text-slate-900 text-center mb-2">Create Your Account</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
              <CheckCircle size={12} />No credit card required
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Users size={12} />500+ clinics</span>
            <span className="flex items-center gap-1"><Star size={12} className="fill-emerald-400 text-emerald-400" />4.9/5 rating</span>
            <span className="flex items-center gap-1"><Shield size={12} />HIPAA compliant</span>
          </div>

          <button onClick={handleGoogleRegister} disabled={loading}
            className="w-full py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3 mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">or</span><div className="flex-1 h-px bg-slate-200" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
              {error.includes("already registered") && (
                <div className="mt-2"><Link href="/login" className="text-emerald-600 font-semibold hover:underline text-sm">Log in here &rarr;</Link></div>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            {[
              { name: "clinicName", label: "Clinic Name", icon: Building2, placeholder: "e.g., Smile Dental Care", required: true },
              { name: "doctorName", label: "Doctor / Owner Name", icon: User, placeholder: "Dr. John Smith", required: true },
              { name: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 123-4567", required: true },
              { name: "email", label: "Email", icon: null, placeholder: "you@clinic.com", required: true, type: "email" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {f.icon && <f.icon size={14} className="inline mr-1" />}{f.label}
                </label>
                <input type={f.type || "text"} name={f.name} required={f.required} placeholder={f.placeholder}
                  value={(formData as any)[f.name]} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required minLength={6} placeholder="Create a password"
                  value={formData.password} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Must be at least 6 characters</p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20">
              {loading ? "Creating account..." : "Start Free Trial"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Log In</Link>
          </div>
          <div className="mt-4 text-center text-xs text-slate-400">
            By signing up, you agree to our <Link href="/terms" className="text-emerald-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
