"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Star,
  TrendingUp,
  Search,
  Mail,
  User,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock,
  ChevronDown,
  BarChart3,
  MessageSquare,
  Quote,
  X,
  MapPin,
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
    clinic: "Smile Dental Studio",
    location: "Austin, TX",
    quote:
      "The free audit showed us we had 3 unanswered negative reviews we didn't even know about. We signed up the same day.",
    result: "From 3.8 → 4.7 in 2 months",
  },
  {
    name: "Dr. Robert Kim",
    clinic: "Westlake Family Dental",
    location: "Denver, CO",
    quote:
      "I thought we were doing fine until the audit revealed our competitors were responding to reviews 3x faster. Eye-opening report.",
    result: "Patient acquisition up 40%",
  },
  {
    name: "Dr. Lisa Park",
    clinic: "Pearl Dental Group",
    location: "Phoenix, AZ",
    quote:
      "The competitor comparison alone was worth it. We immediately changed our review response strategy based on the report.",
    result: "First page Google ranking in 6 weeks",
  },
];

// ==================== Hero Section ====================

function HeroSection({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="relative overflow-hidden bg-brand-blue pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/12 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm border border-white/10">
          <BarChart3 size={16} />
          Free Competitive Analysis for Dental Clinics
        </div>

        <h1 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight mb-6">
          See How Your Dental Clinic
          <br />
          <span className="text-brand-yellow">Compares to Competitors</span>
        </h1>

        <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your clinic name. Get a personalized report comparing your
          Google &amp; Yelp reviews against 3 local competitors. No credit card
          required.
        </p>

        <button
          onClick={onCTA}
          className="inline-flex items-center gap-2 px-8 py-4 bg-brand-yellow text-brand-blue font-bold rounded-xl text-base
                     transition-all duration-200 hover:brightness-110 hover:scale-[1.02] shadow-lg shadow-black/20"
        >
          Get My Free Audit
          <ArrowRight size={18} />
        </button>

        <p className="text-white/50 text-sm mt-6 flex items-center justify-center gap-2">
          <Clock size={14} />
          Takes less than 60 seconds
        </p>
      </div>
    </section>
  );
}

// ==================== Form Section ====================

