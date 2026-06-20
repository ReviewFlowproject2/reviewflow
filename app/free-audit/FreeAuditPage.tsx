"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Search,
  Mail,
  ArrowRight,
  Check,
  AlertTriangle,
  MapPin,
  Star,
  Quote,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Globe,
  User,
  ChevronRight,
  Shield,
} from "lucide-react";

// ==================== Types ====================

interface PlacePrediction {
  place_id: string;
  name: string;
  address: string;
  full: string;
}

// ==================== Constants ====================

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Owner, Smile Dental Studio — Austin, TX",
    quote:
      "The free audit showed us we had 3 unanswered negative reviews. We signed up the same day and went from 3.8 to 4.7 in 2 months.",
    stars: 5,
  },
  {
    name: "Dr. Robert Kim",
    role: "Owner, Westlake Family Dental — Denver, CO",
    quote:
      "I thought we were doing fine until the audit revealed competitors were responding 3x faster. Signed up that afternoon.",
    stars: 5,
  },
  {
    name: "Dr. Lisa Park",
    role: "Owner, Pearl Dental Group — Phoenix, AZ",
    quote:
      "The competitor comparison alone was worth it. We changed our review response strategy and hit page one on Google in 6 weeks.",
    stars: 5,
  },
];

// ==================== Grid Background Texture ====================

function GridTexture() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Larger nodes at intersections */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, white 2px, transparent 0)",
          backgroundSize: "128px 128px",
          backgroundPosition: "16px 16px",
        }}
      />
    </div>
  );
}

// ==================== Navbar ====================

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Star size={14} className="text-white" fill="white" />
          </div>
          <span className="font-[Inter] font-bold text-lg text-white tracking-tight">
            ReviewFlow
          </span>
        </Link>

        {/* Right CTA */}
        <Link
          href="/register"
          className="px-5 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-full
                     hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Sign up now
        </Link>
      </div>
    </nav>
  );
}

// ==================== Hero Section (2-col: text left, floating card right) ====================

