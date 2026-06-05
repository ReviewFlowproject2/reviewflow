"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Plus, Building2, Star, Users, Trash2, CheckCircle,
  AlertTriangle, ExternalLink
} from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  address: string;
  google_review_link: string;
  review_count: number;
  avg_rating: number;
  is_primary: boolean;
  created_at: string;
}

export default function MultiClinicPage() {
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newGoogleLink, setNewGoogleLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState("free");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadClinics = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: biz } = await supabase
      .from("businesses")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (biz) setPlan(biz.plan || "free");

    // 获取所有关联的诊所
    const { data } = await supabase
      .from("clinics")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      // 计算每个诊所的评论数
      const enriched = await Promise.all(
        data.map(async (c: any) => {
          const { count } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", c.id);

          const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("business_id", c.id);

          const avg = reviews?.length
            ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : "0.0";

          return { ...c, review_count: count || 0, avg_rating: parseFloat(avg) };
        })
      );
      setClinics(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { loadClinics(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("clinics").insert({
      owner_id: user.id,
      name: newName.trim(),
      address: newAddress.trim() || null,
      google_review_link: newGoogleLink.trim() || null,
      is_primary: clinics.length === 0,
    });

    if (!error) {
      setNewName("");
      setNewAddress("");
      setNewGoogleLink("");
      setShowAddForm(false);
      loadClinics();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this clinic? All associated data will be removed.")) return;
    await supabase.from("clinics").delete().eq("id", id);
    loadClinics();
  };

  const handleSwitchClinic = (clinicId: string) => {
    // 切换当前诊所上下文（通过 localStorage 或 cookie）
    localStorage.setItem("reviewflow_active_clinic", clinicId);
    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-brand-muted">Loading clinics...</div>
      </div>
    );
  }

  if (plan !== "agency") {
    return (
      <div className="min-h-screen bg-[#F8FAFF] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue transition-colors">
              <ArrowLeft size={16} />Back to Dashboard
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="font-outfit font-bold text-xl text-brand-dark mb-2">Agency Plan Required</h1>
            <p className="text-brand-muted text-sm mb-6">Multi-clinic management is only available on the Agency plan.</p>
            <Link href="/dashboard/support" className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors">
              Upgrade to Agency
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-outfit font-bold text-2xl text-brand-dark">Multi-Clinic Dashboard</h1>
            <p className="text-brand-muted text-sm mt-1">Manage all your dental offices in one place.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} />{showAddForm ? "Cancel" : "Add Clinic"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-brand-soft/50">
            <p className="text-xs text-brand-muted mb-1">Total Clinics</p>
            <p className="font-outfit font-bold text-2xl text-brand-dark">{clinics.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-brand-soft/50">
            <p className="text-xs text-brand-muted mb-1">Total Reviews</p>
            <p className="font-outfit font-bold text-2xl text-brand-dark">{clinics.reduce((sum, c) => sum + c.review_count, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-brand-soft/50">
            <p className="text-xs text-brand-muted mb-1">Avg Rating</p>
            <p className="font-outfit font-bold text-2xl text-brand-dark">
              {clinics.length > 0
                ? (clinics.reduce((sum, c) => sum + c.avg_rating, 0) / clinics.length).toFixed(1)
                : "0.0"}
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
            <h3 className="font-semibold text-brand-dark text-sm mb-4">Add New Clinic</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Clinic Name *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Downtown Dental" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Address</label>
                <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="e.g. 456 Oak St, Austin, TX" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Google Review Link</label>
                <input type="url" value={newGoogleLink} onChange={(e) => setNewGoogleLink(e.target.value)} placeholder="https://g.page/.../review" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving || !newName.trim()} className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center gap-2">
              <Plus size={16} />{saving ? "Saving..." : "Add Clinic"}
            </button>
          </div>
        )}

        {/* Clinics Grid */}
        {clinics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-12 text-center">
            <Building2 className="mx-auto text-brand-muted mb-3" size={40} />
            <h3 className="font-semibold text-brand-dark mb-1">No clinics added yet</h3>
            <p className="text-sm text-brand-muted mb-4">Add your first clinic to start managing multiple locations.</p>
            <button onClick={() => setShowAddForm(true)} className="px-5 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors inline-flex items-center gap-2">
              <Plus size={16} />Add First Clinic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinics.map((clinic) => (
              <div key={clinic.id} className={`bg-white rounded-2xl border p-6 transition-shadow hover:shadow-lg ${clinic.is_primary ? "border-brand-blue border-2" : "border-brand-soft/50"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-blue">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-dark text-sm">{clinic.name}</h3>
                      {clinic.is_primary && <span className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded-full">Primary</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(clinic.id)} className="text-brand-muted hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-brand-soft rounded-lg p-3 text-center">
                    <p className="font-outfit font-bold text-lg text-brand-blue">{clinic.avg_rating.toFixed(1)}</p>
                    <p className="text-xs text-brand-muted">Avg Rating</p>
                  </div>
                  <div className="bg-brand-soft rounded-lg p-3 text-center">
                    <p className="font-outfit font-bold text-lg text-brand-blue">{clinic.review_count}</p>
                    <p className="text-xs text-brand-muted">Reviews</p>
                  </div>
                </div>

                {clinic.address && <p className="text-xs text-brand-muted mb-3">{clinic.address}</p>}

                <button
                  onClick={() => handleSwitchClinic(clinic.id)}
                  className="w-full py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />Switch to This Clinic
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
