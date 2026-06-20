"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Zap, Users, Bell, Headphones, Home, Star } from "lucide-react";
import Script from "next/script";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const PADDLE_CLIENT_TOKEN = "live_70c09ad4de252bfa5440b90a9ca";

const PRICING = {
  monthly: {
    pro: { priceId: "pri_01ktvfjxsdgfrc1407ha23vd91", price: 39, period: "/mo", save: "" },
    agency: { priceId: "pri_01kt1a0wwqa4nbny8d3ae0tben", price: 69, period: "/mo", save: "" },
  },
  quarterly: {
    pro: { priceId: "pri_01ktvfpw9etktny986dgcy14rg", price: 105, period: "/3mo", save: "Save 10%" },
    agency: { priceId: "pri_01kt4s86yv5g5ty0epzr96g0cp", price: 189, period: "/3mo", save: "Save 9%" },
  },
  yearly: {
    pro: { priceId: "pri_01ktvfmezegrnq32wn5ynk3spm", price: 390, period: "/yr", save: "Save 17%" },
    agency: { priceId: "pri_01kt4s5kh3e7ft82grc8w5qzfc", price: 690, period: "/yr", save: "Save 17%" },
  },
};

type BillingCycle = "monthly" | "quarterly" | "yearly";

const AgencyBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">{children}</span>
);

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const checkPaddle = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).Paddle) { setPaddleLoaded(true); clearInterval(checkPaddle); }
    }, 100);
    return () => clearInterval(checkPaddle);
  }, []);

  useEffect(() => {
    const checkUser = async () => { const { data: { user } } = await supabase.auth.getUser(); setUser(user); };
    checkUser();
  }, []);

  const openCheckout = (priceId: string) => {
    if (!(window as any).Paddle) { alert("Payment system loading, please try again in a moment."); return; }
    (window as any).Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
    (window as any).Paddle.Checkout.open({ items: [{ priceId, quantity: 1 }], settings: { theme: "light", displayMode: "overlay", locale: "en" } });
  };

  const cycles: { key: BillingCycle; label: string }[] = [
    { key: "monthly", label: "Monthly" }, { key: "quarterly", label: "Quarterly" }, { key: "yearly", label: "Yearly" },
  ];

  const getSaveLabel = (plan: "pro" | "agency") => { const save = PRICING[cycle][plan].save; return save || null; };

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />
      <div className="min-h-screen bg-slate-50">
        {/* Nav */}
        <nav className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center"><Star size={14} className="text-white" fill="white" /></div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">ReviewFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"><Home size={16} /> Home</Link>
              {user ? (
                <Link href="/dashboard" className="text-sm px-5 py-2 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-colors">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">Log In</Link>
                  <button onClick={() => router.push("/register")} className="text-sm px-5 py-2 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-colors">Start Free</button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="font-extrabold text-4xl text-slate-900 text-center tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-center mb-8">Start free. Upgrade when you&apos;re ready to automate.</p>

          {/* Billing cycle toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 border border-slate-200 shadow-sm inline-flex">
              {cycles.map((c) => (
                <button key={c.key} onClick={() => setCycle(c.key)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    cycle === c.key ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-xl text-slate-900 mb-1">Free</h3>
              <p className="text-slate-500 text-sm mb-4">Get started with QR codes</p>
              <div className="font-bold text-3xl text-slate-900 mb-1">$0</div>
              <p className="text-xs text-slate-400 mb-6">15-day free trial, no credit card</p>
              <Link href="/register" className="block w-full text-center py-2.5 border-2 border-slate-900 text-slate-900 font-semibold rounded-xl text-sm hover:bg-slate-900 hover:text-white transition-colors">Start Free Trial</Link>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {["QR code generation","Google Review link","Basic dashboard","Up to 50 patients","Email support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0"/>{item}</li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-8 border-2 border-emerald-500 scale-105 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
              {getSaveLabel("pro") && <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{getSaveLabel("pro")}</div>}
              <h3 className="font-bold text-xl text-slate-900 mb-1">Pro</h3>
              <p className="text-slate-500 text-sm mb-4">Automate your reputation growth</p>
              <div className="font-bold text-3xl text-slate-900 mb-1">${PRICING[cycle].pro.price}<span className="text-lg text-slate-400">{PRICING[cycle].pro.period}</span></div>
              <p className="text-xs text-slate-400 mb-6">1st month free, cancel anytime</p>
              <button onClick={() => openCheckout(PRICING[cycle].pro.priceId)} disabled={!paddleLoaded}
                className="block w-full text-center py-2.5 bg-emerald-500 text-white font-semibold rounded-xl text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                {paddleLoaded ? "Get 1st Month Free" : "Loading..."}
              </button>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {["Everything in Free","Automated email follow-ups","Real-time negative review alerts","1,000 patients / month","3 competitor tracking","30-day historical data","1 team member","Priority email support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0"/>{item}</li>
                ))}
              </ul>
            </div>

            {/* Agency */}
            <div className="bg-white rounded-2xl p-8 border-2 border-amber-400 shadow-sm relative">
              {getSaveLabel("agency") && <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{getSaveLabel("agency")}</div>}
              <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={12} /> Agency Only</div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">Agency</h3>
              <p className="text-slate-500 text-sm mb-4">Manage multiple clinics</p>
              <div className="font-bold text-3xl text-slate-900 mb-1">${PRICING[cycle].agency.price}<span className="text-lg text-slate-400">{PRICING[cycle].agency.period}</span></div>
              <p className="text-xs text-slate-400 mb-6">1st month free, cancel anytime</p>
              <button onClick={() => openCheckout(PRICING[cycle].agency.priceId)} disabled={!paddleLoaded}
                className="block w-full text-center py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors disabled:opacity-50">
                {paddleLoaded ? "Get 1st Month Free" : "Loading..."}
              </button>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {["Everything in Pro","Multi-clinic dashboard","White-label branding","API access","Custom integrations","10,000 patients / month","20 competitor tracking","Unlimited historical data","5 team members","Export monthly reports"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0"/>{item}</li>
                ))}
                <li className="flex items-start gap-2"><Zap size={14} className="text-amber-500 shrink-0 mt-0.5"/><span><span className="font-semibold">Daily Reputation Digest</span><AgencyBadge>Agency Only</AgencyBadge></span></li>
                <li className="flex items-start gap-2"><Users size={14} className="text-amber-500 shrink-0 mt-0.5"/><span><span className="font-semibold">Multi-Recipient Alerts</span><AgencyBadge>Agency Only</AgencyBadge></span></li>
                <li className="flex items-start gap-2"><Headphones size={14} className="text-amber-500 shrink-0 mt-0.5"/><span><span className="font-semibold">1-on-1 Dedicated Support</span><AgencyBadge>Agency Only</AgencyBadge></span></li>
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="font-extrabold text-2xl text-slate-900 text-center tracking-tight mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Do I need a credit card to start?", a: "No credit card required for the Free plan. Pro and Agency plans include a 15-day free trial." },
                { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your account settings." },
                { q: "Is my patient data secure?", a: "Absolutely. Bank-level encryption (AES-256). HIPAA-compliant and GDPR-ready." },
                { q: "Do you offer refunds?", a: "If you are not satisfied within the first 14 days, contact us for a full refund — no questions asked." },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-slate-500 text-sm mb-4">Still have questions? <Link href="/dashboard/support" className="text-emerald-600 hover:underline font-medium">Contact Support</Link></p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
