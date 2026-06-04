"use client";

import Link from "next/link";
import { Check, Zap, Users, Bell, Headphones, MessageSquare } from "lucide-react";
import Script from "next/script";
import { useState, useEffect } from "react";

const PADDLE_CLIENT_TOKEN = "live_70c09ad4de252bfa5440b90a9ca";

const PRICING = {
  monthly: {
    pro: { priceId: "pri_01kt19xahgfjcw0hcmc9gkws26", price: 39, period: "/mo", save: "" },
    agency: { priceId: "pri_01kt1a0wwqa4nbny8d3ae0tben", price: 69, period: "/mo", save: "" },
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

const AgencyBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
    {children}
  </span>
);

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

  const getSaveLabel = (plan: "pro" | "agency") => {
    const save = PRICING[cycle][plan].save;
    return save ? save : null;
  };

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* FREE */}
            <div className="bg-white rounded-[16px] p-8 border border-[#E0E7F1]">
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">Free</h3>
              <p className="text-brand-muted text-sm mb-4">Get started with QR codes</p>
              <div className="font-outfit font-bold text-3xl text-brand-dark mb-6">$0</div>
              <Link 
                href="/register" 
                className="block w-full text-center py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-blue hover:text-white transition-colors"
              >
                Get Started
              </Link>
              <ul className="mt-6 space-y-3 text-sm text-brand-dark">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>QR code generation</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Google Review link</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Basic dashboard</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Up to 50 patients</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Email support</li>
              </ul>
            </div>

            {/* PRO */}
            <div className="bg-white rounded-[16px] p-8 border-2 border-brand-blue scale-105 shadow-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-4 py-1 rounded-full">
                Most Popular
              </div>
              {getSaveLabel("pro") && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {getSaveLabel("pro")}
                </div>
              )}
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">Pro</h3>
              <p className="text-brand-muted text-sm mb-4">Automate your reputation growth</p>
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
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Everything in Free</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Automated email follow-ups</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Real-time negative review alerts</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>1,000 patients / month</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>500 SMS review requests / month</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>3 competitor tracking</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>30-day historical data</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>1 team member</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Priority email support</li>
              </ul>
            </div>

            {/* AGENCY */}
            <div className="bg-white rounded-[16px] p-8 border-2 border-amber-400 relative shadow-lg">
              {getSaveLabel("agency") && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {getSaveLabel("agency")}
                </div>
              )}
              <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={12} /> Agency Only
              </div>
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">Agency</h3>
              <p className="text-brand-muted text-sm mb-4">Manage multiple clinics</p>
              <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">
                ${PRICING[cycle].agency.price}<span className="text-lg text-brand-muted">{PRICING[cycle].agency.period}</span>
              </div>
              <p className="text-xs text-brand-muted mb-6">7-day free trial, cancel anytime</p>
              <button
                onClick={() => openCheckout(PRICING[cycle].agency.priceId)}
                className="block w-full text-center py-2.5 bg-amber-500 text-white font-semibold rounded-[10px] text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
                disabled={!paddleLoaded}
              >
                {paddleLoaded ? "Start 7-Day Free Trial" : "Loading..."}
              </button>
              <ul className="mt-6 space-y-3 text-sm text-brand-dark">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Everything in Pro</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Multi-clinic dashboard</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>White-label branding</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>API access</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Custom integrations</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>10,000 patients / month</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>5,000 SMS review requests / month</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>20 competitor tracking</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Unlimited historical data</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>5 team members</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Export monthly reports</li>

                {/* Agency Exclusive Features */}
                <li className="flex items-start gap-2">
                  <Zap size={14} className="text-amber-500 shrink-0 mt-0.5"/>
                  <span>
                    <span className="font-semibold">Daily Reputation Digest</span>
                    <AgencyBadge>Agency Only</AgencyBadge>
                    <span className="block text-xs text-brand-muted">Morning email summary. No login needed.</span>
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Bell size={14} className="text-amber-500 shrink-0 mt-0.5"/>
                  <span>
                    <span className="font-semibold">Priority SMS Alerts</span>
                    <AgencyBadge>Agency Only</AgencyBadge>
                    <span className="block text-xs text-brand-muted">1-2⭐ reviews within 10 min via SMS</span>
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Users size={14} className="text-amber-500 shrink-0 mt-0.5"/>
                  <span>
                    <span className="font-semibold">Multi-Recipient Alerts</span>
                    <AgencyBadge>Agency Only</AgencyBadge>
                    <span className="block text-xs text-brand-muted">Up to 5 staff members notified</span>
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Headphones size={14} className="text-amber-500 shrink-0 mt-0.5"/>
                  <span>
                    <span className="font-semibold">1-on-1 Dedicated Support</span>
                    <AgencyBadge>Agency Only</AgencyBadge>
                    <span className="block text-xs text-brand-muted">Dedicated account manager + live chat</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="font-outfit font-bold text-2xl text-brand-dark text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Do I need a credit card to start?",
                  a: "No credit card required for the Free plan. Pro and Agency plans include a 7-day free trial — we only ask for payment details when you decide to continue after the trial."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, you can cancel your subscription at any time from your account settings. No questions asked, no hidden fees."
                },
                {
                  q: "What happens after the 7-day trial?",
                  a: "If you don't subscribe, your account automatically downgrades to the Free plan. You keep all your data and can upgrade again anytime."
                },
                {
                  q: "Is my patient data secure?",
                  a: "Absolutely. We use bank-level encryption (AES-256) and never share your patient data with third parties. We are HIPAA-compliant and GDPR-ready."
                },
                {
                  q: "Can I switch plans later?",
                  a: "Yes, you can upgrade or downgrade at any time. When upgrading, you only pay the prorated difference. When downgrading, the new rate applies at the next billing cycle."
                },
                {
                  q: "Do you offer refunds?",
                  a: "If you are not satisfied within the first 14 days of your paid subscription, contact us for a full refund — no questions asked."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E0E7F1] p-5">
                  <h3 className="font-semibold text-brand-dark mb-2">{faq.q}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-16">
            <p className="text-brand-muted text-sm mb-4">
              Still have questions?{" "}
              <Link href="/dashboard/support" className="text-brand-blue hover:underline font-medium">
                Contact Support
              </Link>
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-brand-muted/60">
              <Link href="/privacy" className="hover:text-brand-muted transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-brand-muted transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-brand-muted transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
