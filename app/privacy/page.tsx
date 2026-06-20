"use client";

import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="font-bold text-3xl text-slate-900 mb-6">Privacy Policy</h1>
        <div className="prose text-slate-600">
          <p className="mb-4">Last updated: June 1, 2026</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect business information, patient contact details (with consent), and usage data to provide our services.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. How We Use Information</h2>
          <p className="mb-4">We use collected data to send automated review request emails, generate QR codes, and improve our service.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">We implement industry-standard security measures including encryption and secure hosting to protect your data.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Third-Party Services</h2>
          <p className="mb-4">We use Resend for email delivery and Supabase for data storage. These services comply with GDPR and HIPAA standards.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Your Rights</h2>
          <p className="mb-4">You can access, update, or delete your data at any time. Contact us to exercise these rights.</p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Contact</h2>
          <p className="mb-4">For privacy concerns, contact us at privacy@reviewflowdental.com</p>
        </div>
      </div>
    </div>
  );
}
