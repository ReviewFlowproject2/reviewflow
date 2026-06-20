"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Mail,
  User,
  ArrowRight,
  Check,
  AlertTriangle,
  Globe,
  BarChart3,
  MessageSquare,
  Quote,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Zap,
  FileText,
  PhoneCall,
} from "lucide-react";

// ==================== Design Tokens (Stripe/Notion aesthetic) ====================
// Primary: blue-800 (#1E40AF)  Accent: emerald-500 (#10B981)
// Background: slate-50 (#F8FAFC)  Card: white  Heading: slate-900  Body: slate-500

// ==================== Types ====================

interface PlacePrediction {
  place_id: string;
  name: string;
  address: string;
  full: string;
}

// ==================== Data ====================

const VALUE_PROPS = [
  {
    title: "Identify hidden negative review patterns",
    desc: "Spot trends before they damage your reputation. See which reviews go unanswered and where patients express frustration.",
  },
  {
    title: "Benchmark against local competitors",
    desc: "Compare your Google and Yelp ratings side-by-side with 3 nearby practices. Know exactly where you stand.",
  },
  {
    title: "Uncover revenue lost to low ratings",
    desc: "A 0.5-star drop can cost 15% in new patient revenue. See the real dollar impact of your online reputation.",
  },
];

const MODULES = [
  {
    icon: MessageSquare,
    title: "Review Sentiment Analysis",
    desc: "AI-powered breakdown of every review — positive, neutral, or negative — so you know exactly what patients think.",
  },
  {
    icon: BarChart3,
    title: "Competitor Benchmarking",
    desc: "Side-by-side comparison against 3 local competitors on ratings, review volume, and response time.",
  },
  {
    icon: ShieldCheck,
    title: "Response Rate Score",
    desc: "See how quickly you reply compared to competitors. Fast responses win back unhappy patients.",
  },
];

const CLIENT_LOGOS = [
  { initials: "SD", name: "Smile Dental" },
  { initials: "PC", name: "Pearl Care" },
  { initials: "FD", name: "Family Dentistry" },
  { initials: "BW", name: "Bright Works" },
  { initials: "EP", name: "Elite Practice" },
  { initials: "DC", name: "Dental Care" },
];

// ==================== Navbar ====================

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="font-[Inter] font-bold text-xl text-blue-800 tracking-tight"
        >
          ReviewFlow
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ==================== Hero Section (2-col: text left, form right) ====================

