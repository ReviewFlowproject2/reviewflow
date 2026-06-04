"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Bug, Lightbulb, MessageSquare } from "lucide-react";

export default function SiteFeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "bug",
    message: "",
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("type", formData.type);
      form.append("message", formData.message);
      form.append("name", formData.name || "Anonymous");
      form.append("email", formData.email || "no-reply@reviewflowdental.com");
      form.append("_subject", `ReviewFlow Feedback: ${formData.type}`);
      form.append("_captcha", "false");

      const res = await fetch("https://formsubmit.co/ajax/dengxiaofeng880914@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });
      const data = await res.json();

      if (data.success === "true" || data.success === true) {
        setSubmitted(true);
      } else {
        alert("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: "bug", label: "Bug Report", icon: Bug, desc: "Something is not working correctly" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, desc: "I have an idea to improve the product" },
    { value: "general", label: "General Feedback", icon: MessageSquare, desc: "Other comments or suggestions" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back to Dashboard */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-[#E0E7F1] p-10 text-center shadow-card">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-outfit font-bold text-2xl text-brand-dark mb-2">
              Thank You!
            </h2>
            <p className="text-brand-muted mb-6">
              Your feedback has been sent. We appreciate your help in making ReviewFlow better.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E0E7F1] p-8 shadow-card">
            <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">
              Send Feedback
            </h1>
            <p className="text-brand-muted text-sm mb-8">
              Found a bug or have a suggestion? Help us improve ReviewFlow.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-3">
                  Feedback Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {feedbackTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: t.value }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                          isSelected
                            ? "border-brand-blue bg-brand-soft text-brand-blue"
                            : "border-[#E0E7F1] hover:border-brand-blue/50 text-brand-muted"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium">{t.label}</span>
                        <span className="text-xs opacity-70">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe the bug or your suggestion in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full rounded-xl border border-brand-soft p-4 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
                />
              </div>

              {/* Optional Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-2">
                    Your Name <span className="text-brand-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-2">
                    Your Email <span className="text-brand-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !formData.message.trim()}
                className="w-full py-3.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {submitting ? "Sending..." : "Send Feedback"}
              </button>

              <p className="text-xs text-brand-muted/60 text-center">
                Your email address will not be shared with third parties.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
