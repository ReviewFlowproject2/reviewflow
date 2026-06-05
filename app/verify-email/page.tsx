"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (!error) setResent(true);
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-outfit font-bold text-2xl text-brand-blue block mb-8">
          ReviewFlow
        </Link>

        <div className="bg-white rounded-2xl border border-[#E0E7F1] p-8 shadow-card">
          <div className="w-16 h-16 rounded-full bg-brand-soft flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-blue" />
          </div>

          <h1 className="font-outfit font-bold text-xl text-brand-dark mb-2">
            Verify Your Email
          </h1>
          <p className="text-brand-muted text-sm mb-6">
            We sent a verification link to{" "}
            <span className="font-semibold text-brand-dark">{email || "your email"}</span>.<br />
            Click the link to activate your account.
          </p>

          {resent && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={16} />Verification email resent!
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
              {resending ? "Resending..." : "Resend Email"}
            </button>

            <Link
              href="/login"
              className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2"
            >
              I&apos;ve Verified My Email <ArrowRight size={16} />
            </Link>
          </div>

          <p className="text-xs text-brand-muted/60 mt-4">
            Didn&apos;t receive it? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
}
