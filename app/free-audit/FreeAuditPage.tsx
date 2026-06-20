"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Star, TrendingUp, MapPin, Mail, Search, ArrowUpRight,
  CheckCircle2, Loader2, ShieldCheck, Clock, Sparkles,
  TriangleAlert, Quote, Activity,
} from "lucide-react";

// ==================== Types ====================

interface PlacePrediction {
  place_id: string;
  name: string;
  address: string;
  full: string;
}

// ==================== Star Row ====================

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "size-5" : "size-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= Math.round(rating) ? `${s} fill-amber-400 text-amber-400` : `${s} text-slate-200`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ==================== Site Header ====================

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="ReviewFlow Home">
          <span className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">ReviewFlow</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          <a href="#report" className="transition hover:text-slate-900">Sample Report</a>
          <a href="#proof" className="transition hover:text-slate-900">Testimonials</a>
        </nav>

        <a
          href="#audit"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Free Audit
        </a>
      </div>
    </header>
  );
}

// ==================== Hero + Lead Form ====================

function HeroSection() {
  const [clinic, setClinic] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = useState<{ clinic?: string; email?: string }>({});
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) { setPredictions([]); setShowDropdown(false); return; }
    try {
      const res = await fetch(`/api/audit/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.predictions) { setPredictions(data.predictions); setShowDropdown(data.predictions.length > 0); setHighlightIdx(-1); }
    } catch (_) {}
  }, []);

  const handleClinicInput = (value: string) => {
    setClinic(value); setSelectedPlaceId("");
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => fetchPredictions(value), 300));
  };

  const selectPrediction = (p: PlacePrediction) => {
    setClinic(p.name); setSelectedPlaceId(p.place_id); setShowDropdown(false); setPredictions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx((p) => Math.min(p + 1, predictions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx((p) => Math.max(p - 1, -1)); }
    else if (e.key === "Enter" && highlightIdx >= 0) { e.preventDefault(); selectPrediction(predictions[highlightIdx]); }
    else if (e.key === "Escape") { setShowDropdown(false); }
  };

  function validate() {
    const next: { clinic?: string; email?: string } = {};
    if (!clinic.trim()) next.clinic = "Please enter your clinic name";
    if (!email.trim()) next.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");

    try {
      await fetch("/api/audit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicName: clinic.trim(), email: email.trim(), placeId: selectedPlaceId || undefined }),
      });
    } catch (_) {}
    // Simulate a small delay for UX
    await new Promise((r) => setTimeout(r, 1100));
    setStatus("success");
  }

  const inputClass = (hasError: boolean) =>
    `h-12 w-full rounded-lg border bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/40 ${hasError ? "border-red-400" : "border-slate-200"}`;

  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <section
      id="audit"
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-teal-50/60 to-white"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* ===== LEFT — Copy ===== */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
            <span className="flex size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            For Dental Clinics Across the US
          </div>

          <h1 className="mt-5 text-pretty text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
            See How Your Clinic{" "}
            <span className="text-teal-600">Stacks Up Online</span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate-500">
            Get a{" "}
            <strong className="font-semibold text-slate-900">free competitor review audit</strong>.
            We compare your Google &amp; Yelp ratings, volume, and response speed against local
            competitors — and show you exactly how to win more patients.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Star, label: "Rating vs. Competitors" },
              { icon: MapPin, label: "Local Rank Analysis" },
              { icon: TrendingUp, label: "Actionable Recommendations" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex -space-x-2" aria-hidden="true">
              {["bg-teal-400", "bg-emerald-400", "bg-amber-400", "bg-blue-400"].map((c) => (
                <span key={c} className={`size-8 rounded-full border-2 border-white ${c}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">200+ clinics</span> have received their free audit
            </p>
          </div>
        </div>

        {/* ===== RIGHT — Form Card ===== */}
        <div className="lg:pl-4">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">Get Your Free Competitive Audit</h2>
          </div>

          {status === "success" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-balance text-slate-900">Report on the way — check your inbox</h3>
              <p className="mx-auto mt-2 max-w-sm text-pretty leading-relaxed text-slate-500">
                We&apos;re analyzing <span className="font-medium text-slate-900">{clinic}</span>&apos;s
                online presence. Your audit will arrive at{" "}
                <span className="font-medium text-slate-900">{email}</span> within minutes.
              </p>
              <button
                type="button"
                onClick={() => { setStatus("idle"); setClinic(""); setEmail(""); }}
                className="mt-5 text-sm font-medium text-teal-600 underline-offset-4 hover:underline"
              >
                Request another audit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="space-y-4">
                {/* Clinic Name */}
                <div className="relative">
                  <label htmlFor="clinic" className={labelClass}>Clinic Name</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      ref={inputRef}
                      id="clinic"
                      name="clinic"
                      type="text"
                      value={clinic}
                      onChange={(e) => handleClinicInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                      placeholder="e.g. Sunnyvale Dental Care"
                      aria-invalid={!!errors.clinic}
                      aria-describedby={errors.clinic ? "clinic-error" : undefined}
                      className={inputClass(!!errors.clinic) + " pl-11"}
                    />
                  </div>
                  {errors.clinic && <p id="clinic-error" className="mt-1 text-sm text-red-500">{errors.clinic}</p>}
                  {/* Autocomplete dropdown */}
                  {showDropdown && predictions.length > 0 && (
                    <div ref={dropdownRef} className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                      {predictions.map((p, i) => (
                        <button key={p.place_id} type="button" onClick={() => selectPrediction(p)} onMouseEnter={() => setHighlightIdx(i)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${i === highlightIdx ? "bg-slate-100" : "hover:bg-slate-50"}`}>
                          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p><p className="text-xs text-slate-500 truncate">{p.address}</p></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClass}>Work Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourclinic.com"
                      aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
                      className={inputClass(!!errors.email) + " pl-11"}
                    />
                  </div>
                  {errors.email && <p id="email-error" className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Submit */}
                <button type="submit" disabled={status === "submitting"}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 disabled:opacity-70">
                  {status === "submitting" ? (
                    <><Loader2 className="size-5 animate-spin" aria-hidden="true" />Generating report...</>
                  ) : (
                    "Get My Free Audit Report"
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  100% free · No credit card · We never spam
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ==================== Report Preview ====================

function CompareRow({ name, rating, reviews, pct, you = false }: {
  name: string; rating: number; reviews: number; pct: number; you?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${you ? "border-teal-500/40 bg-teal-50/50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{name}</span>
          {you && (
            <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Your Clinic
            </span>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{rating.toFixed(1)}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <StarRow rating={rating} />
        <span className="text-xs text-slate-500">{reviews} reviews</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${you ? "bg-teal-600" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ReportPreviewSection() {
  return (
    <section id="report" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-teal-600">What You&apos;ll Receive</span>
          <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            See exactly where you stand against competitors
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-slate-500">
            Real data, clear charts, actionable recommendations — designed for busy practice owners. Read it in 5 minutes.
          </p>
        </div>

        {/* Mock report card */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-teal-500/5">
          {/* Report header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Competitive Review Audit</p>
              <p className="text-base font-semibold text-slate-900">SmileCare Dental · Austin, TX</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Ranked #3 of 5
            </span>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-5">
            {/* Comparison column */}
            <div className="space-y-3 lg:col-span-3">
              <p className="text-sm font-semibold text-slate-900">Local Competitor Comparison</p>
              <CompareRow name="Lakeside Dental" rating={4.9} reviews={412} pct={98} />
              <CompareRow name="Capital Family Dental" rating={4.8} reviews={356} pct={92} />
              <CompareRow name="SmileCare Dental" rating={4.3} reviews={128} pct={64} you />
            </div>

            {/* Insights column */}
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">ReviewFlow Score</p>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-4xl font-bold text-teal-600">64</span>
                  <span className="mb-1 text-sm text-slate-400">/100</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Room for improvement</p>
              </div>

              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-slate-900">Priority Actions</p>
                {[
                  "284 fewer reviews than the top competitor",
                  "9 reviews unanswered in the last 30 days",
                  "Average response time: 6.2 days",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>3 quick-win opportunities identified</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">
                <ArrowUpRight className="size-4" aria-hidden="true" />
                Estimated 38% more new patient inquiries
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          * Sample report for demonstration. Your report uses real Google &amp; Yelp data.
        </p>
      </div>
    </section>
  );
}

// ==================== Social Proof ====================

const STATS = [
  { value: "200+", label: "Audited Dental Clinics" },
  { value: "1.8M+", label: "Patient Reviews Analyzed" },
  { value: "4.3 → 4.8", label: "Average Rating Improvement" },
  { value: "38%", label: "Avg. New Patient Growth" },
];

const TESTIMONIALS = [
  {
    quote: "The audit pointed out exactly how many reviews we were missing. Two months later, new patient calls were up nearly 50%.",
    name: "Dr. Sarah Mitchell",
    role: "Owner · Mitchell Family Dentistry",
  },
  {
    quote: "I thought our reputation was solid until I saw the clinic next door had 3x our reviews. This report opened my eyes.",
    name: "Dr. James Okafor",
    role: "Dentist · Riverside Dental Care",
  },
  {
    quote: "I don't have time for fancy marketing tools. ReviewFlow told me exactly what to do and in what order — simple, credible.",
    name: "Dr. Emily Chen",
    role: "Owner · Lakeview Smiles",
  },
];

function SocialProofSection() {
  return (
    <section id="proof" className="border-y border-slate-200 bg-slate-50/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold tracking-tight text-teal-600 sm:text-4xl">{s.value}</div>
              <div className="mt-1.5 text-sm text-slate-500 text-pretty">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h2 className="text-pretty text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by Dental Practice Owners Nationwide
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-slate-500">
            Not another marketing gimmick — clear data, actionable next steps.
          </p>
        </div>

        {/* Testimonials */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Quote className="size-7 text-teal-500/30" aria-hidden="true" />
              <div className="mt-2 flex gap-0.5" aria-label="5-star review">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-pretty leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-slate-100 pt-4">
                <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
              </figcaption>
            </figure>
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
    <section className="bg-teal-600 py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Find out where your clinic really ranks
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-teal-50/80">
            Enter your clinic name and email. Get your free competitive review audit in minutes.
            No calls, no demos, no credit card.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              { icon: Clock, label: "Delivered in minutes — no sales call" },
              { icon: Sparkles, label: "Tailored, actionable recommendations" },
              { icon: ShieldCheck, label: "100% free · Your data stays private" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-medium text-white/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-6 sm:p-7 text-center">
          <CheckCircle2 className="mx-auto size-10 text-teal-200 mb-3" />
          <h3 className="text-xl font-semibold text-white">Ready to see the data?</h3>
          <p className="mt-2 text-teal-100/80 text-sm">
            Scroll up and fill the form — takes 45 seconds.
          </p>
          <button
            onClick={scrollToTop}
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            Get My Free Audit
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ==================== Site Footer ====================

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold text-slate-900">ReviewFlow</span>
        </div>
        <p className="text-sm text-slate-500">Online review monitoring &amp; growth for dental practices.</p>
        <div className="flex gap-6 text-sm text-slate-400">
          <Link href="/login" className="hover:text-slate-600 transition-colors">Log in</Link>
          <Link href="/register" className="hover:text-slate-600 transition-colors">Sign up</Link>
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

// ==================== Main Page ====================

export default function FreeAuditPage() {
  return (
    <main className="min-h-screen bg-white antialiased">
      <SiteHeader />
      <HeroSection />
      <ReportPreviewSection />
      <SocialProofSection />
      <BottomCTASection />
      <SiteFooter />
    </main>
  );
}
