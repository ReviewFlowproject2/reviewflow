"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import Script from "next/script";
import { useState, useEffect } from "react";

const PADDLE_CLIENT_TOKEN = "live_70c09ad4de252bfa5440b90a9ca";

interface PricingPlan {
  priceId: string;
  price: number;
  period: string;
  save?: string;
}

interface PricingTier {
  pro: PricingPlan;
  agency: PricingPlan;
}

const PRICING: Record<string, PricingTier> = {
  monthly: {
    pro: { priceId: "pri_01kt19xahgfjcw0hcmc9gkws26", price: 39, period: "/mo" },
    agency: { priceId: "pri_01kt1a0wwqa4nbny8d3ae0tben", price: 69, period: "/mo" },
  },
  quarterly: {
    pro: { priceId: "pri_01kt4s6zamveeevqt9rv42e8z8", price: 105, period: "/3mo", save: "Save 10%" },
    agency: { priceId: "pri_01kt4s86yv5g5ty0epzr96g0cp", price: 189, period: "/3mo", save: "Save 9%" },
  },
  yearly: {
    pro: { priceId: "pri_01kt4rxwhrsn4fep3shk2gjsbg", price: 390, period: "/yr", save: "Save 17%" },
    agency: { priceId: "pri_01kt4s5kh3e7ft82grc8w5qzfc", price: 690, period: "/yr", save: "Save 17%" },
  },
};

type BillingCycle = "monthly" | "quarterly" | "yearly";

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    const checkPaddle = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).Paddle) {
        setPaddleLoaded(true);
        clearInterval(checkPaddle);
      }
    }, 100);
    return () => clearInterval(checkPaddle);
  }, []);

  const openCheckout = (priceId: string) => {
    if (!(window as any).Paddle) {
      alert("Payment system loading, please try again in a moment.");
      return;
    }
    (window as any).Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
    (window as any).Paddle.Checkout.open({
      items: [{ priceId: priceId, quantity: 1 }],
      settings: { theme: "light", displayMode: "overlay", locale: "en" },
    });
  };

  const cycles: { key: BillingCycle; label: string }[] = [
    { key: "monthly", label: "Monthly" },
    { key: "quarterly", label: "Quarterly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />
      <div className="min-h-screen bg-[#F8FAFF]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="font-outfit font-bold text-4xl text-brand-blue text-center mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-brand-muted text-center mb-8">
            Start free. Upgrade when you&apos;re ready to automate.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 border border-[#E0E7F1] shadow-sm inline-flex">
              {cycles.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCycle(c.key)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    cycle === c.key
                      ? "bg-brand-blue text-white shadow-md"
                      : "text-brand-muted hover:text-brand-dark"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-white rounded-[16px] p-8 border border-[#E0E7F1]">
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-2">Free</h3>
              <p className="text-brand-muted text-sm mb-4">QR code generation</p>
              <div className="font-outfit font-bold text-3xl text-brand-dark mb-6">$0</div>
              <Link href="/register" className="block w-full text-center py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-blue hover:text-white transition-colors">
                Get Started
              </Link>
              <ul className="mt-6 space-y-3 text-sm text-brand-dark">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>QR code generation</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Google Review link</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Basic dashboard</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Up to 50 patients</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-[16px] p-8 border-2 border-brand-blue scale-105 shadow-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
              {PRICING[cycle].pro.save && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {PRICING[cycle].pro.save}
                </div>
              )}
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-2">Pro</h3>
              <p className="text-brand-muted text-sm mb-4">Automate your growth</p>
              <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">
                ${PRICING[cycle].pro.price}<span className="text-lg text-brand-muted">{PRICING[cycle].pro.period}</span>
              </div>
              <p className="text-xs text-brand-muted mb-6">7-day free trial, cancel anytime</p>
              <button
                onClick={() => openCheckout(PRICING[cycle].pro.priceId)}
                className="block w-full text-center py-2.5 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
                disabled={!paddleLoaded}
              >
                {paddleLoaded ? "Start 7-Day Free Trial" : "Loading..."}
              </button>
              <ul className="mt-6 space-y-3 text-sm text-brand-dark">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Everything in Free</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Automated email follow-ups</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Real-time negative review alerts</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Competitor tracking</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Reply templates</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Unlimited patients</li>
              </ul>
            </div>

            {/* Agency */}
            <div className="bg-white rounded-[16px] p-8 border border-[#E0E7F1] relative">
              {PRICING[cycle].agency.save && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {PRICING[cycle].agency.save}
                </div>
              )}
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-2">Agency</h3>
              <p className="text-brand-muted text-sm mb-4">Manage multiple clinics</p>
              <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">
                ${PRICING[cycle].agency.price}<span className="text-lg text-brand-muted">{PRICING[cycle].agency.period}</span>
              </div>
              <p className="text-xs text-brand-muted mb-6">7-day free trial, cancel anytime</p>
              <button
                onClick={() => openCheckout(PRICING[cycle].agency.priceId)}
                className="block w-full text-center py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50"
                disabled={!paddleLoaded}
              >
                {paddleLoaded ? "Start 7-Day Free Trial" : "Loading..."}
              </button>
              <ul className="mt-6 space-y-3 text-sm text-brand-dark">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Everything in Pro</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Multi-clinic dashboard</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>White-label branding</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>API access</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Dedicated manager</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
