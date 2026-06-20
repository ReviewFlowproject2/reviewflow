"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, BarChart3, Check, ArrowRight, Mail, Bell, QrCode, Quote,
  TrendingUp, Clock, ChevronDown, ChevronLeft, ChevronRight,
  Zap, Users, Headphones, Shield, Activity, Sparkles,
} from "lucide-react";

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

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < 120;

        ctx.beginPath();
        ctx.arc(p.x, p.y, isNear ? p.r * 2 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? "rgba(16,185,129,0.6)" : "rgba(71,85,105,0.4)";
        ctx.fill();
      });

      // Lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(71,85,105,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.35 }} />;
}

// ==================== Counter ====================
function Counter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / (duration * 1000));
            setVal(Math.round(p * target));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ==================== Feature Bar ====================
const FEATURES = [
  { icon: "🦷", label: "Built for Dental Practices" },
  { icon: "⭐", label: "Google & Yelp Monitoring" },
  { icon: "🔔", label: "Real-time Alerts" },
  { icon: "📊", label: "Competitor Analysis" },
  { icon: "🛡️", label: "HIPAA Compliant" },
];

function FeatureBar() {
  return (
    <div className="bg-slate-800/50 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-none whitespace-nowrap">
        {FEATURES.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5 text-xs font-medium text-slate-300 shrink-0">
            <span className="text-sm">{f.icon}</span>
            <span className="hidden sm:inline">{f.label}</span>
            <span className="sm:hidden">{f.label.split(" ").slice(-2).join(" ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== FAQ ====================
const FAQS = [
  { q: "Will my patients feel annoyed by the email?", a: "ReviewFlow only sends one polite follow-up email to patients who visited that day, with a clear opt-out option. This is standard patient care follow-up, not bulk marketing." },
  { q: "Do I need a credit card to start?", a: "No credit card required. You get full access for 15 days. We only ask for payment details when you decide to continue." },
  { q: "Is my patient data secure?", a: "All data is stored on HIPAA-compliant cloud infrastructure with end-to-end encryption. We never sell or share your patient information." },
  { q: "What happens when a negative review comes in?", a: "You get an alert via email within 15 minutes, along with a suggested reply template." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel directly from Settings with one click. Your data is retained for 30 days." },
];

// ==================== Testimonials ====================
const TESTIMONIALS = [
  { name: "Dr. Sarah Mitchell", clinic: "Smile Bright Dental", location: "Houston, TX", before: 2.8, after: 4.6, count: 87, timeframe: "3 months", quote: "Before ReviewFlow, we had 12 reviews and a 2.8 rating. After 3 months, we're at 4.6 stars with 87 reviews. The negative review alerts alone saved us from two 1-star disasters." },
  { name: "Dr. James Chen", clinic: "Parkside Family Dentistry", location: "Austin, TX", before: 3.2, after: 4.8, count: 156, timeframe: "5 months", quote: "The QR code at our front desk is genius. Patients scan it while checking out — we went from begging for reviews to getting 8-10 per week automatically." },
  { name: "Dr. Maria Rodriguez", clinic: "Sunshine Dental Care", location: "Miami, FL", before: 3.5, after: 4.7, count: 203, timeframe: "4 months", quote: "We manage 3 locations. The multi-clinic dashboard lets me see all reviews in one place. I caught a billing complaint at our Miami office within 10 minutes." },
];

// ==================== Hero ====================
function HeroSection() {
  const router = useRouter();
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mockupRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateX(0)";
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen bg-slate-900 pt-4 pb-20 md:pb-28 overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        poster="/videos/hero-poster.jpg"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-slate-900/60" />
      <ParticleCanvas />
      {/* Green glow orb top-right */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="flex size-2 rounded-full bg-emerald-400" />
              Free Practice Reputation Report
            </div>
            <h1 className="mt-5 text-pretty text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Turn Happy Patients Into{" "}
              <span className="text-emerald-400">5-Star Reviews</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Stop manually asking for reviews. ReviewFlow automates your Google Review management with QR codes and email follow-ups — built specifically for dental practices.
            </p>
            {/* 3 value props */}
            <ul className="mt-7 space-y-3">
              {[
                "Identify hidden negative review patterns",
                "Benchmark against local competitors",
                "Uncover revenue lost to low ratings",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"><Check size={12} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push("/register")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 hover:scale-[1.02]">
                Generate My Free Audit Report <ArrowRight size={16} />
              </button>
              <Link href="/free-audit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                See a Sample Audit Report
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 border-t border-slate-800 pt-5">
              <div className="flex -space-x-2">
                {["bg-emerald-500","bg-blue-500","bg-amber-500","bg-purple-500"].map((c,i)=>(
                  <span key={i} className={`size-8 rounded-full border-2 border-slate-900 ${c}`} />
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white"><Counter target={500} suffix="+" /> clinics</span> use ReviewFlow
              </p>
            </div>
          </div>

          {/* RIGHT — Dashboard mockup with slide-in */}
          <div ref={mockupRef} className="opacity-0 translate-x-[50px] transition-all duration-700 ease-out">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[28px] opacity-60 blur-2xl pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 70%)" }} />
              <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="bg-slate-950 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" /></div>
                  <span className="text-xs text-slate-500 ml-3">ReviewFlow Dashboard</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {[{v:"156",l:"Reviews",c:"text-emerald-400"},{v:"4.8",l:"Rating",c:"text-amber-400"},{v:"0",l:"Negative",c:"text-red-400"},{v:"94%",l:"Success",c:"text-blue-400"}].map((s,i)=>(
                      <div key={i} className="bg-white/5 rounded-xl p-3 text-center"><div className={`text-lg font-bold ${s.c}`}>{s.v}</div><div className="text-[10px] text-slate-500">{s.l}</div></div>
                    ))}
                  </div>
                  <div className="h-24 bg-white/5 rounded-xl flex items-end gap-3 px-4 py-3">
                    {[60,80,45,90,70,85,95].map((h,i)=><div key={i} className="flex-1 bg-emerald-500/30 rounded-t" style={{height:`${h}%`}}/>)}
                  </div>
                </div>
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
    { icon: QrCode, title: "Place QR Code", desc: "Patient scans at checkout — goes straight to Google Reviews.", color: "bg-emerald-500/10 text-emerald-400" },
    { icon: Mail, title: "Auto Email", desc: "System sends a HIPAA-compliant follow-up email the same day.", color: "bg-blue-500/10 text-blue-400" },
    { icon: Star, title: "Leave Review", desc: "Patient rates your practice on Google. One tap.", color: "bg-amber-500/10 text-amber-400" },
    { icon: Bell, title: "Get Alert", desc: "Negative review? You know in 15 minutes — with a reply template.", color: "bg-red-500/10 text-red-400" },
  ];
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl md:text-4xl text-white tracking-tight mb-4">How ReviewFlow Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">From patient checkout to review reply — fully automated in 4 steps.</p>
        </div>
        <div className="hidden md:flex items-start justify-between gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center relative">
              <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4`}><step.icon size={22} /></div>
              <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 max-w-[200px]">{step.desc}</p>
              {i < steps.length - 1 && <div className="absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)]"><div className="h-px bg-slate-700 relative"><div className="absolute right-0 -top-[3px] w-2 h-2 border-t-2 border-r-2 border-slate-600 rotate-45" /></div></div>}
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-8">
          {steps.map((step,i)=>(<div key={i} className="flex items-start gap-4"><div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center shrink-0`}><step.icon size={20}/></div><div><p className="text-xs font-bold text-slate-500 mb-1">Step {i+1}</p><h3 className="font-bold text-lg text-white">{step.title}</h3><p className="text-sm text-slate-400">{step.desc}</p></div></div>))}
        </div>
      </div>
    </section>
  );
}

// ==================== Features ====================
function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-950 border-t border-slate-800 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl md:text-4xl text-white tracking-tight mb-4">All-in-One Review Toolkit</h2>
          <p className="text-slate-400 max-w-xl mx-auto">QR codes, email follow-ups, negative review alerts — the full reputation cycle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: QrCode, title: "QR Code Generator", desc: "Create branded QR codes. Download and print for your front desk." },
            { icon: Bell, title: "Real-Time Alerts", desc: "Get notified within 15 minutes. Suggested reply templates included." },
            { icon: BarChart3, title: "Competitor Tracking", desc: "Monitor nearby dental offices' ratings and review trends." },
          ].map((f,i)=>(
            <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5"><f.icon size={22}/></div>
              <h3 className="font-bold text-lg text-white mb-3">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Testimonials ====================
function TestimonialsSection() {
  const [cur,setCur]=useState(0);const t=TESTIMONIALS[cur];
  const next=()=>setCur(p=>(p+1)%TESTIMONIALS.length);
  const prev=()=>setCur(p=>(p-1+TESTIMONIALS.length)%TESTIMONIALS.length);
  return (
    <section className="py-20 md:py-28 bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12"><h2 className="font-bold text-3xl md:text-4xl text-white tracking-tight mb-3">Trusted by Dental Offices Nationwide</h2><p className="text-slate-400">Real results from real clinics.</p></div>
        <div className="hidden md:grid grid-cols-3 gap-6">
          {TESTIMONIALS.map((item,i)=>(
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
              <Quote size={18} className="text-emerald-500/30 mb-3"/>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">{item.name.split(" ").map(w=>w[0]).join("")}</div>
                <div><p className="text-sm font-semibold text-white">{item.name}</p><p className="text-xs text-slate-500">{item.clinic}, {item.location}</p></div>
              </div>
              <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-emerald-500/10 rounded-xl">
                <span className="text-xs text-slate-400">Before</span><span className="font-bold text-sm text-slate-300">{item.before}</span>
                <TrendingUp size={14} className="text-emerald-400"/>
                <span className="font-bold text-sm text-emerald-400">{item.after}</span>
                <span className="text-xs text-slate-500 ml-auto">{item.count} reviews</span>
              </div>
            </div>
          ))}
        </div>
        <div className="md:hidden">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <Quote size={18} className="text-emerald-500/30 mb-3"/>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10"><div className="w-9 h-9 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">{t.name.split(" ").map(w=>w[0]).join("")}</div><div><p className="text-sm font-semibold text-white">{t.name}</p><p className="text-xs text-slate-500">{t.clinic}, {t.location}</p></div></div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={prev} className="p-2 rounded-full bg-white/5 text-slate-400"><ChevronLeft size={20}/></button>
            <div className="flex gap-1.5">{TESTIMONIALS.map((_,i)=><button key={i} onClick={()=>setCur(i)} className={`w-2 h-2 rounded-full ${i===cur?"bg-emerald-400":"bg-slate-700"}`}/>)}</div>
            <button onClick={next} className="p-2 rounded-full bg-white/5 text-slate-400"><ChevronRight size={20}/></button>
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
    <section id="pricing" className="py-20 md:py-28 bg-slate-950 border-t border-slate-800 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12"><h2 className="font-bold text-3xl md:text-4xl text-white tracking-tight mb-3">Simple, Transparent Pricing</h2><p className="text-slate-400">Start free. Upgrade when you&apos;re ready.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {[{t:"Free",d:"Get started with QR codes",price:"$0",desc:"15-day trial, no card",items:["QR codes","Google link","Basic dashboard","50 patients","Email support"],color:"border-white/10",btn:"Start Free Trial",link:"/register"},
            {t:"Pro",d:"Automate your reputation",price:"$39",period:"/mo",desc:"1st month free",items:["Everything in Free","Email follow-ups","Real-time alerts","1,000 patients/mo","3 competitors","30-day history","1 team member","Priority support"],color:"border-emerald-500/30",popular:true,btn:"Get 1st Month Free",link:"/dashboard/support"},
            {t:"Agency",d:"Manage multiple clinics",price:"$69",period:"/mo",desc:"1st month free",items:["Everything in Pro","Multi-clinic dashboard","White-label","API access","10,000 patients/mo","20 competitors","Unlimited history","5 team members"],color:"border-amber-400/30",agency:true,btn:"Get 1st Month Free",link:"/dashboard/support"}].map((p,i)=>(
            <div key={i} className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border p-8 ${p.color} ${p.popular?"scale-105 shadow-xl shadow-emerald-500/10":""}`}>
              {p.popular&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>}
              {p.agency&&<div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Zap size={12}/>Agency Only</div>}
              <h3 className="font-bold text-xl text-white mb-1">{p.t}</h3><p className="text-slate-400 text-sm mb-4">{p.d}</p>
              <div className="font-bold text-3xl text-white mb-1">{p.price}<span className="text-lg text-slate-500">{p.period||""}</span></div><p className="text-xs text-slate-500 mb-6">{p.desc}</p>
              {i===0?<Link href="/register" className="block w-full text-center py-2.5 border-2 border-white/20 text-white font-semibold rounded-full text-sm hover:bg-white/10 transition-colors">{p.btn}</Link>:
              <button onClick={()=>router.push(p.link||"")} className={`block w-full text-center py-2.5 font-semibold rounded-full text-sm transition-colors ${p.agency?"bg-amber-500 text-white hover:bg-amber-600":"bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"}`}>{p.btn}</button>}
              <ul className="mt-6 space-y-3 text-sm text-slate-400">{p.items.map((it,j)=><li key={j} className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0"/>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ ====================
function FAQSection() {
  const [o,setO]=useState<number|null>(0);
  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-900 border-t border-slate-800 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6"><h2 className="font-bold text-3xl md:text-4xl text-white text-center tracking-tight mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">{FAQS.map((faq,i)=>(<div key={i} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"><button onClick={()=>setO(o===i?null:i)} className="w-full flex items-center justify-between p-5 text-left"><span className="font-semibold text-white text-sm pr-4">{faq.q}</span><ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${o===i?"rotate-180":""}`}/></button>{o===i&&<div className="px-5 pb-5 text-sm text-slate-400">{faq.a}</div>}</div>))}</div>
      </div>
    </section>
  );
}

// ==================== CTA ====================
function CTASection() {
  const router = useRouter();
  return (
    <section className="py-20 md:py-28 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{background:"radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)"}}/>
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">Get your free audit</h2>
        <p className="text-slate-400 mb-8 text-lg">Join 500+ dental offices. Free report, no strings attached.</p>
        <button onClick={()=>router.push("/register")} className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-full text-base hover:bg-emerald-400 hover:scale-[1.03] transition-all shadow-xl shadow-emerald-500/30">Start Free <ArrowRight size={18}/></button>
      </div>
    </section>
  );
}

// ==================== Footer ====================
function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white"><Activity size={16}/></span><span className="font-bold text-xl text-white">ReviewFlow</span></Link>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} ReviewFlow. Built for Dental Offices.</div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/free-audit" className="hover:text-white transition-colors">Free Audit</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== Main ====================
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <FeatureBar />
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
