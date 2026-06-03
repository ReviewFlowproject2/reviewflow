"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Star,
  MessageCircle,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Check,
  Search,
  Plus,
  LogOut,
  Settings,
  Users,
  Home,
  ExternalLink,
  QrCode,
  Mail,
  X,
  UserCheck,
  Stethoscope,
  RefreshCw,
  Clock,
  Zap,
  CheckSquare,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// ==================== Types ====================
interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  visit_date: string;
  email_status: "pending" | "checked_in" | "ready_to_send" | "sent" | "delivered" | "failed" | "opened";
  review_rating: number | null;
  created_at: string;
  email_sent_count?: number;
  email_sent_at?: string;
}

interface ReviewAlert {
  id: string;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_new: boolean;
  resolved?: boolean;
}

interface Business {
  id: string;
  name: string;
  trial_ends_at: string;
  google_review_link: string;
  plan?: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

// ==================== Toast Component ====================
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border ${
              toast.type === "success"
                ? "bg-white border-green-200 text-green-700"
                : "bg-white border-red-200 text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Sidebar ====================
function Sidebar({ business }: { business: Business | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Import Patients", href: "/patients/import" },
    { icon: QrCode, label: "QR Code", href: "/dashboard/qr-code" },
    { icon: Star, label: "Reviews", href: "/dashboard/feedback" },
    { icon: MessageCircle, label: "Support", href: "/dashboard/support" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const trialDaysLeft = Math.max(0, Math.ceil(
    (new Date("2026-06-20").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  const currentPlan = business?.plan || "free";
  const planLabel = { free: "Free", pro: "Pro", agency: "Agency" }[currentPlan];
  const planColor = { free: "text-gray-500", pro: "text-brand-blue", agency: "text-amber-600" }[currentPlan];
  const showUpgrade = currentPlan !== "agency";
  const upgradeTarget = currentPlan === "free" ? "Pro" : "Agency";
  const upgradeColor = currentPlan === "free" ? "bg-brand-blue hover:bg-brand-dark" : "bg-amber-500 hover:bg-amber-600";

  return (
    <aside className="w-[260px] min-h-screen bg-white border-r border-[#E9F1FA] fixed left-0 top-0 flex flex-col z-40">
      <div className="h-20 flex items-center px-6 border-b border-[#E9F1FA]">
        <Link href="/" className="font-outfit font-bold text-xl text-brand-blue">
          ReviewFlow
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-blue text-white"
                  : "text-brand-muted hover:bg-brand-soft hover:text-brand-dark"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-4 space-y-3">
        <div className="bg-brand-soft rounded-xl p-4">
          <p className="text-xs text-brand-muted mb-1">Trial ends in</p>
          <p className="font-outfit font-bold text-lg text-brand-blue">{trialDaysLeft} days</p>
          <p className="text-xs text-brand-muted mt-1">{business?.name || "Your Clinic"}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-brand-muted mb-1">Current Plan</p>
          <p className={`font-outfit font-bold text-sm ${planColor}`}>{planLabel}</p>
          {showUpgrade && (
            <Link
              href="/pricing"
              className={`mt-2 block w-full text-center py-1.5 text-white text-xs font-semibold rounded-lg transition-colors ${upgradeColor}`}
            >
              Upgrade to {upgradeTarget}
            </Link>
          )}
        </div>
      </div>
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-brand-muted hover:bg-brand-soft hover:text-brand-dark transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}

// ==================== Dashboard Page ====================
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<ReviewAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stats, setStats] = useState({
    newReviews: 0,
    avgRating: 0,
    pendingAlerts: 0,
    emailSuccess: 0,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (biz) setBusiness(biz);

    const businessId = biz?.id || user.id;

    const { data: pts } = await supabase
      .from("patients")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (pts) setPatients(pts);

    // 只查未 resolved 的差评
    const { data: revs } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .eq("resolved", false)
      .lt("rating", 4)
      .order("created_at", { ascending: false })
      .limit(10);

    if (revs) {
      setAlerts(revs.map((r: any) => ({
        id: r.id,
        patient_name: r.patient_name || "Unknown",
        rating: r.rating,
        comment: r.comment || "No comment",
        created_at: r.created_at,
        is_new: true,
        resolved: r.resolved,
      })));
    }

    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("business_id", businessId)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { data: allPatients } = await supabase
      .from("patients")
      .select("email_status")
      .eq("business_id", businessId);

    const newReviewsCount = allReviews?.length || 0;
    const avgRating = allReviews?.length
      ? (allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
      : "0.0";
    const pendingAlertsCount = revs?.length || 0;
    const totalEmail = allPatients?.length || 0;
    const successEmail = allPatients?.filter((p: any) => p.email_status === "delivered" || p.email_status === "opened").length || 0;
    const emailRate = totalEmail > 0 ? Math.round((successEmail / totalEmail) * 100) : 0;

    setStats({
      newReviews: newReviewsCount,
      avgRating: parseFloat(avgRating as string),
      pendingAlerts: pendingAlertsCount,
      emailSuccess: emailRate,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 标记差评已处理
  const handleResolveAlert = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      const res = await fetch("/api/reviews/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: alertId }),
      });
      const data = await res.json();

      if (data.success) {
        addToast("Review marked as resolved", "success");
        loadData();
      } else {
        addToast(data.error || "Failed to resolve", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Network error", "error");
    } finally {
      setResolvingId(null);
    }
  };

  // 更新就诊状态
  const updateStatus = async (patientId: string, newStatus: string) => {
    setUpdatingId(patientId);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ email_status: newStatus })
        .eq("id", patientId);

      if (error) throw error;

      addToast(`Status updated to ${newStatus.replace("_", " ")}`, "success");
      loadData();
    } catch (err: any) {
      addToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // 发送邮件
  const handleSendEmail = async (patientId: string, hasEmail: boolean) => {
    if (!hasEmail) {
      addToast("This patient has no email address. Please update patient info.", "error");
      return;
    }

    setSendingId(patientId);
    try {
      const res = await fetch("/api/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json();

      if (data.success) {
        addToast(`Email sent successfully! Status: ${data.status}`, "success");
        loadData();
      } else {
        addToast(data.error || "Failed to send email", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Network error", "error");
    } finally {
      setSendingId(null);
    }
  };

  const statCards = [
    {
      label: "New Reviews (7d)",
      value: stats.newReviews.toString(),
      change: "This week",
      icon: MessageCircle,
      color: "text-brand-blue",
      bg: "bg-brand-blue/10",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating.toFixed(1),
      change: "All time",
      icon: Star,
      color: "text-brand-yellow",
      bg: "bg-brand-yellow/10",
    },
    {
      label: "Negative Reviews",
      value: stats.pendingAlerts.toString(),
      change: "Needs attention",
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Email Success Rate",
      value: `${stats.emailSuccess}%`,
      change: "Delivered/Open",
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50",
    },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-gray-50", text: "text-gray-500", label: "Pending" },
      checked_in: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Checked In" },
      ready_to_send: { bg: "bg-purple-50", text: "text-purple-600", label: "Ready to Send" },
      sent: { bg: "bg-blue-50", text: "text-blue-600", label: "Sent" },
      delivered: { bg: "bg-green-50", text: "text-green-600", label: "Delivered" },
      opened: { bg: "bg-green-50", text: "text-green-600", label: "Opened" },
      failed: { bg: "bg-red-50", text: "text-red-600", label: "Failed" },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        {status === "delivered" && <Check size={12} />}
        {status === "opened" && <Check size={12} />}
        {s.label}
      </span>
    );
  };


  // 删除患者
  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientId);

      if (error) throw error;

      addToast("Patient deleted successfully", "success");
      loadData();
    } catch (err: any) {
      addToast(err.message || "Failed to delete patient", "error");
    }
  };

  const getActionButton = (patient: Patient) => {
    const isUpdating = updatingId === patient.id;
    const isSending = sendingId === patient.id;
    const sentCount = patient.email_sent_count || 0;
    const sentTime = patient.email_sent_at ? new Date(patient.email_sent_at).toLocaleDateString() : null;

    switch (patient.email_status) {
      case "pending":
        return (
          <button
            onClick={() => updateStatus(patient.id, "checked_in")}
            disabled={isUpdating}
            className="rounded-lg text-xs px-3 py-1.5 transition-colors inline-flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 disabled:opacity-50"
          >
            <UserCheck size={12} />
            {isUpdating ? "Updating..." : "Check In"}
          </button>
        );

      case "checked_in":
        return (
          <button
            onClick={() => updateStatus(patient.id, "ready_to_send")}
            disabled={isUpdating}
            className="rounded-lg text-xs px-3 py-1.5 transition-colors inline-flex items-center gap-1 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
          >
            <Stethoscope size={12} />
            {isUpdating ? "Updating..." : "Complete Visit"}
          </button>
        );

      case "ready_to_send":
        return (
          <button
            onClick={() => handleSendEmail(patient.id, !!patient.email)}
            disabled={isSending || !patient.email}
            className={`rounded-lg text-xs px-3 py-1.5 transition-colors inline-flex items-center gap-1 disabled:opacity-50 ${
              patient.email
                ? "text-brand-blue hover:bg-brand-soft"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <Mail size={12} />
            {isSending ? "Sending..." : patient.email ? "Send Email" : "No Email"}
          </button>
        );

      case "sent":
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleSendEmail(patient.id, !!patient.email)}
              disabled={isSending}
              className="rounded-lg text-xs px-3 py-1.5 transition-colors inline-flex items-center gap-1 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={12} />
              {isSending ? "Sending..." : "Resend"}
            </button>
            {sentCount > 0 && (
              <span className="text-xs text-gray-400 leading-none">x{sentCount}</span>
            )}
          </div>
        );

      case "delivered":
      case "opened":
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleSendEmail(patient.id, !!patient.email)}
              disabled={isSending}
              className="rounded-lg text-xs px-3 py-1.5 transition-colors inline-flex items-center gap-1 text-green-500 hover:bg-green-50 disabled:opacity-50"
            >
              <RefreshCw size={12} />
              {isSending ? "Sending..." : "Resend"}
            </button>
            {sentTime && (
              <span className="text-xs text-gray-400 flex items-center gap-1 leading-none">
                <Clock size={10} />
                {sentTime}
              </span>
            )}
          </div>
        );

      case "failed":
        return (
          <button
            onClick={() => handleSendEmail(patient.id, !!patient.email)}
            disabled={isSending}
            className="rounded-lg text-xs px-3 py-1.5 transition-colors inline-flex items-center gap-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            <AlertTriangle size={12} />
            {isSending ? "Retrying..." : "Retry"}
          </button>
        );

      default:
        return <span className="text-xs text-brand-muted/50">-</span>;
    }
  };


  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const currentPlan = business?.plan || "free";
  const showTopBanner = currentPlan !== "agency";
  const upgradeTarget = currentPlan === "free" ? "Pro" : "Agency";
  const bannerColor = currentPlan === "free" ? "bg-brand-blue" : "bg-amber-500";
  const bannerText = currentPlan === "free" 
    ? "You're on the Free plan. Upgrade to Pro to automate review requests and monitor your reputation."
    : "You're on Pro. Upgrade to Agency to unlock Daily Digest, Priority SMS Alerts, and team management.";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-brand-muted">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex">
      <Sidebar business={business} />

      <main className="flex-1 ml-[260px] p-6 lg:p-8 max-w-7xl">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Top Upgrade Banner */}
        {showTopBanner && (
          <div className={`${bannerColor} rounded-2xl p-4 mb-6 flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-white shrink-0" />
              <p className="text-white text-sm font-medium">{bannerText}</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-2 bg-white text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              style={{ color: bannerColor === "bg-brand-blue" ? "#2563eb" : "#d97706" }}
            >
              Upgrade to {upgradeTarget}
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-outfit font-bold text-2xl text-brand-dark">Overview</h1>
            <p className="text-brand-muted text-sm mt-1">
              Welcome back, {business?.name || "Your Clinic"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/patients/import"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
            >
              <Plus size={16} />
              Import Patients
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 border border-brand-soft/50 transition-all duration-200 hover:shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-brand-muted bg-brand-soft px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="font-outfit font-bold text-2xl text-brand-dark">{stat.value}</div>
              <div className="text-sm text-brand-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-brand-yellow" />
              <h2 className="font-outfit font-semibold text-lg text-brand-dark">Negative Review Alerts</h2>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                {alerts.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-2xl p-5 border border-brand-yellow shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-brand-dark">{alert.patient_name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < alert.rating ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}
                            />
                          ))}
                        </div>
                        <span className="text-xs bg-brand-yellow text-brand-blue px-2 py-0.5 rounded-full font-semibold">
                          NEW
                        </span>
                      </div>
                      <p className="text-sm text-brand-muted line-clamp-2">{alert.comment}</p>
                      <span className="text-xs text-brand-muted/60 mt-1 block">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={resolvingId === alert.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <CheckSquare size={14} />
                        {resolvingId === alert.id ? "Resolving..." : "Mark Resolved"}
                      </button>
                      <a
                        href={business?.google_review_link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
                      >
                        <ExternalLink size={14} />
                        Reply on Google
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient List */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 overflow-hidden">
          <div className="p-5 border-b border-brand-soft/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-outfit font-semibold text-lg text-brand-dark">Recent Patients</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 w-full sm:w-64 h-10 rounded-xl border border-brand-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-soft/50">
                  <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Visit Date</th>
                  <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Rating</th>
                  <th className="text-right text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-brand-soft/30 hover:bg-[#FAFCFF] transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-brand-dark">{patient.name}</td>
                    <td className="px-5 py-4 text-sm text-brand-muted">{patient.phone}</td>
                    <td className="px-5 py-4 text-sm text-brand-muted">
                      {patient.email || <span className="text-red-400 text-xs">No email</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-brand-muted">
                      {new Date(patient.visit_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(patient.email_status)}</td>
                    <td className="px-5 py-4">
                      {patient.review_rating ? (
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < patient.review_rating! ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-brand-muted/50">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getActionButton(patient)}
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Delete patient"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-brand-muted">
                      No patients found. <Link href="/patients/import" className="text-brand-blue hover:underline">Import patients</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-brand-soft/50">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-brand-dark">{patient.name}</span>
                  {getStatusBadge(patient.email_status)}
                </div>
                <div className="text-sm text-brand-muted mb-1">
                  {patient.phone}
                </div>
                <div className="text-sm text-brand-muted mb-2">
                  {patient.email || <span className="text-red-400 text-xs">No email</span>}
                  {" · "}
                  {new Date(patient.visit_date).toLocaleDateString()}
                </div>
                <div className="mb-2 flex items-center justify-between">
                  {getActionButton(patient)}
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    title="Delete patient"
                  >
                    <X size={14} />
                  </button>
                </div>
                {patient.review_rating && (
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < patient.review_rating! ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-sm text-brand-muted">
                No patients found. <Link href="/patients/import" className="text-brand-blue hover:underline">Import patients</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