function HeroSection() {
  const [clinicName, setClinicName] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [email, setEmail] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/audit/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.predictions) {
        setPredictions(data.predictions);
        setShowDropdown(data.predictions.length > 0);
        setHighlightIdx(-1);
      }
    } catch (_) {}
  }, []);

  const handleClinicInput = (value: string) => {
    setClinicName(value);
    setSelectedPlaceId("");
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => fetchPredictions(value), 300));
  };

  const selectPrediction = (p: PlacePrediction) => {
    setClinicName(p.name);
    setSelectedPlaceId(p.place_id);
    setShowDropdown(false);
    setPredictions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, predictions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      selectPrediction(predictions[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!clinicName.trim()) {
      setError("Please enter your clinic name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName: clinicName.trim(),
          email: email.trim(),
          placeId: selectedPlaceId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSubmitted(true);
      }
    } catch (_) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-slate-900 pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Grid texture */}
      <GridTexture />

      {/* Optional: subtle green glow orb top-right */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {submitted ? (
          /* ---- Success State ---- */
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/40">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h1 className="font-[Inter] font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-4">
              Report incoming — check your inbox
            </h1>
            <p className="text-slate-400 text-lg mb-2">
              We&apos;re analyzing <span className="text-white font-semibold">{clinicName}</span>.
            </p>
            <p className="text-slate-400 mb-8">
              Your audit arrives at{" "}
              <span className="text-white font-semibold">{email}</span> within 2 minutes.
            </p>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6 text-left max-w-sm mx-auto">
              <p className="text-sm font-semibold text-slate-300 mb-3">Your report includes:</p>
              {[
                "Rating comparison vs. 3 local competitors",
                "Recent review sentiment analysis",
                "Unanswered negative review alerts",
                "Competitor response time benchmarks",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                  <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ---- Hero: 2-col ---- */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT — Text */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="font-[Inter] font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-tight text-white mb-6"
              >
                See How Your Clinic Compares
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg"
              >
                Free Review Audit — Get a personalized report comparing your
                Google &amp; Yelp reviews against local competitors. No credit
                card required.
              </motion.p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  Takes 45 seconds
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  Instant delivery
                </div>
              </div>
            </div>

            {/* RIGHT — Floating form card with green glow */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Green glow behind card */}
              <div
                className="absolute -inset-1 rounded-[28px] opacity-70 blur-xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(16,185,129,0.25) 0%, transparent 70%)",
                }}
              />

              <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8 border border-slate-200/60">
                <h2 className="font-[Inter] font-bold text-xl text-slate-900 mb-6 tracking-tight">
                  Get My Free Audit
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Clinic Name */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Clinic Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={clinicName}
                        onChange={(e) => handleClinicInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                        placeholder="e.g. Sunnyvale Dental Care"
                        autoComplete="off"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900
                                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                                   focus:border-emerald-500 transition-shadow"
                      />
                    </div>
                    {/* Autocomplete dropdown */}
                    {showDropdown && predictions.length > 0 && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl
                                   overflow-hidden max-h-56 overflow-y-auto"
                      >
                        {predictions.map((p, i) => (
                          <button
                            key={p.place_id}
                            type="button"
                            onClick={() => selectPrediction(p)}
                            onMouseEnter={() => setHighlightIdx(i)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                              i === highlightIdx ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                          >
                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-xs text-slate-500 truncate">{p.address}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@clinic.com"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900
                                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                                   focus:border-emerald-500 transition-shadow"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-4 py-3 rounded-lg">
                      <AlertTriangle size={14} />
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl text-sm
                               hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2 transition-colors
                               shadow-lg shadow-emerald-500/25"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        Get My Free Audit
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    No credit card required. Takes 45 seconds.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== Dashboard Preview Section ====================

function DashboardPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-[Inter] font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">
            This is what your audit report looks like
          </h2>
          <p className="text-slate-500 text-lg">
            Actionable insights, delivered to your inbox in minutes.
          </p>
        </div>

        {/* Dashboard mockup with green glow */}
        <div className="relative">
          {/* Green glow aura */}
          <div
            className="absolute -inset-4 rounded-[28px] opacity-60 blur-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(16,185,129,0.3) 0%, transparent 70%)",
            }}
          />

          {/* Mockup card */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Mock header bar */}
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs text-slate-400 ml-3 font-mono">ReviewFlow — Audit Report</span>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Report title */}
              <div>
                <p className="font-[Inter] font-bold text-lg text-slate-900">Sunnyvale Dental Care</p>
                <p className="text-sm text-slate-500">vs. 3 Local Competitors — Austin, TX</p>
              </div>

              {/* Rating bars */}
              <div>
                <h4 className="font-[Inter] font-bold text-xs text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 size={14} className="text-emerald-500" />
                  Google Rating Comparison
                </h4>
                {[
                  { name: "Pearl Dental Care", rating: 4.7, color: "bg-emerald-500" },
                  { name: "Bright Smile Dentistry", rating: 4.4, color: "bg-blue-400" },
                  { name: "Family Dental Center", rating: 4.2, color: "bg-blue-400" },
                  { name: "Your Clinic", rating: 3.8, color: "bg-amber-400", highlight: true },
                ].map((item, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-sm ${item.highlight ? "font-bold text-slate-900" : "text-slate-700"}`}
                      >
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-slate-800">⭐ {item.rating}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${(item.rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sentiment rows */}
              <div>
                <h4 className="font-[Inter] font-bold text-xs text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare size={14} className="text-emerald-500" />
                  Recent Review Sentiment
                </h4>
                <div className="space-y-1">
                  {[
                    { author: "Sarah M.", text: "Best experience ever! Staff was incredibly friendly.", s: "positive", rating: 5 },
                    { author: "James T.", text: "45 min wait past appointment. Cleaning felt rushed.", s: "negative", rating: 2 },
                    { author: "Maria L.", text: "Billing errors — still trying to resolve a charge.", s: "negative", rating: 1 },
                    { author: "David K.", text: "Good cleaning. Front desk needs organization.", s: "neutral", rating: 4 },
                    { author: "Linda W.", text: "Dr. Chen explained clearly. Painless procedure!", s: "positive", rating: 5 },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-slate-50">
                      <span className="text-xs font-semibold text-slate-700 w-16 shrink-0">{r.author}</span>
                      <span className="text-xs shrink-0">{"⭐".repeat(r.rating)}</span>
                      <span
                        className={`text-xs font-semibold uppercase shrink-0 w-18 ${
                          r.s === "positive" ? "text-emerald-600" : r.s === "negative" ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {r.s}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-red-800 mb-0.5">2 unanswered negative reviews</p>
                    <p className="text-xs text-red-600">Patients check reviews before booking. Reply quickly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-emerald-800 mb-0.5">3 competitors reply in 24h</p>
                    <p className="text-xs text-emerald-600">Fast responses = higher patient conversion.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </motion.div>
  );
}

// ==================== Social Proof — Glass Cards ====================

function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, 200, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) { setCount(Math.round(v)); },
    });
    return () => controls.stop();
  }, [isInView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.5, delay: 0.1 * i, ease: "easeOut" as const },
    }),
  };

  return (
    <section ref={ref} className="py-20 md:py-28 bg-slate-900 relative">
      {/* Subtle texture */}
      <GridTexture />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-[Inter] font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-3">
            Trusted by {count}+ Dental Clinics
          </h2>
          <p className="text-slate-400 text-lg">
            Real results from real practices across the US.
          </p>
        </div>

        {/* 3 Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={cardVariants}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6
                         hover:bg-slate-800/70 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Green stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="text-emerald-400" fill="#10b981" />
                ))}
              </div>

              {/* Quote */}
              <Quote size={20} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                  {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Bottom CTA ====================

function BottomCTASection() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <section className="py-20 md:py-28 bg-slate-900 relative overflow-hidden">
      <GridTexture />

      {/* Green glow orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-[Inter] font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-4">
          Ready to see how you compare?
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
          Join 200+ dental clinics that benchmark their online reputation with
          ReviewFlow. Free report, no strings attached.
        </p>

        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-full text-base
                     hover:bg-emerald-400 hover:scale-[1.03] transition-all duration-200
                     shadow-xl shadow-emerald-500/25"
        >
          Get My Free Audit
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

// ==================== Footer ====================

function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <Star size={12} className="text-white" fill="white" />
            </div>
            <span className="font-[Inter] font-bold text-lg tracking-tight">ReviewFlow</span>
          </Link>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ReviewFlow. Automated reputation management for dental clinics.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign up</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== Main Page ====================

export default function FreeAuditPage() {
  return (
    <main className="min-h-screen font-[Inter] antialiased">
      <Navbar />
      <HeroSection />
      <DashboardPreviewSection />
      <SocialProofSection />
      <BottomCTASection />
      <Footer />
    </main>
  );
}
