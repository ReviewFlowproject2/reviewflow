"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-outfit font-bold text-4xl text-brand-blue text-center mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-brand-muted text-center mb-12">
          Start free. Upgrade when you're ready to automate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="bg-white rounded-[16px] p-8 border border-[#E0E7F1]">
            <h3 className="font-outfit font-bold text-xl text-brand-dark mb-2">Free</h3>
            <p className="text-brand-muted text-sm mb-4">QR code generation</p>
            <div className="font-outfit font-bold text-3xl text-brand-dark mb-6">$0</div>
            <Link href="/register" className="block w-full text-center py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-blue hover:text-white transition-colors">
              Get Started
            </Link>
            <ul className="mt-6 space-y-3 text-sm text-brand-dark">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>QR code generation</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Google Review link</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Basic dashboard</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Up to 50 patients</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-[16px] p-8 border-2 border-brand-blue scale-105 shadow-card">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
            <h3 className="font-outfit font-bold text-xl text-brand-dark mb-2">Pro</h3>
            <p className="text-brand-muted text-sm mb-4">Automate your growth</p>
            <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">$29<span className="text-lg text-brand-muted">/mo</span></div>
            <p className="text-xs text-brand-muted mb-6">$24/mo billed yearly</p>
            <Link href="/register" className="block w-full text-center py-2.5 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-colors">
              Start Free Trial
            </Link>
            <ul className="mt-6 space-y-3 text-sm text-brand-dark">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Everything in Free</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Automated email follow-ups</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Real-time negative review alerts</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Competitor tracking</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Reply templates</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Unlimited patients</li>
            </ul>
          </div>

          {/* Agency */}
          <div className="bg-white rounded-[16px] p-8 border border-[#E0E7F1]">
            <h3 className="font-outfit font-bold text-xl text-brand-dark mb-2">Agency</h3>
            <p className="text-brand-muted text-sm mb-4">Manage multiple clinics</p>
            <div className="font-outfit font-bold text-3xl text-brand-dark mb-1">$99<span className="text-lg text-brand-muted">/mo</span></div>
            <p className="text-xs text-brand-muted mb-6">$79/mo billed yearly</p>
            <a href="mailto:sales@reviewflowdental.com" className="block w-full text-center py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-blue hover:text-white transition-colors">
              Contact Sales
            </a>
            <ul className="mt-6 space-y-3 text-sm text-brand-dark">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Everything in Pro</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Multi-clinic dashboard</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>White-label branding</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>API access</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500"/>Dedicated manager</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