function HeroSection() {
  const [clinicName, setClinicName] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [website, setWebsite] = useState("");
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
      const res = await fetch(
        `/api/audit/autocomplete?input=${encodeURIComponent(input)}`
      );
      const data = await res.json();
      if (data.predictions) {
        setPredictions(data.predictions);
        setShowDropdown(data.predictions.length > 0);
        setHighlightIdx(-1);
      }
    } catch (_) {
      // silently ignore
    }
  }, []);

  const handleClinicInput = (value: string) => {
    setClinicName(value);
    setSelectedPlaceId("");
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => fetchPredictions(value), 300);
    setTypingTimeout(t);
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
      setError("Please enter your practice name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your work email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
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
          name: userName.trim() || undefined,
          placeId: selectedPlaceId || undefined,
          website: website.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch (_) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Success State ----
  if (submitted) {
    return (
      <section className="pt-24 pb-20 md:pt-32 md:pb-28 bg-slate-50">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h1 className="font-[Inter] font-extrabold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            Your report is on the way
          </h1>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            We&apos;re analyzing <span className="font-semibold text-slate-700">{clinicName}</span> now.
            Check <span className="font-semibold text-slate-700">{email}</span> — your audit arrives within 2 minutes.
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left mb-8">
            <p className="font-semibold text-slate-800 mb-3 text-sm">What&apos;s inside your report:</p>
            <ul className="space-y-2.5 text-sm text-slate-500">
              {[
                "Rating comparison vs. 3 local competitors",
                "Recent review sentiment analysis",
                "Unanswered negative review alerts",
                "Competitor response time benchmarks",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white font-semibold rounded-xl text-sm hover:bg-blue-900 transition-colors"
          >
            Start 15-Day Free Trial
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  // ---- Form + Hero ----
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* ---- LEFT: Text ---- */}
          <div className="lg:pt-8">
            <h1 className="font-[Inter] font-extrabold text-4xl sm:text-5xl lg:text-[52px] leading-[1.1] tracking-tight text-slate-900 mb-6">
              Reveal Your Clinic&apos;s Online Reputation Blind Spots
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-8 max-w-lg">
              Get a 5-minute audit to identify negative trends, competitor gaps,
              and lost revenue — before they hurt your practice.
            </p>

            {/* Value props */}
            <div className="space-y-4 mb-10">
              {VALUE_PROPS.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop-only: social proof badge below value props */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex -space-x-2">
                {CLIENT_LOGOS.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500"
                    title={c.name}
                  >
                    {c.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">500+</span> dental practices use ReviewFlow
              </p>
            </div>
          </div>

          {/* ---- RIGHT: Form Card ---- */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="font-[Inter] font-bold text-xl text-slate-900 mb-6">
                Get Your Free Audit Report
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Practice Name + Autocomplete */}
                <div className="relative">
                  <label
                    htmlFor="practice-name"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Practice Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      ref={inputRef}
                      id="practice-name"
                      type="text"
                      value={clinicName}
                      onChange={(e) => handleClinicInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (predictions.length > 0) setShowDropdown(true);
                      }}
                      placeholder="e.g. Sunnyvale Dental Care"
                      autoComplete="off"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900
                                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20
                                 focus:border-blue-800 transition-shadow"
                    />
                  </div>

                  {showDropdown && predictions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg
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
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{p.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Your Name */}
                <div>
                  <label
                    htmlFor="your-name"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="your-name"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Dr. Smith"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900
                                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20
                                 focus:border-blue-800 transition-shadow"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label
                    htmlFor="work-email"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="work-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@clinic.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900
                                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20
                                 focus:border-blue-800 transition-shadow"
                    />
                  </div>
                </div>

                {/* Practice Website URL */}
                <div>
                  <label
                    htmlFor="practice-website"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Practice Website URL
                  </label>
                  <div className="relative">
                    <Globe
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="practice-website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourclinic.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900
                                 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20
                                 focus:border-blue-800 transition-shadow"
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
                  className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm
                             transition-colors hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 shadow-sm"
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
                      Generate My Free Audit Report
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  No credit card required. Takes 45 seconds.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Social Proof Bar ====================

function SocialProofBar() {
  return (
    <section className="py-10 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center -space-x-1.5">
            {CLIENT_LOGOS.map((c, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500"
                title={c.name}
              >
                {c.initials}
              </div>
            ))}
            <div className="w-9 h-9 rounded-full bg-blue-800 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
              +494
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Trusted by <span className="font-bold text-slate-800">500+</span> Dental Practices Across the US
          </p>
        </div>
      </div>
    </section>
  );
}

// ==================== Value Modules (3 cards) ====================

function ValueModulesSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3">
            What&apos;s Inside
          </p>
          <h2 className="font-[Inter] font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight">
            Actionable insights, delivered in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULES.map((m, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <m.icon size={22} className="text-blue-800" />
              </div>
              <h3 className="font-[Inter] font-bold text-lg text-slate-900 mb-2.5">
                {m.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Report Preview ====================

function ReportPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">
            Sample Report
          </p>
          <h2 className="font-[Inter] font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight mb-3">
            What your audit looks like
          </h2>
          <p className="text-slate-500 italic">
            &ldquo;This is what Dr. Chen from SmileCare Dental saw last week.&rdquo;
          </p>
        </div>

        {/* Mock Report Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Report Header */}
          <div className="bg-slate-900 px-6 py-5 md:px-8">
            <p className="font-[Inter] font-bold text-lg text-white">Review Audit Report</p>
            <p className="text-slate-400 text-sm mt-0.5">SmileCare Dental vs. 3 Local Competitors</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Rating Bars */}
            <div>
              <h4 className="font-[Inter] font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-800" />
                Google Rating Comparison
              </h4>
              {[
                { name: "Pearl Dental Care", rating: 4.7, color: "bg-emerald-500", isCompetitor: true },
                { name: "Bright Smile Dentistry", rating: 4.4, color: "bg-blue-400", isCompetitor: true },
                { name: "Family Dental Center", rating: 4.2, color: "bg-blue-400", isCompetitor: true },
                { name: "SmileCare Dental (You)", rating: 3.8, color: "bg-amber-400", isYou: true },
              ].map((item, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm ${item.isYou ? "font-bold text-blue-800" : "text-slate-700"}`}>
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

            {/* Sentiment Table */}
            <div>
              <h4 className="font-[Inter] font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-800" />
                Recent Review Sentiment
              </h4>
              <div className="space-y-1.5">
                {[
                  { author: "Sarah M.", text: "Best experience ever! Staff was incredibly friendly.", sentiment: "positive", rating: 5 },
                  { author: "James T.", text: "45 min wait past appointment. Cleaning felt rushed.", sentiment: "negative", rating: 2 },
                  { author: "Maria L.", text: "Billing errors — still trying to resolve a charge.", sentiment: "negative", rating: 1 },
                  { author: "David K.", text: "Good cleaning overall. Front desk needs work.", sentiment: "neutral", rating: 4 },
                  { author: "Linda W.", text: "Dr. Chen explained clearly. Painless procedure!", sentiment: "positive", rating: 5 },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-slate-50">
                    <span className="text-xs font-semibold text-slate-700 w-16 shrink-0">{r.author}</span>
                    <span className="text-xs shrink-0">{"⭐".repeat(r.rating)}</span>
                    <span
                      className={`text-xs font-semibold uppercase shrink-0 w-20 ${
                        r.sentiment === "positive"
                          ? "text-emerald-600"
                          : r.sentiment === "negative"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {r.sentiment}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-800 mb-0.5">
                    You have 2 unanswered negative reviews
                  </p>
                  <p className="text-xs text-red-600">
                    Patients check reviews before booking. Quick replies recover trust.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-800 mb-0.5">
                    3 competitors reply to all reviews in 24h
                  </p>
                  <p className="text-xs text-emerald-600">
                    Fast responses correlate with higher patient conversion.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom callout */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                SC
              </div>
              <div>
                <p className="text-sm text-slate-800 font-semibold">
                  Dr. Sarah Chen — SmileCare Dental, Austin TX
                </p>
                <p className="text-xs text-slate-500">
                  &ldquo;After this report, I realized competitors were replying 3x faster. We changed our
                  response strategy and saw a 40% increase in new patient calls within 6 weeks.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Full-Width Testimonial ====================

function TestimonialSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Quote size={32} className="text-slate-300 mx-auto mb-6" />
        <blockquote className="font-[Inter] font-bold text-2xl md:text-3xl text-slate-900 leading-relaxed tracking-tight mb-8">
          &ldquo;The free audit showed us we had 3 unanswered negative reviews we didn&apos;t
          even know about. We signed up the same day and went from a 3.8 to a 4.7
          rating in 2 months.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-lg">
            SM
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900">Dr. Sarah Mitchell</p>
            <p className="text-sm text-slate-500">Smile Dental Studio — Austin, TX</p>
          </div>
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full text-sm font-semibold text-emerald-700">
          <TrendingUp size={14} />
          From 3.8 → 4.7 in 2 months
        </p>
      </div>
    </section>
  );
}

// ==================== Bottom CTA — 3 Buttons ====================

function BottomCTASection() {
  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-[Inter] font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
          Ready to see where you stand?
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          500+ dental practices benchmark their reputation with ReviewFlow. Free audit, no strings attached.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary CTA */}
          <button
            onClick={scrollToHero}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl text-sm
                       hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Generate My Free Audit Report
            <ArrowRight size={16} />
          </button>

          {/* Secondary: See Sample */}
          <button
            onClick={() => {
              document.getElementById("report-preview")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl text-sm
                       hover:bg-white/15 transition-colors border border-white/20"
          >
            <FileText size={16} />
            See a Sample Audit Report
          </button>

          {/* Tertiary: Talk to expert */}
          <Link
            href="mailto:hello@reviewflowdental.com?subject=Free%20Audit%20Consultation"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl text-sm
                       hover:bg-white/5 transition-colors"
          >
            <PhoneCall size={16} />
            Talk to a Dental Marketing Expert
          </Link>
        </div>
      </div>
    </section>
  );
}

// ==================== Footer ====================

function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-[Inter] font-bold text-lg tracking-tight">
            ReviewFlow
          </Link>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ReviewFlow. Built for dental practices.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Sign up
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== Main Page ====================

export default function FreeAuditPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-[Inter]">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <ValueModulesSection />
      <div id="report-preview">
        <ReportPreviewSection />
      </div>
      <TestimonialSection />
      <BottomCTASection />
      <Footer />
    </main>
  );
}
