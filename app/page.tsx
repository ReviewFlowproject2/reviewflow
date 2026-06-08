"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Star, MessageSquare, BarChart3, ChevronDown, Check, ArrowRight,
  Mail, Bell, QrCode, User, LogOut, Zap, Quote, TrendingUp,
  Clock, Shield, ChevronLeft, ChevronRight
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

gsap.registerPlugin(ScrollTrigger);

// ==================== FAQ 数据 ====================
const FAQS = [
  { q: "Will my patients feel annoyed by the email?", a: "ReviewFlow only sends one polite follow-up email to patients who visited that day, with a clear opt-out option. This is standard patient care follow-up, not bulk marketing. Most patients appreciate the reminder." },
  { q: "Do I need a credit card to start the free trial?", a: "No credit card required. You get full access for 30 days. We only ask for payment details when you decide to continue after the trial." },
  { q: "Is my patient data secure?", a: "All data is stored on HIPAA-compliant cloud infrastructure with end-to-end encryption. We never sell or share your patient information." },
  { q: "What happens when a negative review comes in?", a: "You get an instant alert via email within 15 minutes, along with a suggested reply template. This gives you the critical window to respond before the review damages your reputation." },
  { q: "How many patients can I import?", a: "Unlimited. Import via CSV bulk upload or add manually one by one. There are no patient count limits on the Pro plan." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel directly from the Settings page with one click. No phone calls, no hassle. Your data is retained for 30 days for export." },
];

// ==================== Testimonials 数据 ====================
const TESTIMONIALS = [
  {
    name: "Dr. Sarah Mitchell",
    clinic: "Smile Bright Dental",
    location: "Houston, TX",
    avatar: "SM",
    beforeRating: 2.8,
    afterRating: 4.6,
    reviewCount: 87,
    timeFrame: "3 months",
    quote: "Before ReviewFlow, we had 12 reviews and a 2.8 rating. After 3 months, we're at 4.6 stars with 87 reviews. The negative review alerts alone saved us from two 1-star disasters.",
  },
  {
    name: "Dr. James Chen",
    clinic: "Parkside Family Dentistry",
    location: "Austin, TX",
    avatar: "JC",
    beforeRating: 3.2,
    afterRating: 4.8,
    reviewCount: 156,
    timeFrame: "5 months",
    quote: "The QR code at our front desk is genius. Patients scan it while checking out — we went from begging for reviews to getting 8-10 per week automatically. Best $39 we spend.",
  },
  {
    name: "Dr. Maria Rodriguez",
    clinic: "Sunshine Dental Care",
    location: "Miami, FL",
    avatar: "MR",
    beforeRating: 3.5,
    afterRating: 4.7,
    reviewCount: 203,
    timeFrame: "4 months",
    quote: "We manage 3 locations. The Agency plan's multi-clinic dashboard lets me see all reviews in one place. I caught a billing complaint at our Miami office within 10 minutes.",
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
        scrollTrigger: { trigger: heroWrapper, start: "top top", end: "+=150%", scrub: true, pin: true,
          onLeave: () => { gsap.set([mainMedia, contentLayer], { opacity: 0, visibility: "hidden" }); },
          onEnterBack: () => { gsap.set(mainMedia, { opacity: 1, visibility: "visible" }); gsap.set(contentLayer, { opacity: 1, visibility: "visible" }); },
        },
      });
      tl.to(introTexts, { filter: "blur(20px)", opacity: 0, scale: 0.92, ease: "power2.in", duration: 0.3 }, 0);
      tl.to(introLayer, { visibility: "hidden", duration: 0.01 }, 0.3);
      tl.to(mainMedia, { maskSize: "150% 175%", webkitMaskSize: "150% 175%", scale: 1.05, ease: "power2.out", duration: 0.4 }, 0.3);
      tl.fromTo(contentLayer, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power1.out", duration: 0.2 }, 0.7);
      tl.to(contentLayer, { opacity: 0, y: -20, ease: "power1.in", duration: 0.08 }, 0.9);
      tl.to(mainMedia, { opacity: 0, ease: "power1.in", duration: 0.07 }, 0.93);
    }, heroWrapper);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroWrapperRef} className="hero-wrapper relative w-full h-screen overflow-hidden bg-brand-blue">
      <div className="hero-intro-layer absolute inset-0 flex flex-col items-center justify-center text-white z-[2]">
        <span className="badge mb-6 inline-block px-4 py-2 rounded-full bg-white/15 text-sm font-medium backdrop-blur-sm">Google Review Automation for Dental Offices</span>
        <h1 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center leading-tight tracking-tight mb-6">Turn Happy Patients<br />Into 5-Star Reviews</h1>
        <p className="text-base sm:text-lg text-white/80 max-w-2xl text-center px-6 mb-8 leading-relaxed">Stop manually asking for reviews. ReviewFlow automates your Google Review management with QR codes and email follow-ups.</p>
        <div className="hero-btn-group flex flex-col sm:flex-row gap-4">
          <button onClick={() => router.push("/register")} className="px-8 py-3.5 bg-brand-yellow text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02]">Start Free</button>
          <button onClick={() => router.push("/login")} className="px-8 py-3.5 border border-white/40 text-white font-semibold rounded-[10px] text-sm transition-all duration-200 hover:bg-white/10">Log In</button>
        </div>
      </div>
      <div className="hero-main-media fixed inset-0 w-screen h-screen bg-cover bg-center z-[1]" style={{ backgroundImage: "url('/assets/clinic-interior.jpg')", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", maskPosition: "center center", WebkitMaskPosition: "center center", maskSize: "0% 0%", WebkitMaskSize: "0% 0%", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
      <div className="hero-content-layer fixed inset-0 flex flex-col items-center justify-center z-[3] opacity-0 translate-y-[20px] text-brand-blue">
        <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl text-center leading-tight tracking-tight mb-6">Reputation Management,<br />Made Simple</h2>
        <p className="text-base sm:text-lg text-brand-dark/80 max-w-2xl text-center px-6 mb-8 leading-relaxed">QR codes for your front desk, automated email follow-ups, and real-time negative review alerts — all in one dashboard.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => router.push("/register")} className="px-8 py-3.5 bg-brand-yellow text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02]">Start Free</button>
          <button onClick={() => router.push("/login")} className="px-8 py-3.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:bg-brand-blue hover:text-white">Log In to Dashboard</button>
        </div>
      </div>
    </div>
  );
}

