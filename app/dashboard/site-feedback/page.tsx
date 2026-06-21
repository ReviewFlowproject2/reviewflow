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

  const inputClass = "w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="font-bold text-2xl text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-500 mb-6">Your feedback has been sent. We appreciate your help in making ReviewFlow better.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-sm">
              <ArrowLeft size={16} />Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h1 className="font-bold text-2xl text-gray-900 mb-2">Send Feedback</h1>
            <p className="text-gray-500 text-sm mb-8">Found a bug or have a suggestion? Help us improve ReviewFlow.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Feedback Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {feedbackTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.type === t.value;
                    return (
                      <button key={t.value} type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: t.value }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center ${
                          isSelected ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 hover:border-teal-300 text-gray-500"
                        }`}>
                        <Icon size={20} />
                        <span className="text-sm font-medium">{t.label}</span>
                        <span className="text-xs opacity-70">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea required rows={6}
                  placeholder="Describe the bug or your suggestion in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="email" placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>

              <button type="submit" disabled={submitting || !formData.message.trim()}
                className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                <Send size={16} />{submitting ? "Sending..." : "Send Feedback"}
              </button>

              <p className="text-xs text-gray-400 text-center">Your email address will not be shared with third parties.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
