"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Star,
  MessageSquare,
  BarChart3,
  ChevronDown,
  Check,
  ArrowRight,
  Mail,
  Bell,
  QrCode,
  Quote,
} from "lucide-react";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

// ==================== FAQ 数据 ====================
const FAQS = [
  {
    q: "Will my patients feel annoyed by the email?",
    a: "ReviewFlow only sends one polite follow-up email to patients who visited that day, with a clear opt-out option. This is standard patient care follow-up, not bulk marketing. Most patients appreciate the reminder.",
  },
  {
    q: "Do I need a credit card to start the free trial?",
    a: "No credit card required. You get full access for 7 days. We only ask for payment details when you decide to continue after the trial.",
  },
  {
    q: "Is my patient data secure?",
    a: "All data is stored on HIPAA-compliant cloud infrastructure with end-to-end encryption. We never sell or share your patient information.",
  },
  {
    q: "What happens when a negative review comes in?",
    a: "You get an instant alert via email within 15 minutes, along with a suggested reply template. This gives you the critical window to respond before the review damages your reputation.",
  },
  {
    q: "How many patients can I import?",
    a: "Free plan: up to 50 patients. Pro plan: 1,000 patients per month. Agency plan: 10,000 patients per month. Upgrade anytime as you grow.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel directly from the Settings page with one click. No phone calls, no hassle. Your data is retained for 30 days for export.",
  },
];

// ==================== Testimonials 数据 ====================
const TESTIMONIALS = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Owner, Bright Smile Dental",
    quote: "We went from 12 reviews to 87 in just 3 months. The QR code at checkout is genius — patients actually use it.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Office Manager, Pearl Dental Group",
    quote: "The negative review alert saved us twice. We caught bad reviews within an hour and turned them around. Worth every penny.",
    rating: 5,
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Owner, Family First Dentistry",
    quote: "I used to manually ask every patient for a review. Now ReviewFlow does it automatically. I have 40 more hours per month to focus on actual dentistry.",
    rating: 5,
  },
];

