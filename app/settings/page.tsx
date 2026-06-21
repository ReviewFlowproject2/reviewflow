"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { getEffectivePlan, PLAN_INFO, PLAN_LIMITS, getLimit, type EffectivePlan, type PlanTier } from "@/lib/plan-config";
import { ArrowLeft, Save, CheckCircle, AlertTriangle, Eye, EyeOff, Building2, Link as LinkIcon, Lock, CreditCard, Zap, LogOut, X, BarChart3, Users, Star } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"clinic" | "security" | "billing">("clinic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [googleLink, setGoogleLink] = useState("");
  const [phone, setPhone] = useState("");
  const [originalClinicName, setOriginalClinicName] = useState("");
  const [originalGoogleLink, setOriginalGoogleLink] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState("free");
  const [trialEnds, setTrialEnds] = useState("");
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan>(getEffectivePlan(null));
  const [usage, setUsage] = useState({ patients: 0, competitors: 0, clinics: 0 });

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: biz } = await supabase.from("businesses").select("*").eq("user_id", user.id).single();
      if (biz) {
        setClinicName(biz.name || ""); setOriginalClinicName(biz.name || "");
        setGoogleLink(biz.google_review_link || ""); setOriginalGoogleLink(biz.google_review_link || "");
        setPhone(biz.owner_phone || ""); setOriginalPhone(biz.owner_phone || "");
        setPlan(biz.plan || "free");
        setTrialEnds(biz.trial_ends_at ? new Date(biz.trial_ends_at).toLocaleDateString() : "");
        setEffectivePlan(getEffectivePlan(biz));
      }
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

  const showToast = (m: string, t: "success" | "error") => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000); };

  const saveClinicInfo = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
    let error: any = null;
    if (existing) {
      const res = await supabase.from("businesses").update({ name: clinicName, google_review_link: googleLink, owner_phone: phone }).eq("user_id", user.id);
      error = res.error;
    } else {
      const res = await supabase.from("businesses").insert({ name: clinicName, google_review_link: googleLink, owner_phone: phone, owner_email: user.email!, user_id: user.id });
      error = res.error;
    }
    if (error) { showToast(error.message, "error"); } else { setOriginalClinicName(clinicName); setOriginalGoogleLink(googleLink); setOriginalPhone(phone); showToast("Clinic info saved", "success"); }
    setSaving(false);
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) { showToast("Passwords do not match", "error"); return; }
    if (newPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { showToast(error.message, "error"); } else { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); showToast("Password updated", "success"); }
    setSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const hasChanges = clinicName !== originalClinicName || googleLink !== originalGoogleLink || phone !== originalPhone;

  const inputClass = "w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-500/10 text-red-400 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-8 shadow-sm">
          {[
            { key: "clinic", label: "Clinic Info", icon: Building2 },
            { key: "security", label: "Security", icon: Lock },
            { key: "billing", label: "Billing", icon: CreditCard },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Clinic Info */}
        {activeTab === "clinic" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <label className={labelClass}><Building2 size={14} className="inline mr-1" />Clinic Name</label>
              <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Your clinic name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><LinkIcon size={14} className="inline mr-1" />Google Review Link</label>
              <input type="url" value={googleLink} onChange={(e) => setGoogleLink(e.target.value)} placeholder="https://g.page/your-clinic" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className={inputClass} />
            </div>
            <button onClick={saveClinicInfo} disabled={saving || !hasChanges}
              className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <Save size={16} />{saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Tab: Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Change Password</h2>
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6}
                  className={inputClass} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass} placeholder="Re-enter new password" />
              </div>
              <button onClick={savePassword} disabled={saving || !currentPassword || !newPassword}
                className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                <Save size={16} />{saving ? "Updating..." : "Update Password"}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
              <h2 className="font-bold text-lg text-red-400 mb-2">Sign Out</h2>
              <p className="text-sm text-slate-500 mb-4">You will be redirected to the login page.</p>
              <button onClick={handleLogout}
                className="px-6 py-2.5 border-2 border-red-200 text-red-400 font-semibold rounded-full text-sm hover:bg-red-500/10 transition-colors inline-flex items-center gap-2">
                <LogOut size={16} />Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Tab: Billing */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className={`bg-white rounded-2xl border-2 p-6 shadow-sm ${effectivePlan.tier === "agency" ? "border-amber-400" : effectivePlan.tier === "pro" ? "border-emerald-500" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-xl text-slate-900 capitalize">{effectivePlan.tier} Plan</h2>
                  {trialEnds && <p className="text-sm text-slate-500">Trial ends: {trialEnds}</p>}
                </div>
                {effectivePlan.tier !== "agency" && (
                  <Link href="/dashboard/support" className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-full text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1.5">
                    <Zap size={14} />Upgrade
                  </Link>
                )}
              </div>

              {/* Usage bars */}
              <div className="space-y-3">
                {[
                  { label: "Patients", used: usage.patients, limit: getLimit(effectivePlan, "maxPatients"), icon: Users },
                  { label: "Competitors", used: usage.competitors, limit: getLimit(effectivePlan, "maxCompetitors"), icon: BarChart3 },
                  { label: "Clinics", used: usage.clinics, limit: getLimit(effectivePlan, "maxClinics"), icon: Building2 },
                ].map((item, i) => {
                  const pct = item.limit > 0 ? Math.min(100, (item.used / item.limit) * 100) : 100;
                  const isOver = item.used > item.limit;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 flex items-center gap-1.5"><item.icon size={14} />{item.label}</span>
                        <span className={isOver ? "text-red-500 font-semibold" : "text-slate-500"}>{item.used} / {item.limit}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? "bg-red-500/100" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