// ==================== How It Works (Visual Flow) ====================
function HowItWorksVisual() {
  const steps = [
    { icon: <QrCode className="w-6 h-6" />, title: "Place QR Code", desc: "Patient scans at checkout", color: "bg-blue-50 text-blue-600", border: "border-blue-200" },
    { icon: <Mail className="w-6 h-6" />, title: "Auto Email", desc: "System sends follow-up", color: "bg-purple-50 text-purple-600", border: "border-purple-200" },
    { icon: <Star className="w-6 h-6" />, title: "Leave Review", desc: "Patient rates on Google", color: "bg-green-50 text-green-600", border: "border-green-200" },
    { icon: <Bell className="w-6 h-6" />, title: "Get Alert", desc: "Negative review? You know in 15 min", color: "bg-red-50 text-red-600", border: "border-red-200" },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-4">How ReviewFlow Works</h2>
          <p className="text-brand-muted max-w-xl mx-auto">From patient checkout to review reply — fully automated in 4 steps.</p>
        </div>

        <div className="relative">
          {/* Desktop: horizontal flow with arrows */}
          <div className="hidden md:flex items-start justify-between gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center relative">
                {/* Step number */}
                <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mb-4 border-2 ${step.border} z-10`}>
                  {step.icon}
                </div>
                <h3 className="font-outfit font-bold text-lg text-brand-dark mb-2">{step.title}</h3>
                <p className="text-sm text-brand-muted max-w-[180px]">{step.desc}</p>

                {/* Arrow (except last) */}
                {i < steps.length - 1 && (
                  <div className="absolute top-6 left-[calc(50%+40px)] w-[calc(100%-80px)] flex items-center">
                    <div className="h-0.5 bg-brand-soft flex-1 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-brand-soft rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical stack */}
          <div className="md:hidden space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0 border-2 ${step.border}`}>
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-muted bg-brand-soft px-2 py-0.5 rounded">Step {i + 1}</span>
                    <h3 className="font-outfit font-bold text-lg text-brand-dark">{step.title}</h3>
                  </div>
                  <p className="text-sm text-brand-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Features Section ====================
function FeaturesSection() {
  const features = [
    { icon: <QrCode className="w-6 h-6" />, title: "QR Code Generator", desc: "Create branded QR codes that take patients directly to your Google Review page. Download and print for your front desk.", img: "/assets/feature-sms.jpg" },
    { icon: <Star className="w-6 h-6" />, title: "Real-Time Negative Review Alerts", desc: "Get notified within 15 minutes via email. Respond fast with suggested reply templates before the review damages your reputation.", img: "/assets/feature-alert.jpg" },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Competitor Tracking", desc: "Monitor nearby dental offices' ratings and review trends. Stay ahead of the competition.", img: "/assets/feature-analytics.jpg" },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-brand-soft scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-4">All-in-One Review Toolkit</h2>
          <p className="text-brand-muted max-w-xl mx-auto">From QR codes to email follow-ups to negative review response — ReviewFlow covers the entire reputation cycle.</p>
        </div>
        <div className="space-y-12">
          {features.map((f, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}>
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-blue mb-5 shadow-sm">{f.icon}</div>
                <h3 className="font-outfit font-bold text-2xl text-brand-dark mb-4">{f.title}</h3>
                <p className="text-brand-muted leading-relaxed">{f.desc}</p>
              </div>
              <div className="flex-1">
                <img src={f.img} alt={f.title} className="rounded-[20px] shadow-card w-full object-cover aspect-[4/3]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Testimonials (Social Proof with Data) ====================
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const t = TESTIMONIALS[current];

  const next = () => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-3">Trusted by Dental Offices Nationwide</h2>
          <p className="text-brand-muted">Real results from real clinics.</p>
        </div>

        {/* Desktop: 3 cards grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E0E7F1] p-6 shadow-card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-brand-dark text-sm">{item.name}</p>
                  <p className="text-xs text-brand-muted">{item.clinic}, {item.location}</p>
                </div>
              </div>

              {/* Rating improvement */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-brand-soft rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-brand-muted">Before</p>
                  <p className="font-outfit font-bold text-lg text-brand-muted">{item.beforeRating}</p>
                </div>
                <TrendingUp size={16} className="text-green-500" />
                <div className="text-center">
                  <p className="text-xs text-brand-muted">After</p>
                  <p className="font-outfit font-bold text-lg text-brand-blue">{item.afterRating}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-brand-muted">Reviews</p>
                  <p className="font-outfit font-bold text-lg text-brand-blue">{item.reviewCount}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="relative">
                <Quote size={16} className="text-brand-soft absolute -top-1 -left-1" />
                <p className="text-sm text-brand-dark leading-relaxed pl-4">{item.quote}</p>
              </div>

              <p className="text-xs text-brand-muted mt-3">Results in {item.timeFrame}</p>
            </div>
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div className="bg-white rounded-2xl border border-[#E0E7F1] p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">{t.avatar}</div>
              <div>
                <p className="font-semibold text-brand-dark text-sm">{t.name}</p>
                <p className="text-xs text-brand-muted">{t.clinic}, {t.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4 p-3 bg-brand-soft rounded-xl">
              <div className="text-center"><p className="text-xs text-brand-muted">Before</p><p className="font-outfit font-bold text-lg text-brand-muted">{t.beforeRating}</p></div>
              <TrendingUp size={16} className="text-green-500" />
              <div className="text-center"><p className="text-xs text-brand-muted">After</p><p className="font-outfit font-bold text-lg text-brand-blue">{t.afterRating}</p></div>
              <div className="ml-auto text-right"><p className="text-xs text-brand-muted">Reviews</p><p className="font-outfit font-bold text-lg text-brand-blue">{t.reviewCount}</p></div>
            </div>
            <div className="relative">
              <Quote size={16} className="text-brand-soft absolute -top-1 -left-1" />
              <p className="text-sm text-brand-dark leading-relaxed pl-4">{t.quote}</p>
            </div>
            <p className="text-xs text-brand-muted mt-3">Results in {t.timeFrame}</p>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={prev} className="p-2 rounded-full bg-brand-soft text-brand-muted hover:text-brand-blue transition-colors"><ChevronLeft size={20} /></button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-brand-blue" : "bg-brand-soft"}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-brand-soft text-brand-muted hover:text-brand-blue transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Pricing Section ====================
function PricingSection() {
  const router = useRouter();
  return (
    <section id="pricing" className="py-20 md:py-28 bg-brand-soft scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue mb-3">Simple, Transparent Pricing</h2>
          <p className="text-brand-muted">Start free. Upgrade when you&apos;re ready to automate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="bg-white rounded-[16px] p-8 border border-[#E0E7F1]">
            <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">Free</h3>
            <p className="text-brand-muted text-sm mb-4">Get started with QR codes</p>
            <div className="font-outfit font-bold text-3xl text-brand-dark mb-6">$0</div>
            <button onClick={() => router.push("/register")} className="block w-full text-center py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-blue hover:text-white transition-colors">Get Started</button>
            <ul className="mt-6 space-y-3 text-sm text-brand-dark">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>QR code generation</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Google Review link</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Basic dashboard</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Up to 50 patients</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Email support</li>
            </ul>
          </div>
          <div className="bg-white rounded-[16px] p-8 border-2 border-brand-blue scale-105 shadow-card relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
            <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">Pro</h3>
            <p className="text-brand-muted text-sm mb-4">Automate your reputation growth</p>
            <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">$39<span className="text-lg text-brand-muted">/month</span></div>
            <p className="text-xs text-brand-muted mb-6">7-day free trial, cancel anytime</p>
            <button onClick={() => router.push("/dashboard/support")} className="block w-full text-center py-2.5 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-colors">Start 7-Day Free Trial</button>
            <ul className="mt-6 space-y-3 text-sm text-brand-dark">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Everything in Free</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Automated email follow-ups</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Real-time negative review alerts</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>1,000 patients / month</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>3 competitor tracking</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>30-day historical data</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>1 team member</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Priority email support</li>
            </ul>
          </div>
          <div className="bg-white rounded-[16px] p-8 border-2 border-amber-400 relative shadow-lg">
            <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={12} /> Agency Only</div>
            <h3 className="font-outfit font-bold text-xl text-brand-dark mb-1">Agency</h3>
            <p className="text-brand-muted text-sm mb-4">Manage multiple clinics</p>
            <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">$69<span className="text-lg text-brand-muted">/month</span></div>
            <p className="text-xs text-brand-muted mb-6">7-day free trial, cancel anytime</p>
            <button onClick={() => router.push("/dashboard/support")} className="block w-full text-center py-2.5 border-2 border-amber-500 text-amber-600 font-semibold rounded-[10px] text-sm hover:bg-amber-500 hover:text-white transition-colors">Contact Sales</button>
            <ul className="mt-6 space-y-3 text-sm text-brand-dark">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Everything in Pro</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Multi-clinic dashboard</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>White-label branding</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>API access</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Custom integrations</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>10,000 patients / month</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>20 competitor tracking</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Unlimited historical data</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>5 team members</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Export monthly reports</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>Daily Reputation Digest</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/>1-on-1 Dedicated Support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ Section ====================
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 md:py-28 bg-white scroll-mt-20">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-outfit font-bold text-3xl md:text-4xl text-brand-blue text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-[12px] bg-white border border-[#E0E7F1] overflow-hidden shadow-card">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-semibold text-brand-dark text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-brand-muted flex-shrink-0 transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && <div className="px-5 pb-5 text-sm text-brand-muted leading-relaxed">{faq.a}</div>}
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
        <h2 className="font-outfit font-bold text-3xl md:text-4xl mb-4">Ready to Grow Your Reviews?</h2>
        <p className="text-white/80 mb-8 leading-relaxed">Join 500+ dental offices using ReviewFlow. Start free, no credit card required.</p>
        <button onClick={() => router.push("/register")} className="px-8 py-3.5 bg-brand-yellow text-brand-blue font-semibold rounded-[10px] text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] inline-flex items-center gap-2">Start Free <ArrowRight size={16} /></button>
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
          <div className="text-sm text-white/60">© 2026 ReviewFlow. Built for Dental Offices.</div>
          <div className="flex gap-6 text-sm text-white/80">
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
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const checkUser = async () => { const { data: { user } } = await supabase.auth.getUser(); setUser(user); };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); router.push("/"); router.refresh(); };

  // 修复: 添加平滑滚动处理函数
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/85 backdrop-blur-md border-b border-[#E9F1FA]">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="font-outfit font-bold text-xl text-brand-blue">ReviewFlow</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-brand-muted">
          <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-brand-blue transition-colors cursor-pointer">Features</a>
          <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="hover:text-brand-blue transition-colors cursor-pointer">Pricing</a>
          <a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-brand-blue transition-colors cursor-pointer">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 text-sm text-brand-dark font-medium hover:text-brand-blue transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue"><User size={16} /></div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#E0E7F1] shadow-lg py-2 z-50">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dark hover:bg-brand-soft transition-colors"><Star size={14} />Dashboard</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"><LogOut size={14} />Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-brand-blue font-semibold hover:underline">Log In</Link>
              <button onClick={() => router.push("/register")} className="text-sm px-5 py-2 bg-brand-blue text-white font-semibold rounded-[8px] hover:bg-brand-dark transition-colors">Start Free</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ==================== Main Page ====================
export default function HomePage() {
  // 修复: 添加全局平滑滚动
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth";
    }
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <HeroSection />
        <HowItWorksVisual />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