// ==================== Hero Section ====================
function HeroSection() {
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const heroWrapper = heroWrapperRef.current;
    if (!heroWrapper) return;

    const introLayer = heroWrapper.querySelector(".hero-intro-layer") as HTMLElement;
    const mainMedia = heroWrapper.querySelector(".hero-main-media") as HTMLElement;
    const contentLayer = heroWrapper.querySelector(".hero-content-layer") as HTMLElement;
    const introTexts = introLayer?.querySelectorAll("h1, p, .badge, .hero-btn-group");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapper,
          start: "top top",
          end: "+=150%",
          scrub: true,
          pin: true,
          onLeave: () => {
            gsap.set([mainMedia, contentLayer], { opacity: 0, visibility: "hidden" });
          },
          onEnterBack: () => {
            gsap.set(mainMedia, { opacity: 1, visibility: "visible" });
            gsap.set(contentLayer, { opacity: 1, visibility: "visible" });
          },
        },
      });

      tl.to(introTexts, {
        filter: "blur(20px)", opacity: 0, scale: 0.92,
        ease: "power2.in", duration: 0.3,
      }, 0);
      tl.to(introLayer, { visibility: "hidden", duration: 0.01 }, 0.3);

      tl.to(mainMedia, {
        maskSize: "150% 175%",
        webkitMaskSize: "150% 175%",
        scale: 1.05,
        ease: "power2.out", duration: 0.4,
      }, 0.3);

      tl.fromTo(contentLayer,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: "power1.out", duration: 0.2 },
        0.7
      );

      tl.to(contentLayer, { opacity: 0, y: -20, ease: "power1.in", duration: 0.08 }, 0.9);
      tl.to(mainMedia, { opacity: 0, ease: "power1.in", duration: 0.07 }, 0.93);
    }, heroWrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroWrapperRef} className="hero-wrapper relative w-full h-screen overflow-hidden bg-brand-blue">
      <div className="hero-intro-layer absolute inset-0 flex flex-col items-center justify-center text-white z-[2]">
        <span className="badge mb-6 inline-block px-4 py-2 rounded-full bg-white/15 text-sm font-medium backdrop-blur-sm">
          Google Review Automation for Dental Offices
        </span>
        <h1 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center leading-tight tracking-tight mb-6">
          Turn Happy Patients<br />Into 5-Star Reviews
        </h1>
        <p className="text-base sm:text-lg text-white/80 max-w-2xl text-center px-6 mb-8 leading-relaxed">
          Stop manually asking for reviews. ReviewFlow automates your Google Review management with QR codes and email follow-ups.
        </p>
        <div className="hero-btn-group flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-3.5 bg-brand-yellow text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
          >
            Start Free
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3.5 border border-white/40 text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:bg-white/10"
          >
            Log In
          </button>
        </div>
      </div>

      <div
        className="hero-main-media fixed inset-0 w-screen h-screen bg-cover bg-center z-[1]"
        style={{
          backgroundImage: "url('/assets/clinic-interior.jpg')",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          maskPosition: "center center",
          WebkitMaskPosition: "center center",
          maskSize: "0% 0%",
          WebkitMaskSize: "0% 0%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />

      <div className="hero-content-layer fixed inset-0 flex flex-col items-center justify-center z-[3] opacity-0 translate-y-[20px] text-brand-blue">
        <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl text-center leading-tight tracking-tight mb-6">
          Reputation Management,<br />Made Simple
        </h2>
        <p className="text-base sm:text-lg text-brand-dark/80 max-w-2xl text-center px-6 mb-8 leading-relaxed">
          QR codes for your front desk, automated email follow-ups, and real-time negative review alerts — all in one dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-3.5 bg-brand-yellow text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
          >
            Start Free
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:bg-brand-blue hover:text-white"
          >
            Log In to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== How It Works ====================
function HowItWorks() {
  const steps = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "Place QR Code",
      desc: "Put your custom QR code at the front desk. Patients scan it with their phone and leave a Google review instantly.",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Follow-Up",
      desc: "For patients who didn't scan the code, our system sends a polite email reminder after 24 hours.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Monitor & Alert",
      desc: "New reviews appear in your dashboard. Negative reviews trigger instant email alerts with reply suggestions.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue text-center mb-16">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-soft flex items-center justify-center text-brand-blue mx-auto mb-5">
                {s.icon}
              </div>
              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-3">{s.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Features Section ====================
function FeaturesSection() {
  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR Code Generator",
      desc: "Create branded QR codes that take patients directly to your Google Review page. Download and print for your front desk.",
      img: "/assets/feature-sms.jpg",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Real-Time Negative Review Alerts",
      desc: "Get notified within 15 minutes via email. Respond fast with suggested reply templates before the review damages your reputation.",
      img: "/assets/feature-alert.jpg",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Competitor Tracking",
      desc: "Monitor nearby dental offices' ratings and review trends. Stay ahead of the competition.",
      img: "/assets/feature-analytics.jpg",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-brand-soft">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-4">
            All-in-One Review Toolkit
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto">
            From QR codes to email follow-ups to negative review response — ReviewFlow covers the entire reputation cycle.
          </p>
        </div>
        <div className="space-y-12">
          {features.map((f, i) => (
            <div
              key={i}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
            >
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-blue mb-5 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-outfit font-bold text-2xl text-brand-dark mb-4">{f.title}</h3>
                <p className="text-brand-muted leading-relaxed">{f.desc}</p>
              </div>
              <div className="flex-1">
                <img
                  src={f.img}
                  alt={f.title}
                  className="rounded-[20px] shadow-card w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Testimonials Section ====================
function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-3">
            Trusted by Dental Offices Worldwide
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto">
            See how practices like yours are growing their online reputation with ReviewFlow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-brand-soft rounded-[16px] p-6 border border-[#E0E7F1]">
              <Quote className="w-8 h-8 text-brand-blue/20 mb-4" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < t.rating ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}
                  />
                ))}
              </div>
              <p className="text-brand-dark text-sm leading-relaxed mb-4">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold text-sm">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-sm text-brand-dark">{t.name}</p>
                  <p className="text-xs text-brand-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Pricing Section ====================
function PricingSection() {
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Get started with QR codes",
      features: [
        "QR code generation",
        "Google Review link",
        "Basic dashboard",
        "Up to 50 patients",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$39",
      period: "/month",
      description: "Automate your reputation growth",
      features: [
        "Everything in Free",
        "Automated email follow-ups",
        "Real-time negative review alerts",
        "1,000 patients / month",
        "500 SMS review requests / month",
        "3 competitor tracking",
        "30-day historical data",
        "1 team member",
        "Priority email support",
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
    },
    {
      name: "Agency",
      price: "$69",
      period: "/month",
      description: "Manage multiple clinics",
      features: [
        "Everything in Pro",
        "Multi-clinic dashboard",
        "White-label branding",
        "API access",
        "Custom integrations",
        "10,000 patients / month",
        "5,000 SMS review requests / month",
        "20 competitor tracking",
        "Unlimited historical data",
        "5 team members",
        "Export monthly reports",
        "1-on-1 dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-brand-muted">Start free. Upgrade when you're ready to automate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-[16px] p-8 transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-2 border-brand-blue shadow-card"
                  : "border border-[#E0E7F1]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">{plan.name}</h3>
              <p className="text-sm text-brand-muted mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="font-outfit font-bold text-4xl text-brand-blue">{plan.price}</span>
                <span className="text-brand-muted">{plan.period}</span>
              </div>

              <button
                onClick={() => {
                  if (plan.name === "Agency") {
                    window.location.href = "mailto:sales@reviewflowdental.com";
                  } else {
                    router.push("/register");
                  }
                }}
                className={`w-full py-2.5 rounded-[10px] font-semibold text-sm transition-all hover:scale-[1.01] ${
                  plan.popular
                    ? "bg-brand-blue text-white hover:bg-brand-dark"
                    : "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                }`}
              >
                {plan.cta}
              </button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-brand-dark">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ Section ====================
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28 bg-brand-soft">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-[12px] bg-white border border-[#E0E7F1] overflow-hidden shadow-card">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-brand-dark text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-muted flex-shrink-0 transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-brand-muted leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== CTA Section ====================
function CTASection() {
  const router = useRouter();
  return (
    <section className="py-20 md:py-28 bg-brand-blue text-white text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="font-outfit font-bold text-3xl md:text-4xl mb-4">
          Ready to Grow Your Reviews?
        </h2>
        <p className="text-white/80 mb-8 leading-relaxed">
          Join dental offices worldwide using ReviewFlow. Start free, no credit card required.
        </p>
        <button
          onClick={() => router.push("/register")}
          className="px-8 py-3.5 bg-brand-yellow text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] inline-flex items-center gap-2"
        >
          Start Free <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

// ==================== Footer ====================
function Footer() {
  return (
    <footer className="bg-brand-dark text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-outfit font-bold text-xl">ReviewFlow</div>
          <div className="text-sm text-white/60">
            © 2026 ReviewFlow. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-white/80">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== Navbar ====================
function Navbar() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/85 backdrop-blur-md border-b border-[#E9F1FA]">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="font-outfit font-bold text-xl text-brand-blue">
          ReviewFlow
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-brand-muted">
          <a href="#features" className="hover:text-brand-blue transition-colors">Features</a>
          <a href="#pricing" className="hover:text-brand-blue transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-brand-blue transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-brand-blue font-semibold hover:underline"
          >
            Log In
          </Link>
          <button
            onClick={() => router.push("/register")}
            className="text-sm px-5 py-2 bg-brand-blue text-white font-semibold rounded-[8px] hover:bg-brand-dark transition-colors"
          >
            Start Free
          </button>
        </div>
      </div>
    </nav>
  );
}

// ==================== Main Page ====================
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <HeroSection />
        <div id="features">
          <HowItWorks />
          <FeaturesSection />
        </div>
        <TestimonialsSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="faq">
          <FAQSection />
        </div>
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
