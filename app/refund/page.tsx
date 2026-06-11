"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="font-outfit font-bold text-3xl text-brand-dark mb-6">Refund Policy</h1>
        <div className="prose text-brand-muted">
          <p className="mb-4">Last updated: June 1, 2026</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">1. Free Trial</h2>
          <p className="mb-4">All paid plans include a 15-day free trial — first month free when you subscribe. No credit card required to start.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">2. Refund Eligibility</h2>
          <p className="mb-4">If you are not satisfied with our service, you can request a full refund within 14 days of your first payment.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">3. How to Request a Refund</h2>
          <p className="mb-4">Contact us at support@reviewflowdental.com with your account details. Refunds are processed within 5-7 business days.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">4. Subscription Cancellations</h2>
          <p className="mb-4">You can cancel your subscription at any time. You will retain access until the end of your current billing period.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">5. Exceptions</h2>
          <p className="mb-4">Refunds are not available for accounts that violate our Terms of Service or have been suspended.</p>
          <h2 className="text-xl font-semibold text-brand-dark mt-8 mb-4">6. Contact</h2>
          <p className="mb-4">For refund requests, contact us at support@reviewflowdental.com</p>
        </div>
      </div>
    </div>
  );
}
