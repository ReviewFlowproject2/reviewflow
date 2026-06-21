"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Zap, Home, Activity } from "lucide-react";
import Script from "next/script";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const PADDLE_TOKEN = "live_70c09ad4de252bfa5440b90a9ca";
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
type BC = "monthly" | "quarterly" | "yearly";

export default function PricingPage() {
  const [cycle, setCycle] = useState<BC>("monthly");
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const t = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).Paddle) {
        setLoaded(true);
        clearInterval(t);
      }
    }, 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, []);

  const open = (pid: string) => {
    if (!(window as any).Paddle) {
      alert("Payment is loading...");
      return;
    }
    (window as any).Paddle.Initialize({ token: PADDLE_TOKEN });
    (window as any).Paddle.Checkout.open({
      items: [{ priceId: pid, quantity: 1 }],
      settings: { theme: "light", displayMode: "overlay", locale: "en" },
    });
  };

  const cycles: { key: BC; label: string }[] = [
    { key: "monthly", label: "Monthly" },
    { key: "quarterly", label: "Quarterly" },
    { key: "yearly", label: "Yearly" },
  ];

  const plans = [
    {
      name: "Free",
      desc: "Get started with QR codes",
      price: 0,
      period: "",
      save: "",
      link: "/register",
      label: "Start Free Trial",
      color: "border-gray-200",
      bg: "bg-white",
      popular: false,
      agency: false,
      items: [
        "QR code generation",
        "Google Review link",
        "Basic dashboard",
        "Up to 50 patients",
        "Email support",
      ],
    },
    {
      name: "Pro",
      desc: "Automate your reputation",
      price: PRICING[cycle].pro.price,
      period: PRICING[cycle].pro.period,
      save: PRICING[cycle].pro.save,
      pid: PRICING[cycle].pro.priceId,
      color: "border-emerald-500 ring-2 ring-emerald-500",
      bg: "bg-white",
      popular: true,
      agency: false,
      items: [
        "Everything in Free",
        "Automated email follow-ups",
        "Real-time alerts",
        "1,000 patients / month",
        "3 competitor tracking",
        "30-day history",
        "1 team member",
        "Priority support",
      ],
    },
    {
      name: "Agency",
      desc: "Manage multiple clinics",
      price: PRICING[cycle].agency.price,
      period: PRICING[cycle].agency.period,
      save: PRICING[cycle].agency.save,
      pid: PRICING[cycle].agency.priceId,
      color: "border-amber-400",
      bg: "bg-white",
      popular: false,
      agency: true,
      items: [
        "Everything in Pro",
        "Multi-clinic dashboard",
        "White-label branding",
        "API access",
        "10,000 patients / month",
        "20 competitor tracking",
        "Unlimited history",
        "5 team members",
      ],
    },
  ];

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />
      <div className="min-h-screen bg-gray-50">
        {/* Nav */}
        <nav className="h-16 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Activity size={16} />
              </span>
              <span className="font-bold text-lg text-gray-900">ReviewFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                <Home size={16} />Home
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="text-sm px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-teal-600 font-semibold">
                    Log In
                  </Link>
                  <button
                    onClick={() => router.push("/register")}
                    className="text-sm px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                  >
                    Start Free
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="font-bold text-4xl text-gray-900 text-center tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Start free. Upgrade when you&apos;re ready.
          </p>

          {/* Cycle Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm inline-flex">
              {cycles.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCycle(c.key)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    cycle === c.key
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 border-2 shadow-sm relative ${
                  plan.color || "border-gray-200"
                } ${plan.popular ? "md:scale-105" : ""}`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                {/* Agency Badge */}
                {plan.agency && (
                  <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap size={12} />
                    Agency Only
                  </div>
                )}

                {/* Save Badge */}
                {plan.save && (
                  <div className="absolute -top-3 right-4 bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.save}
                  </div>
                )}

                <h3 className="font-bold text-xl text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>

                {/* Price — FIXED: ensure numbers render correctly */}
                <div className="font-bold text-3xl text-gray-900 mb-1">
                  ${plan.price}
                  {plan.period && <span className="text-lg text-gray-400">{plan.period}</span>}
                </div>

                <p className="text-xs text-gray-400 mb-6">1st month free, cancel anytime</p>

                {/* CTA */}
                {i === 0 ? (
                  <Link
                    href="/register"
                    className="block w-full text-center py-2.5 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg text-sm hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    {plan.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => open(plan.pid || "")}
                    disabled={!loaded}
                    className={`block w-full text-center py-2.5 font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors ${
                      plan.agency
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {loaded ? "Get 1st Month Free" : "Loading..."}
                  </button>
                )}

                {/* Feature List */}
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-600">
                      <Check size={14} className="text-teal-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="font-bold text-2xl text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Do I need a credit card?",
                  a: "No. Free plan requires nothing. Pro and Agency include a 15-day free trial.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, cancel from your account settings — no questions asked.",
                },
                {
                  q: "Is my data secure?",
                  a: "Bank-level AES-256 encryption. HIPAA-compliant and GDPR-ready.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "Not satisfied within 14 days? Full refund — no questions asked.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-gray-500 text-sm mb-4">
              Questions?{" "}
              <Link href="/dashboard/support" className="text-teal-600 font-medium">
                Contact Support
              </Link>
            </p>
            <div className="flex justify-center gap-6 text-xs text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-600">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
