"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

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

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "发送失败，请重试");
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
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: "400px" }}>
          <div className="bg-white rounded-[16px] p-8 shadow-card">
            {/* Back link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-blue mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              返回登录
            </Link>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-outfit font-bold text-[24px] text-brand-dark mb-2">
                重置密码
              </h1>
              <p className="text-[14px] text-brand-muted">
                输入您的邮箱，我们将发送重置链接
              </p>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-brand-dark font-medium mb-2">重置邮件已发送</p>
                <p className="text-sm text-brand-muted mb-6">
                  请检查您的邮箱（包括垃圾邮件文件夹），点击邮件中的链接重置密码。
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-[8px] hover:bg-brand-dark transition-colors text-sm"
                >
                  返回登录
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-[8px] bg-red-50 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[14px] text-brand-dark font-medium block">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="email"
                      placeholder="name@clinic.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 rounded-[8px] border border-[#E0E7F1] pl-10 pr-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-brand-blue hover:bg-brand-dark text-white font-semibold rounded-[6px] transition-all hover:scale-[1.01] text-[14px] disabled:opacity-50"
                >
                  {loading ? "发送中..." : "发送重置链接"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
