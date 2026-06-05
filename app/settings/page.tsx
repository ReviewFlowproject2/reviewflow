"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Save, CheckCircle, AlertTriangle, Eye, EyeOff,
  Building2, Link as LinkIcon, Lock, CreditCard, Zap, Star,
  LogOut, ChevronRight
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"clinic" | "security" | "billing">("clinic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Clinic info
  const [clinicName, setClinicName] = useState("");
  const [googleLink, setGoogleLink] = useState("");
  const [originalClinicName, setOriginalClinicName] = useState("");
  const [originalGoogleLink, setOriginalGoogleLink] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Billing
  const [plan, setPlan] = useState("free");
  const [trialEnds, setTrialEnds] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (biz) {
        setClinicName(biz.name || "");
        setOriginalClinicName(biz.name || "");
        setGoogleLink(biz.google_review_link || "");
        setOriginalGoogleLink(biz.google_review_link || "");
        setPlan(biz.plan || "free");
        setTrialEnds(biz.trial_ends_at ? new Date(biz.trial_ends_at).toLocaleDateString() : "");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveClinicInfo = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("businesses")
      .update({ name: clinicName, google_review_link: googleLink })
      .eq("user_id", user.id);

    if (error) {
      showToast(error.message, "error");
    } else {
      setOriginalClinicName(clinicName);
      setOriginalGoogleLink(googleLink);
      showToast("Clinic info saved successfully", "success");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showToast(error.message, "error");
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully", "success");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const hasChanges = clinicName !== originalClinicName || googleLink !== originalGoogleLink;

  const planDetails = {
    free: { name: "Free", price: "$0", color: "text-gray-500", bg: "bg-gray-50", features: ["QR code", "Basic dashboard", "50 patients"] },
    pro: { name: "Pro", price: "$39/mo", color: "text-brand-blue", bg: "bg-brand-soft", features: ["Everything in Free", "Email automation", "1,000 patients", "Review alerts", "Competitor tracking"] },
    agency: { name: "Agency", price: "$69/mo", color: "text-amber-600", bg: "bg-amber-50", features: ["Everything in Pro", "Multi-clinic", "White-label", "API access", "10,000 patients"] },
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.free;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-brand-muted">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-8">Settings</h1>

        {/* Toast */}
        {toast && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${toast.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-brand-soft/50 p-1 mb-6">
          {(["clinic", "security", "billing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab ? "bg-brand-blue text-white" : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              {tab === "clinic" && "Clinic Info"}
              {tab === "security" && "Security"}
              {tab === "billing" && "Billing"}
            </button>
          ))}
        </div>

        {/* Clinic Info Tab */}
        {activeTab === "clinic" && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-blue">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-brand-dark">Clinic Information</h2>
                <p className="text-xs text-brand-muted">Update your clinic name and Google Review link</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Smile Bright Dental"
                  className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                  Google Review Link <span className="text-brand-muted font-normal">(required for QR code)</span>
                </label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type="url"
                    value={googleLink}
                    onChange={(e) => setGoogleLink(e.target.value)}
                    placeholder="https://g.page/.../review"
                    className="w-full rounded-xl border border-brand-soft pl-10 pr-3 py-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
                <p className="text-xs text-brand-muted mt-1.5">
                  Find your link: Google Maps → Your Business → "Write a review" → Copy URL
                </p>
              </div>

              <button
                onClick={saveClinicInfo}
                disabled={saving || !hasChanges}
                className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-blue">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-brand-dark">Change Password</h2>
                <p className="text-xs text-brand-muted">Update your account password</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-brand-soft p-3 pr-10 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <button
                onClick={changePassword}
                disabled={saving || !newPassword || !confirmPassword}
                className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-soft/50">
              <button
                onClick={handleLogout}
                className="w-full py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <LogOut size={16} />Log Out of All Devices
              </button>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className={`bg-white rounded-2xl border-2 p-6 ${plan === "agency" ? "border-amber-400" : plan === "pro" ? "border-brand-blue" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${currentPlan.bg} flex items-center justify-center ${currentPlan.color}`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-brand-dark">Current Plan</h2>
                    <p className="text-xs text-brand-muted">{trialEnds ? `Trial ends: ${trialEnds}` : "Active subscription"}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentPlan.bg} ${currentPlan.color}`}>
                  {currentPlan.name}
                </span>
              </div>

              <div className="mb-4">
                <span className="font-outfit font-bold text-3xl text-brand-dark">{currentPlan.price}</span>
                {plan !== "free" && <span className="text-brand-muted text-sm"> /month</span>}
              </div>

              <ul className="space-y-2 mb-6">
                {currentPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-brand-dark">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>

              {plan !== "agency" && (
                <Link
                  href="/dashboard/support"
                  className={`block w-full text-center py-2.5 font-semibold rounded-xl text-sm transition-colors inline-flex items-center justify-center gap-2 ${
                    plan === "free"
                      ? "bg-brand-blue text-white hover:bg-brand-dark"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  <Zap size={16} />
                  Upgrade to {plan === "free" ? "Pro" : "Agency"}
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>

            {/* Billing History Placeholder */}
            <div className="bg-white rounded-2xl border border-brand-soft/50 p-6">
              <h3 className="font-semibold text-brand-dark text-sm mb-4">Billing History</h3>
              <div className="text-center py-8">
                <p className="text-sm text-brand-muted">No billing history yet.</p>
                <p className="text-xs text-brand-muted/60 mt-1">Invoices will appear here after your first payment.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
