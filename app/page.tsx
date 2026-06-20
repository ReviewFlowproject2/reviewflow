"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, BarChart3, Check, ArrowRight, Mail, Bell, QrCode, Quote,
  TrendingUp, Clock, ChevronDown, ChevronLeft, ChevronRight, Zap, Users, Headphones, Activity,
} from "lucide-react";

// ==================== FAQ ====================
const FAQS = [
  { q: "Will my patients feel annoyed by the email?", a: "ReviewFlow only sends one polite follow-up email to patients who visited that day, with a clear opt-out option. This is standard patient care follow-up, not bulk marketing." },
  { q: "Do I need a credit card to start?", a: "No credit card required. You get full access for 15 days. We only ask for payment details when you decide to continue after the trial." },
  { q: "Is my patient data secure?", a: "All data is stored on HIPAA-compliant cloud infrastructure with end-to-end encryption. We never sell or share your patient information." },
  { q: "What happens when a negative review comes in?", a: "You get an alert via email within 15 minutes, along with a suggested reply template for the critical first-response window." },
  { q: "How many patients can I import?", a: "Unlimited. Import via CSV bulk upload or add manually. No patient count limits on the Pro plan." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel directly from the Settings page with one click. Your data is retained for 30 days for export." },
];

// ==================== Testimonials ====================
const TESTIMONIALS = [
  {
    name: "Dr. Sarah Mitchell", clinic: "Smile Bright Dental", location: "Houston, TX",
    beforeRating: 2.8, afterRating: 4.6, reviewCount: 87, timeFrame: "3 months",
    quote: "Before ReviewFlow, we had 12 reviews and a 2.8 rating. After 3 months, we're at 4.6 stars with 87 reviews. The negative review alerts alone saved us from two 1-star disasters.",
  },
  {
    name: "Dr. James Chen", clinic: "Parkside Family Dentistry", location: "Austin, TX",
    beforeRating: 3.2, afterRating: 4.8, reviewCount: 156, timeFrame: "5 months",
    quote: "The QR code at our front desk is genius. Patients scan it while checking out — we went from begging for reviews to getting 8-10 per week automatically.",
  },
  {
    name: "Dr. Maria Rodriguez", clinic: "Sunshine Dental Care", location: "Miami, FL",
    beforeRating: 3.5, afterRating: 4.7, reviewCount: 203, timeFrame: "4 months",
    quote: "We manage 3 locations. The multi-clinic dashboard lets me see all reviews in one place. I caught a billing complaint at our Miami office within 10 minutes.",
  },
];

// ==================== Hero ====================
function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 to-white pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
              <span className="flex size-2 rounded-full bg-teal-500" />
              Google Review Automation for Dental Offices
            </div>
            <h1 className="mt-5 text-pretty text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Turn Happy Patients Into{" "}
              <span className="text-teal-600">5-Star Reviews</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
              Stop manually asking for reviews. ReviewFlow automates your Google Review management with QR codes and email follow-ups — built specifically for dental practices.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push("/register")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 font-semibold text-white shadow-sm transition hover:bg-teal-700">
                Start Free Trial <ArrowRight size={16} />
              </button>
              <Link href="/free-audit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Free Review Audit
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400 flex items-center gap-2"><Clock size={14} />No credit card · 15-day free trial</p>
          </div>

          {/* RIGHT — Dashboard mockup */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                <span className="text-xs text-slate-400 ml-3">ReviewFlow Dashboard</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[{ v: "156", l: "Reviews", c: "text-teal-600" }, { v: "4.8", l: "Avg Rating", c: "text-amber-500" }, { v: "0", l: "Negative", c: "text-red-500" }, { v: "94%", l: "Success", c: "text-blue-500" }].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 text-center"><div className={`text-lg font-bold ${s.c}`}>{s.v}</div><div className="text-[10px] text-slate-400">{s.l}</div></div>
                  ))}
                </div>
                <div className="space-y-2"><div className="h-2 bg-slate-100 rounded-full w-full" /><div className="h-2 bg-slate-100 rounded-full w-3/4" /><div className="h-2 bg-slate-100 rounded-full w-1/2" /><div className="h-2 bg-slate-100 rounded-full w-5/6" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== How It Works ====================
