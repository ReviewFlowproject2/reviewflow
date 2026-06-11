"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { getEffectivePlan, PLAN_INFO, PLAN_LIMITS, getLimit, type EffectivePlan, type PlanTier } from "@/lib/plan-config";
import {
  ArrowLeft, Save, CheckCircle, AlertTriangle, Eye, EyeOff,
  Building2, Link as LinkIcon, Lock, CreditCard, Zap,
  LogOut, ChevronRight, X, BarChart3, Users
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
  const [phone, setPhone] = useState("");
  const [originalClinicName, setOriginalClinicName] = useState("");
  const [originalGoogleLink, setOriginalGoogleLink] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Billing
  const [plan, setPlan] = useState("free");
  const [trialEnds, setTrialEnds] = useState("");
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan>(getEffectivePlan(null));
  // 用量统计
  const [usage, setUsage] = useState({ patients: 0, competitors: 0, clinics: 0 });

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
        setPhone(biz.owner_phone || "");
        setOriginalPhone(biz.owner_phone || "");
        setPlan(biz.plan || "free");
        setTrialEnds(biz.trial_ends_at ? new Date(biz.trial_ends_at).toLocaleDateString() : "");
        setEffectivePlan(getEffectivePlan(biz));
      }

      // 拉取用量统计
      const bizId = biz?.id || user.id;
      const [{ count: pCount }, { count: cCount }, { count: clCount }] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }).eq("business_id", bizId),
        supabase.from("competitors").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("clinics").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
      ]);
      setUsage({ patients: pCount || 0, competitors: cCount || 0, clinics: clCount || 0 });

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

    // 先查询是否存在 business 记录
    const { data: existing } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let error: any = null;

    if (existing) {
      // 存在则更新
      const res = await supabase
        .from("businesses")
        .update({ name: clinicName, google_review_link: googleLink, owner_phone: phone })
        .eq("user_id", user.id);
      error = res.error;
    } else {
      // 不存在 → 通过服务端 API 创建（绕过 RLS）
      try {
        const res = await fetch("/api/business/ensure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: clinicName, googleLink, phone }),
        });
        const result = await res.json();
        if (!result.success) {
          error = { message: result.error || "Failed to create clinic" };
        }
      } catch (e: any) {
        error = { message: e.message || "Network error" };
      }
    }

    if (error) {
      showToast(error.message, "error");
    } else {
      setOriginalClinicName(clinicName);
      setOriginalGoogleLink(googleLink);
      setOriginalPhone(phone);
      showToast("Clinic info saved successfully", "success");
      // 清除 dashboard 的 clinic 提示
      localStorage.setItem("reviewflow_clinic_banner_dismissed", "true");
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

  const hasChanges = clinicName !== originalClinicName || googleLink !== originalGoogleLink || phone !== originalPhone;

  const planDetails = PLAN_INFO;

  const currentPlan = planDetails[plan as PlanTier] || planDetails.free;

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
                <p className="text-xs text-brand-muted">Update your clinic info, phone number, and Google Review link</p>
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
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
                {!phone && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} /> Add your phone — used for SMS alerts and support
                  </p>
                )}
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
            {/* Current Plan Card */}
            <div className={`bg-white rounded-2xl border-2 p-6 ${plan === "agency" ? "border-amber-400" : plan === "pro" ? "border-brand-blue" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${currentPlan.bg} flex items-center justify-center ${currentPlan.color}`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-brand-dark">Current Plan</h2>
                    <p className="text-xs text-brand-muted">
                      {effectivePlan.isPaid ? "Active subscription" :
                       effectivePlan.isTrialActive ? `Trial: ${effectivePlan.trialEndsAt ? new Date(effectivePlan.trialEndsAt).toLocaleDateString() : ""}` :
                       trialEnds ? `Trial ended: ${trialEnds}` : "Free plan"}
                    </p>
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
              {plan !== "agency" && (
                <Link href="/dashboard/support"
                  className={`block w-full text-center py-2.5 font-semibold rounded-xl text-sm transition-colors inline-flex items-center justify-center gap-2 ${plan === "free" ? "bg-brand-blue text-white hover:bg-brand-dark" : "bg-amber-500 text-white hover:bg-amber-600"}`}>
                  <Zap size={16} />Upgrade to {plan === "free" ? "Pro" : "Agency"}<ChevronRight size={16} />
                </Link>
              )}
            </div>

            {/* Usage Meters */}
            <div className="bg-white rounded-2xl border border-brand-soft/50 p-6">
              <h3 className="font-semibold text-brand-dark text-sm mb-5">Plan Usage</h3>
              <div className="space-y-5">
                {[
                  { label: "Patients", used: usage.patients, max: getLimit(effectivePlan, "maxPatients"), icon: Users },
                  { label: "Competitors", used: usage.competitors, max: getLimit(effectivePlan, "maxCompetitors"), icon: BarChart3 },
                  { label: "Clinics", used: usage.clinics, max: getLimit(effectivePlan, "maxClinics"), icon: Building2 },
                ].map((item) => {
                  const pct = item.max > 0 ? Math.min(100, Math.round((item.used / item.max) * 100)) : 0;
                  const full = item.used >= item.max;
                  const warn = pct >= 90;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <item.icon size={14} className={full ? "text-red-500" : warn ? "text-amber-500" : "text-brand-muted"} />
                          <span className="text-sm font-medium text-brand-dark">{item.label}</span>
                        </div>
                        <span className={`text-xs font-semibold ${full ? "text-red-500" : warn ? "text-amber-500" : "text-brand-muted"}`}>
                          {item.used} / {item.max === Infinity ? "∞" : item.max}
                          {full && " · Limit reached"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${full ? "bg-red-500" : warn ? "bg-amber-500" : "bg-brand-blue"}`}
                          style={{ width: `${item.max === Infinity ? 0 : pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feature checklist */}
              <h3 className="font-semibold text-brand-dark text-sm mt-7 mb-4">Plan Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Email Automation", ok: effectivePlan.limits.emailAutomation },
                  { label: "Review Alerts", ok: effectivePlan.limits.reviewAlerts },
                  { label: `Competitor Tracking (${getLimit(effectivePlan, "maxCompetitors")})`, ok: getLimit(effectivePlan, "maxCompetitors") > 1 },
                  { label: `Patients (${getLimit(effectivePlan, "maxPatients").toLocaleString()})`, ok: true },
                  { label: "Multi-Clinic", ok: effectivePlan.limits.multiClinic },
                  { label: "White-Label", ok: effectivePlan.limits.whiteLabel },
                  { label: "API Access", ok: effectivePlan.limits.apiAccess },
                  { label: "Daily Digest", ok: effectivePlan.limits.dailyDigest },
                  { label: "Priority Alerts", ok: effectivePlan.limits.priorityAlerts },
                  { label: "Export Reports", ok: effectivePlan.limits.exportReports },
                  { label: "Remove Branding", ok: effectivePlan.limits.removeBranding },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 py-1">
                    {f.ok ? <CheckCircle size={12} className="text-green-500 shrink-0" /> : <X size={12} className="text-gray-300 shrink-0" />}
                    <span className={`text-xs ${f.ok ? "text-brand-dark" : "text-gray-400"}`}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
