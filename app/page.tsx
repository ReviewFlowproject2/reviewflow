"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, BarChart3, Check, ArrowRight, Mail, Bell, QrCode, Quote,
  TrendingUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Activity,
} from "lucide-react";

// ==================== Scroll Hook for Navbar ====================
function useNavbarStyle() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight - 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return solid;
}

// ==================== Particle Canvas ====================
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const N = 40;

    const resize = () => {
      canvas.width = canvas.parentElement!.offsetWidth;
      canvas.height = canvas.parentElement!.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < N; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5 });

    const onMouse = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const dx = mouseRef.current.x - p.x, dy = mouseRef.current.y - p.y;
        const isNear = Math.sqrt(dx * dx + dy * dy) < 120;
        ctx.beginPath(); ctx.arc(p.x, p.y, isNear ? p.r * 2 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? "rgba(16,185,129,0.6)" : "rgba(71,85,105,0.4)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(71,85,105,${0.15 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); canvas.removeEventListener("mousemove", onMouse); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.25 }} />;
}

// ==================== Data ====================
const FAQS = [
  { q: "Will my patients feel annoyed by the email?", a: "ReviewFlow only sends one polite follow-up email to patients who visited that day, with a clear opt-out option." },
  { q: "Do I need a credit card to start?", a: "No credit card required. You get full access for 15 days." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel directly from Settings with one click. Your data is retained for 30 days." },
];

const TESTIMONIALS = [
  { name: "Dr. Sarah Mitchell", clinic: "Smile Bright Dental", location: "Houston, TX", before: 2.8, after: 4.6, count: 87, quote: "Before ReviewFlow, we had 12 reviews and a 2.8 rating. After 3 months, we're at 4.6 stars with 87 reviews." },
  { name: "Dr. James Chen", clinic: "Parkside Family Dentistry", location: "Austin, TX", before: 3.2, after: 4.8, count: 156, quote: "The QR code at our front desk is genius. We went from begging for reviews to getting 8-10 per week automatically." },
  { name: "Dr. Maria Rodriguez", clinic: "Sunshine Dental Care", location: "Miami, FL", before: 3.5, after: 4.7, count: 203, quote: "The multi-clinic dashboard lets me see all reviews in one place. I caught a billing complaint within 10 minutes." },
];

// ==================== Video Hero ====================
function VideoHero() {
  const solid = useNavbarStyle();

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* Background video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Ultra-subtle overlay */}
      <div className="absolute inset-0 bg-slate-900/10" />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${solid ? "bg-slate-900/80 backdrop-blur-md border-b border-slate-800" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Star size={16} className="text-white" fill="white" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight drop-shadow-lg">ReviewFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" onClick={e=>{e.preventDefault();document.getElementById("features")?.scrollIntoView({behavior:"smooth"});}} className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow">Features</a>
            <a href="#pricing" onClick={e=>{e.preventDefault();document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"});}} className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow">Pricing</a>
            <Link href="/free-audit" className="text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors drop-shadow">Free Audit</Link>
            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow">Log In</Link>
            <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60">
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
        <svg className="animate-bounce w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </section>
  );
}

// ==================== Tagline Section ====================
function TaglineSection() {
  const router = useRouter();
  return (
    <section className="bg-slate-900 py-24 md:py-32 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-6">// ReviewFlow, Built for Dental Practices</p>
        <h1 className="text-pretty text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.08] tracking-tight text-white mb-6">Turn Happy Patients Into <span className="text-emerald-400">5-Star Reviews</span></h1>
        <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">Stop manually asking for reviews. ReviewFlow automates your Google &amp; Yelp review management with QR codes, email follow-ups, and competitor benchmarking.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button onClick={() => router.push("/free-audit")} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:scale-[1.02] transition-all">Generate My Free Audit Report <ArrowRight size={16} /></button>
          <button onClick={() => document.getElementById("dashboard-preview")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-8 font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">See a Sample Audit Report</button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm text-slate-400">
          {[{ icon: Check, label: "500+ Dental Practices" }, { icon: Check, label: "HIPAA Compliant" }, { icon: Check, label: "15-Day Free Trial" }].map((t, i) => (
            <div key={i} className="flex items-center gap-2"><t.icon size={16} className="text-emerald-400" />{t.label}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== How It Works ====================
function HowItWorksSection() {
  return (
    <section id="features" className="py-24 md:py-32 bg-slate-800 border-t border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// How It Works</p>
          <h2 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-4">From Checkout to 5-Star Review — Automated</h2>
          <p className="text-slate-400">Four simple steps. Zero extra work for your staff.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", emoji: "📱", title: "Place QR Code", desc: "Patient scans at checkout — goes straight to your Google Review page.", c: "border-emerald-500/30 bg-emerald-500/5" },
            { step: "02", emoji: "✉️", title: "Auto Email", desc: "System sends a polite, HIPAA-compliant follow-up email the same day.", c: "border-blue-500/30 bg-blue-500/5" },
            { step: "03", emoji: "⭐", title: "Leave Review", desc: "Patient rates your practice. One tap, frictionless experience.", c: "border-amber-500/30 bg-amber-500/5" },
            { step: "04", emoji: "🔔", title: "Get Alert", desc: "Negative review? You know within 15 minutes — with a reply template.", c: "border-red-500/30 bg-red-500/5" },
          ].map((s) => (
            <div key={s.step} className={`rounded-2xl border ${s.c} p-6 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300`}>
              <span className="text-3xl">{s.emoji}</span>
              <span className="block text-[10px] font-bold text-slate-500 mt-3 mb-2">STEP {s.step}</span>
              <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Features ====================
function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// What You Get</p>
          <h2 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-4">All-in-One Reputation Toolkit</h2>
          <p className="text-slate-400">Everything you need to monitor, manage, and grow your online reviews.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: "💬", title: "Review Sentiment Analysis", desc: "AI-powered breakdown of every review — positive, neutral, or negative — so you know exactly what patients think." },
            { emoji: "📊", title: "Competitor Benchmarking", desc: "Side-by-side comparison against 3 local competitors on ratings, volume, and response time." },
            { emoji: "🛡️", title: "Response Rate Score", desc: "See how quickly you reply compared to competitors. Fast responses win back unhappy patients." },
          ].map((c, i) => (
            <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl">{c.emoji}</span>
              <h3 className="font-bold text-lg text-white mt-4 mb-3">{c.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Dashboard Mockup ====================
function DashboardMockupSection() {
  return (
    <section id="dashboard-preview" className="py-24 md:py-32 bg-slate-800 border-t border-slate-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// Your Dashboard</p>
        <h2 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-4">Everything in one place</h2>
        <p className="text-slate-400 mb-12">Real data, clear charts, actionable recommendations.</p>
        <div className="relative inline-block w-full max-w-4xl">
          <div className="absolute -inset-4 rounded-[28px] opacity-50 blur-2xl pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 70%)" }} />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden text-left">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
              <span className="text-xs text-slate-500 ml-3">ReviewFlow Dashboard</span>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-4 gap-3">
                {[{ v: "156", l: "Reviews", c: "text-emerald-400" }, { v: "4.8", l: "Avg Rating", c: "text-amber-400" }, { v: "0", l: "Negative", c: "text-red-400" }, { v: "94%", l: "Email Success", c: "text-blue-400" }].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 text-center"><div className={`text-xl font-bold ${s.c}`}>{s.v}</div><div className="text-[10px] text-slate-500 mt-1">{s.l}</div></div>
                ))}
              </div>
              <div className="h-32 bg-white/5 rounded-xl flex items-end gap-3 px-4 py-3">
                {[60, 80, 45, 90, 70, 85, 95].map((h, i) => <div key={i} className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${h}%` }} />)}
              </div>
              <div className="space-y-2">
                {[
                  { a: "Sarah M.", r: 5, s: "Positive", sc: "text-emerald-400 bg-emerald-500/10", t: "Best experience ever! Staff was incredibly friendly." },
                  { a: "James T.", r: 2, s: "Negative", sc: "text-red-400 bg-red-500/10", t: "45 min wait past appointment. Cleaning felt rushed." },
                  { a: "Linda W.", r: 5, s: "Positive", sc: "text-emerald-400 bg-emerald-500/10", t: "Dr. Chen explained clearly. Painless procedure!" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.03]">
                    <span className="text-xs font-semibold text-slate-300 w-16 shrink-0">{r.a}</span>
                    <span className="text-xs text-amber-400 shrink-0">{"★".repeat(r.r)}{"☆".repeat(5 - r.r)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${r.sc}`}>{r.s.toUpperCase()}</span>
                    <span className="text-xs text-slate-500 truncate">{r.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Testimonials ====================
function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// Testimonials</p>
          <h2 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight">Trusted by Dental Practices Nationwide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex gap-0.5 mb-4 text-emerald-400">{"★".repeat(5)}</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="size-9 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">{t.name.split(" ").map(w => w[0]).join("")}</div>
                <div><p className="text-sm font-semibold text-white">{t.name}</p><p className="text-xs text-slate-500">{t.clinic}, {t.location}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Pricing ====================
function PricingSection() {
  const router = useRouter();
  return (
    <section id="pricing" className="py-24 md:py-32 bg-slate-800 border-t border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// Pricing</p>
          <h2 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400">Start free. Upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
          {[
            { t: "Free", price: "$0", items: ["QR Code Generator", "Google Review link", "Basic dashboard", "Up to 50 patients", "Email support"], btn: "Start Free Trial", link: "/register", border: "border-white/10" },
            { t: "Pro", price: "$39", period: "/mo", items: ["Everything in Free", "Automated email follow-ups", "Real-time alerts", "1,000 patients/mo", "3 competitor tracking", "30-day history", "Priority support"], btn: "Start Free Trial", link: "/register", border: "border-emerald-500/30", popular: true },
            { t: "Agency", price: "$69", period: "/mo", items: ["Everything in Pro", "Multi-clinic dashboard", "White-label", "API access", "10,000 patients/mo", "20 competitors", "5 team members"], btn: "Contact Sales", link: "mailto:sales@reviewflowdental.com", border: "border-amber-400/30", agency: true },
          ].map((p, i) => (
            <div key={i} className={`relative rounded-2xl border ${p.border} bg-white/5 backdrop-blur-sm p-8 ${p.popular ? "scale-105 shadow-xl shadow-emerald-500/10" : ""}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>}
              {p.agency && <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={12} />Agency</div>}
              <h3 className="font-bold text-xl text-white mb-1">{p.t}</h3>
              <div className="font-bold text-3xl text-white mb-1">{p.price}<span className="text-lg text-slate-500">{p.period || ""}</span></div>
              <p className="text-xs text-slate-500 mb-6">1st month free, cancel anytime</p>
              {i === 0 ? <Link href={p.link} className="block w-full text-center py-2.5 border-2 border-white/20 text-white font-semibold rounded-full text-sm hover:bg-white/10 transition-colors">{p.btn}</Link>
                : <button onClick={() => router.push(p.link)} className={`block w-full text-center py-2.5 font-semibold rounded-full text-sm transition-colors ${p.agency ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"}`}>{p.btn}</button>}
              <ul className="mt-6 space-y-3 text-sm text-slate-400">{p.items.map((it, j) => <li key={j} className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" />{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ ====================
function FAQSection() {
  const [o, setO] = useState<number | null>(0);
  return (
    <section className="py-24 md:py-32 bg-slate-900 border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// FAQ</p><h2 className="font-extrabold text-3xl md:text-4xl text-white tracking-tight">Frequently Asked Questions</h2></div>
        <div className="space-y-4">{FAQS.map((faq, i) => (
          <div key={i} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            <button onClick={() => setO(o === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left"><span className="font-semibold text-white text-sm pr-4">{faq.q}</span><ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${o === i ? "rotate-180" : ""}`} /></button>
            {o === i && <div className="px-5 pb-5 text-sm text-slate-400">{faq.a}</div>}
          </div>
        ))}</div>
      </div>
    </section>
  );
}

// ==================== Bottom CTA ====================
function CTASection() {
  const router = useRouter();
  return (
    <section className="py-24 md:py-32 bg-slate-800 border-t border-slate-700 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 mb-4">// Get Started</p>
        <h2 className="font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-4">Ready to see how you compare?</h2>
        <p className="text-slate-400 text-lg mb-10">Get your free competitive audit. No calls, no demos, no credit card.</p>
        <button onClick={() => router.push("/free-audit")} className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-full text-base hover:bg-emerald-400 hover:scale-[1.03] transition-all shadow-xl shadow-emerald-500/30">Get your free audit <ArrowRight size={18} /></button>
      </div>
    </section>
  );
}

// ==================== Footer ====================
function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6"><div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2"><div className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Activity size={16} /></div><span className="font-bold text-xl text-white">ReviewFlow</span></Link>
        <div className="text-sm text-slate-500">© {new Date().getFullYear()} ReviewFlow. Built for Dental Offices.</div>
        <div className="flex gap-6 text-sm text-slate-400"><Link href="/login" className="hover:text-white">Log In</Link><Link href="/register" className="hover:text-white">Sign Up</Link><Link href="/free-audit" className="hover:text-white">Free Audit</Link></div>
      </div></div>
    </footer>
  );
}

// ==================== Main ====================
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <VideoHero />
      <TaglineSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DashboardMockupSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