function HowItWorksSection() {
  const steps = [
    { icon: QrCode, title: "Place QR Code", desc: "Patient scans at checkout — goes straight to your Google Review page.", color: "bg-teal-50 text-teal-600 border-teal-200" },
    { icon: Mail, title: "Auto Email", desc: "System sends a polite, HIPAA-compliant follow-up email the same day.", color: "bg-blue-50 text-blue-600 border-blue-200" },
    { icon: Star, title: "Leave Review", desc: "Patient rates your practice on Google. One tap, frictionless.", color: "bg-amber-50 text-amber-600 border-amber-200" },
    { icon: Bell, title: "Get Alert", desc: "Negative review? You know in 15 minutes — with a suggested reply.", color: "bg-red-50 text-red-600 border-red-200" },
  ];
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl md:text-4xl text-slate-900 tracking-tight mb-4">How ReviewFlow Works</h2>
          <p className="text-slate-500 max-w-xl mx-auto">From patient checkout to review reply — fully automated in 4 steps.</p>
        </div>
        <div className="hidden md:flex items-start justify-between gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center relative">
              <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 border`}><step.icon size={22} /></div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 max-w-[200px]">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)]"><div className="h-px bg-slate-200 relative"><div className="absolute right-0 -top-[3px] w-2 h-2 border-t-2 border-r-2 border-slate-300 rotate-45" /></div></div>
              )}
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0 border`}><step.icon size={20} /></div>
              <div><p className="text-xs font-bold text-slate-400 mb-1">Step {i+1}</p><h3 className="font-bold text-lg text-slate-900">{step.title}</h3><p className="text-sm text-slate-500">{step.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Features ====================
function FeaturesSection() {
  const features = [
    { icon: QrCode, title: "QR Code Generator", desc: "Create branded QR codes that take patients directly to your Google Review page. Download and print for your front desk." },
    { icon: Bell, title: "Real-Time Alerts", desc: "Get notified within 15 minutes via email. Respond fast with suggested reply templates." },
    { icon: BarChart3, title: "Competitor Tracking", desc: "Monitor nearby dental offices' ratings and review trends with real-time data." },
  ];
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50/60 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl md:text-4xl text-slate-900 tracking-tight mb-4">All-in-One Review Toolkit</h2>
          <p className="text-slate-500 max-w-xl mx-auto">QR codes, email follow-ups, negative review response — the full reputation cycle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-5"><f.icon size={22} /></div>
              <h3 className="font-bold text-lg text-slate-900 mb-3">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Testimonials ====================
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const t = TESTIMONIALS[current];
  const next = () => setCurrent((p) => (p + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">Trusted by Dental Offices Nationwide</h2>
          <p className="text-slate-500">Real results from real clinics.</p>
        </div>
        <div className="hidden md:grid grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <Quote size={18} className="text-teal-500/30 mb-3" />
              <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">{item.name.split(" ").map(w => w[0]).join("")}</div>
                <div><p className="text-sm font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.clinic}, {item.location}</p></div>
              </div>
              <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-teal-50 rounded-xl">
                <span className="text-xs text-slate-500">Before</span>
                <span className="font-bold text-sm text-slate-400">{item.beforeRating}</span>
                <TrendingUp size={14} className="text-teal-600" />
                <span className="font-bold text-sm text-teal-600">{item.afterRating}</span>
                <span className="text-xs text-slate-400 ml-auto">{item.reviewCount} reviews</span>
              </div>
            </div>
          ))}
        </div>
        {/* Mobile carousel */}
        <div className="md:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Quote size={18} className="text-teal-500/30 mb-3" />
            <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">{t.name.split(" ").map(w => w[0]).join("")}</div>
              <div><p className="text-sm font-semibold text-slate-900">{t.name}</p><p className="text-xs text-slate-500">{t.clinic}, {t.location}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={prev} className="p-2 rounded-full bg-slate-100 text-slate-500"><ChevronLeft size={20} /></button>
            <div className="flex gap-1.5">{TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full ${i===current?"bg-slate-900":"bg-slate-200"}`} />)}</div>
            <button onClick={next} className="p-2 rounded-full bg-slate-100 text-slate-500"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Pricing ====================
function PricingSection() {
  const router = useRouter();
  return (
    <section id="pricing" className="py-20 md:py-28 bg-slate-50/60 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">Simple, Transparent Pricing</h2>
          <p className="text-slate-500">Start free. Upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Free */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-xl text-slate-900 mb-1">Free</h3>
            <p className="text-slate-500 text-sm mb-4">Get started with QR codes</p>
            <div className="font-bold text-3xl text-slate-900 mb-1">$0</div>
            <p className="text-xs text-slate-400 mb-6">15-day free trial, no credit card</p>
            <Link href="/register" className="block w-full text-center py-2.5 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg text-sm hover:bg-slate-900 hover:text-white transition-colors">Start Free Trial</Link>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {["QR code generation","Google Review link","Basic dashboard","Up to 50 patients","Email support"].map(item => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-teal-600 shrink-0" />{item}</li>)}
            </ul>
          </div>
          {/* Pro */}
          <div className="bg-white rounded-2xl p-8 border-2 border-teal-600 scale-105 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
            <h3 className="font-bold text-xl text-slate-900 mb-1">Pro</h3>
            <p className="text-slate-500 text-sm mb-4">Automate your reputation</p>
            <div className="font-bold text-3xl text-slate-900 mb-1">$39<span className="text-lg text-slate-400">/mo</span></div>
            <p className="text-xs text-slate-400 mb-6">1st month free, cancel anytime</p>
            <button onClick={() => router.push("/dashboard/support")} className="block w-full text-center py-2.5 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 transition-colors">Get 1st Month Free</button>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {["Everything in Free","Automated email follow-ups","Real-time negative review alerts","1,000 patients / month","3 competitor tracking","30-day historical data","1 team member","Priority email support"].map(item => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-teal-600 shrink-0" />{item}</li>)}
            </ul>
          </div>
          {/* Agency */}
          <div className="bg-white rounded-2xl p-8 border-2 border-amber-400 shadow-sm relative">
            <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={12} />Agency Only</div>
            <h3 className="font-bold text-xl text-slate-900 mb-1">Agency</h3>
            <p className="text-slate-500 text-sm mb-4">Manage multiple clinics</p>
            <div className="font-bold text-3xl text-slate-900 mb-1">$69<span className="text-lg text-slate-400">/mo</span></div>
            <p className="text-xs text-slate-400 mb-6">1st month free, cancel anytime</p>
            <button onClick={() => router.push("/dashboard/support")} className="block w-full text-center py-2.5 bg-amber-500 text-white font-semibold rounded-lg text-sm hover:bg-amber-600 transition-colors">Get 1st Month Free</button>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {["Everything in Pro","Multi-clinic dashboard","White-label branding","API access","10,000 patients / month","20 competitor tracking","5 team members"].map(item => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-teal-600 shrink-0" />{item}</li>)}
              <li className="flex items-start gap-2"><Zap size={14} className="text-amber-500 mt-0.5" /><span><span className="font-semibold">Daily Reputation Digest</span><span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Agency</span></span></li>
              <li className="flex items-start gap-2"><Headphones size={14} className="text-amber-500 mt-0.5" /><span><span className="font-semibold">1-on-1 Dedicated Support</span><span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Agency</span></span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ ====================
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 md:py-28 bg-white scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-bold text-3xl md:text-4xl text-slate-900 text-center tracking-tight mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open===i?null:i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-semibold text-slate-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open===i?"rotate-180":""}`} />
              </button>
              {open===i && <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== CTA ====================
function CTASection() {
  const router = useRouter();
  return (
    <section className="py-20 md:py-28 bg-teal-600 text-white text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-4">Ready to Grow Your Reviews?</h2>
        <p className="text-teal-100/80 mb-8 leading-relaxed text-lg">Join 500+ dental offices using ReviewFlow. Start free, no credit card required.</p>
        <button onClick={() => router.push("/register")}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-bold rounded-lg text-base hover:bg-teal-50 transition-colors shadow-lg">
          Start Free <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

// ==================== Footer ====================
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white"><Activity size={16} /></span>
            <span className="font-bold text-xl text-slate-900">ReviewFlow</span>
          </Link>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} ReviewFlow. Built for Dental Offices.</div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-slate-600 transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-slate-600 transition-colors">Sign Up</Link>
            <Link href="/free-audit" className="hover:text-slate-600 transition-colors">Free Audit</Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== Main ====================
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
