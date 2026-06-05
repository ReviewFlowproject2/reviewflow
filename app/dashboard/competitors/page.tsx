"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Search, Plus, Star, TrendingUp,
  MapPin, Trash2
} from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  address: string;
  google_link?: string;
  rating: number;
  review_count: number;
  platform: string;
  created_at: string;
}

export default function CompetitorTrackingPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newRating, setNewRating] = useState("");
  const [newReviews, setNewReviews] = useState("");
  const [newGoogleLink, setNewGoogleLink] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadCompetitors = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data } = await supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setCompetitors(data);
    setLoading(false);
  };

  useEffect(() => { loadCompetitors(); }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !newRating || !newReviews) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("competitors").insert({
      user_id: user.id,
      name: newName.trim(),
      address: newAddress.trim() || null,
      google_link: newGoogleLink.trim() || null,
      rating: parseFloat(newRating),
      review_count: parseInt(newReviews),
      platform: "Google",
    });

    if (!error) {
      setNewName("");
      setNewAddress("");
      setNewRating("");
      setNewReviews("");
      setNewGoogleLink("");
      setShowAddForm(false);
      loadCompetitors();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this competitor?")) return;
    await supabase.from("competitors").delete().eq("id", id);
    loadCompetitors();
  };

  const avgRating = competitors.length > 0
    ? (competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length).toFixed(1)
    : "0.0";

  const totalReviews = competitors.reduce((sum, c) => sum + c.review_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-brand-muted">Loading competitors...</div>
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
            <h1 className="font-outfit font-bold text-2xl text-brand-dark">Competitor Tracking</h1>
            <p className="text-brand-muted text-sm mt-1">Monitor nearby dental offices and stay ahead.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} />{showAddForm ? "Cancel" : "Add Competitor"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-brand-soft/50">
            <p className="text-xs text-brand-muted mb-1">Tracking</p>
            <p className="font-outfit font-bold text-2xl text-brand-dark">{competitors.length}</p>
            <p className="text-xs text-brand-muted">competitors</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-brand-soft/50">
            <p className="text-xs text-brand-muted mb-1">Avg Rating</p>
            <p className="font-outfit font-bold text-2xl text-brand-dark">{avgRating}</p>
            <p className="text-xs text-brand-muted">across competitors</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-brand-soft/50">
            <p className="text-xs text-brand-muted mb-1">Total Reviews</p>
            <p className="font-outfit font-bold text-2xl text-brand-dark">{totalReviews.toLocaleString()}</p>
            <p className="text-xs text-brand-muted">combined</p>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
            <h3 className="font-semibold text-brand-dark text-sm mb-4">Add New Competitor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Clinic Name *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Bright Smile Dental" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Address</label>
                <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="e.g. 123 Main St, Houston, TX" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Rating *</label>
                <input type="number" step="0.1" min="1" max="5" value={newRating} onChange={(e) => setNewRating(e.target.value)} placeholder="e.g. 4.2" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Review Count *</label>
                <input type="number" min="0" value={newReviews} onChange={(e) => setNewReviews(e.target.value)} placeholder="e.g. 127" className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Google Maps Link <span className="text-brand-muted font-normal">(optional, click to check their latest reviews)</span></label>
                <input type="url" value={newGoogleLink} onChange={(e) => setNewGoogleLink(e.target.value)} placeholder="https://www.google.com/maps/place/..." className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving || !newName.trim() || !newRating || !newReviews} className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center gap-2">
              <Plus size={16} />{saving ? "Saving..." : "Add Competitor"}
            </button>
          </div>
        )}

        {/* Competitors List */}
        {competitors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-12 text-center">
            <Search className="mx-auto text-brand-muted mb-3" size={40} />
            <h3 className="font-semibold text-brand-dark mb-1">No competitors tracked yet</h3>
            <p className="text-sm text-brand-muted mb-4">Add nearby dental offices to compare ratings and reviews.</p>
            <button onClick={() => setShowAddForm(true)} className="px-5 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors inline-flex items-center gap-2">
              <Plus size={16} />Add Your First Competitor
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-soft/50 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-soft/50">
                    <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Clinic</th>
                    <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Rating</th>
                    <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Reviews</th>
                    <th className="text-left text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Address</th>
                    <th className="text-right text-xs font-semibold text-brand-muted uppercase tracking-wider px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c) => (
                    <tr key={c.id} className="border-b border-brand-soft/30 hover:bg-[#FAFCFF] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-brand-dark">{c.name}</p>
                        <p className="text-xs text-brand-muted">{c.platform}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < Math.round(c.rating) ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"} />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-brand-dark">{c.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-brand-dark">{c.review_count.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-brand-muted">
                        {c.address || "—"}
                        {c.google_link && (
                          <a href={c.google_link} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline text-xs block mt-1">
                            View on Google Maps →
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDelete(c.id)} className="text-brand-muted hover:text-red-500 transition-colors p-1" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-brand-soft/50">
              {competitors.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-brand-dark">{c.name}</span>
                    <button onClick={() => handleDelete(c.id)} className="text-brand-muted hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < Math.round(c.rating) ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-brand-dark">{c.rating.toFixed(1)}</span>
                    <span className="text-xs text-brand-muted">({c.review_count.toLocaleString()} reviews)</span>
                  </div>
                  {c.address && <p className="text-xs text-brand-muted">{c.address}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