function FormSection({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
  const [clinicName, setClinicName] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
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
      // silently ignore autocomplete errors
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
      setError("Please enter your clinic name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
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

  if (submitted) {
    return (
      <div ref={formRef} className="py-20 md:py-28 bg-white scroll-mt-24">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-brand-blue mb-4">
            Your Report is Being Generated!
          </h2>
          <p className="text-brand-muted text-lg mb-2">
            We&apos;re analyzing your clinic&apos;s online presence now.
          </p>
          <p className="text-brand-muted font-semibold mb-8">
            Check your inbox at{" "}
            <span className="text-brand-blue">{email}</span> — your report will
            arrive within 2 minutes.
          </p>
          <div className="p-6 bg-brand-soft rounded-xl text-left text-sm text-brand-muted">
            <p className="font-semibold text-brand-dark mb-2">
              📬 What to expect:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span>📊</span> Rating comparison vs. 3 local competitors
              </li>
              <li className="flex gap-2">
                <span>💬</span> Recent review sentiment analysis
              </li>
              <li className="flex gap-2">
                <span>⚠️</span> Unanswered negative review alerts
              </li>
              <li className="flex gap-2">
                <span>✅</span> Competitor response time benchmarks
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section ref={formRef} className="py-20 md:py-28 bg-white scroll-mt-24">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-brand-blue mb-3">
            Get Your Free Review Audit
          </h2>
          <p className="text-brand-muted">
            No credit card. No commitment. Just insights.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Clinic Name with Autocomplete */}
          <div className="relative">
            <label
              htmlFor="clinic-name"
              className="block text-sm font-semibold text-brand-dark mb-1.5"
            >
              Clinic Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                ref={inputRef}
                id="clinic-name"
                type="text"
                value={clinicName}
                onChange={(e) => handleClinicInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (predictions.length > 0) setShowDropdown(true);
                }}
                placeholder='e.g. "Sunnyvale Dental Care"'
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D0D8E4] bg-white text-brand-dark
                           placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/20
                           focus:border-brand-blue transition-shadow text-sm"
              />
            </div>

            {/* Autocomplete dropdown */}
            {showDropdown && predictions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E0E7F1] rounded-xl shadow-lg
                           overflow-hidden max-h-60 overflow-y-auto"
              >
                {predictions.map((p, i) => (
                  <button
                    key={p.place_id}
                    type="button"
                    onClick={() => selectPrediction(p)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      i === highlightIdx
                        ? "bg-brand-soft"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <MapPin
                      size={16}
                      className="text-brand-muted mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-dark truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {p.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-brand-dark mb-1.5"
            >
              Your Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D0D8E4] bg-white text-brand-dark
                           placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/20
                           focus:border-brand-blue transition-shadow text-sm"
              />
            </div>
          </div>

          {/* Name (optional) */}
          <div>
            <label
              htmlFor="user-name"
              className="block text-sm font-semibold text-brand-dark mb-1.5"
            >
              Your Name <span className="text-brand-muted font-normal">(optional)</span>
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
              <input
                id="user-name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D0D8E4] bg-white text-brand-dark
                           placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/20
                           focus:border-brand-blue transition-shadow text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-blue text-white font-bold rounded-xl text-sm
                       transition-all duration-200 hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating Report...
              </>
            ) : (
              <>
                Generate My Report
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <Check size={12} className="text-green-500" /> No credit card
          </span>
          <span className="flex items-center gap-1">
            <Check size={12} className="text-green-500" /> 2-minute delivery
          </span>
          <span className="flex items-center gap-1">
            <Check size={12} className="text-green-500" /> No spam
          </span>
        </div>
      </div>
    </section>
  );
}

// ==================== Report Preview Section ====================

function ReportPreviewSection() {
  return (
    <section className="py-20 md:py-28 bg-brand-soft">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-brand-blue mb-3">
            What Your Free Audit Looks Like
          </h2>
          <p className="text-brand-muted italic">
            &ldquo;This is what Dr. Smith from Austin Dental saw last week.&rdquo;
          </p>
        </div>

        {/* Mock Report Card */}
        <div className="bg-white rounded-2xl shadow-card border border-[#E0E7F1] overflow-hidden">
          {/* Report Header */}
          <div className="bg-brand-blue px-6 py-5 md:px-8">
            <h3 className="font-outfit font-bold text-lg md:text-xl text-white">
              📊 Your Review Audit Report
            </h3>
            <p className="text-brand-soft text-sm mt-1">
              Austin Dental vs. 3 Local Competitors
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Rating Comparison Bars */}
            <div>
              <h4 className="font-outfit font-bold text-sm text-brand-dark mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-blue" />
                Google Rating Comparison
              </h4>

              {[
                { name: "Pearl Dental Care", rating: 4.7, color: "bg-green-500", isCompetitor: true },
                { name: "Bright Smile Dentistry", rating: 4.4, color: "bg-blue-400", isCompetitor: true },
                { name: "Family Dental Center", rating: 4.2, color: "bg-blue-400", isCompetitor: true },
                { name: "Austin Dental (You)", rating: 3.8, color: "bg-brand-yellow", isYou: true },
              ].map((item, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm ${
                        item.isYou
                          ? "font-bold text-brand-blue"
                          : "text-brand-dark"
                      }`}
                    >
                      {item.name}
                      {item.isYou && (
                        <span className="ml-1 text-xs text-brand-muted font-normal">
                          (You)
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-bold text-brand-dark">
                      ⭐ {item.rating}
                    </span>
                  </div>
                  <div className="h-2.5 bg-brand-soft rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color}`}
                      style={{ width: `${(item.rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sentiment Analysis */}
            <div>
              <h4 className="font-outfit font-bold text-sm text-brand-dark mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-blue" />
                Recent Review Sentiment
              </h4>
              <div className="space-y-2">
                {[
                  { author: "Sarah M.", text: "Best experience ever! Staff was incredibly friendly.", sentiment: "positive", rating: 5 },
                  { author: "James T.", text: "45 min wait past appointment. Cleaning felt rushed.", sentiment: "negative", rating: 2 },
                  { author: "Maria L.", text: "Billing errors — still trying to resolve a charge.", sentiment: "negative", rating: 1 },
                  { author: "David K.", text: "Good cleaning overall. Front desk needs work.", sentiment: "neutral", rating: 4 },
                  { author: "Linda W.", text: "Dr. Chen explained everything clearly. Painless!", sentiment: "positive", rating: 5 },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-bold text-brand-dark w-16 shrink-0">
                      {r.author}
                    </span>
                    <span className="text-xs shrink-0">
                      {"⭐".repeat(r.rating)}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase shrink-0 w-20 ${
                        r.sentiment === "positive"
                          ? "text-green-600"
                          : r.sentiment === "negative"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {r.sentiment}
                    </span>
                    <span className="text-xs text-brand-muted truncate">
                      {r.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-red-700 mb-0.5">
                    You have 2 unanswered negative reviews
                  </p>
                  <p className="text-xs text-red-600">
                    Patients check reviews before booking. Reply quickly to
                    recover trust.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Check size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-green-700 mb-0.5">
                    3 competitors reply to all reviews in 24h
                  </p>
                  <p className="text-xs text-green-600">
                    Fast responses correlate with higher patient conversion.
                  </p>
                </div>
              </div>
            </div>

            {/* Clinician testimonial callout */}
            <div className="flex items-center gap-4 p-4 bg-brand-soft rounded-xl">
              <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm shrink-0">
                JS
              </div>
              <div>
                <p className="text-sm text-brand-dark font-semibold">
                  Dr. James Smith — Austin Dental
                </p>
                <p className="text-xs text-brand-muted">
                  &ldquo;After seeing this report, I realized we were losing
                  patients to competitors with better review management. Signed
                  up that afternoon.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Social Proof Section ====================

function SocialProofSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-soft text-brand-blue text-sm font-semibold mb-6">
            <TrendingUp size={16} />
            Join 200+ dental clinics using ReviewFlow
          </div>
          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-brand-blue">
            Trusted by Dentists Nationwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E0E7F1] p-6 shadow-card hover:shadow-lg transition-shadow"
            >
              <Quote size={20} className="text-brand-soft mb-3" />
              <p className="text-sm text-brand-dark leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#E0E7F1]">
                <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">
                    {t.name}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {t.clinic}, {t.location}
                  </p>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full text-xs font-semibold text-green-700">
                <TrendingUp size={12} />
                {t.result}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Bottom CTA Section ====================

function BottomCTASection({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="py-20 md:py-28 bg-brand-blue text-white text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="font-outfit font-bold text-2xl md:text-4xl mb-4">
          Ready to See How You Compare?
        </h2>
        <p className="text-white/80 mb-8 leading-relaxed text-sm md:text-base">
          Join 200+ dental clinics that have benchmarked their online reputation
          with ReviewFlow. Free report, no strings attached.
        </p>
        <button
          onClick={onCTA}
          className="inline-flex items-center gap-2 px-8 py-4 bg-brand-yellow text-brand-blue font-bold rounded-xl text-base
                     transition-all duration-200 hover:brightness-110 hover:scale-[1.02] shadow-lg"
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
    <footer className="bg-brand-dark text-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="font-outfit font-bold text-lg text-white hover:text-brand-yellow transition-colors"
          >
            ReviewFlow
          </Link>
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} ReviewFlow. Built for Dental Clinics.
          </div>
          <div className="flex gap-6 text-sm text-white/70">
            <Link href="/login" className="hover:text-white transition-colors">
              Log In
            </Link>
            <Link
              href="/register"
              className="hover:text-white transition-colors"
            >
              Sign Up
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
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-white">
      <HeroSection onCTA={scrollToForm} />
      <FormSection formRef={formRef} />
      <ReportPreviewSection />
      <SocialProofSection />
      <BottomCTASection onCTA={scrollToForm} />
      <Footer />
    </main>
  );
}
