"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="font-outfit font-bold text-3xl text-brand-dark mb-6">Terms and Conditions</h1>
        <div className="prose text-brand-muted">
          <p className="mb-4">Last updated: June 1, 2026</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">By accessing and using ReviewFlow, you agree to be bound by these Terms and Conditions.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">2. Service Description</h2>
          <p className="mb-4">ReviewFlow provides automated email follow-up services and QR code generation to help dental clinics collect patient reviews.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">3. Subscription Plans</h2>
          <p className="mb-4">We offer three tiers: Free, Pro ($39/month), and Agency ($69/month). Subscriptions auto-renew unless cancelled. All paid plans include a 7-day free trial.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">4. User Responsibilities</h2>
          <p className="mb-4">You are responsible for maintaining accurate patient data and complying with all applicable laws including HIPAA.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">5. Refund Policy</h2>
          <p className="mb-4">If you are not satisfied within the first 14 days of your paid subscription, contact us for a full refund — no questions asked.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">ReviewFlow is not liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">7. Contact</h2>
          <p className="mb-4">For questions about these terms, contact us at support@reviewflowdental.com</p>
        </div>
      </div>
    </div>
  );
}
