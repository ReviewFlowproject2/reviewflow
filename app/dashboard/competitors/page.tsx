"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { getEffectivePlan, getLimit, type EffectivePlan } from "@/lib/plan-config";
import {
  ArrowLeft, Search, Plus, Star, TrendingUp,
  MapPin, Trash2, Link as LinkIcon, Wand2,
  Lock, RefreshCw, Globe, AlertTriangle,
  CheckCircle, Clock, ExternalLink
} from "lucide-react";

// ==================== Types ====================
interface Competitor {
  id: string;
  name: string;
  address: string;
  google_link?: string;
  place_id?: string;
  rating: number;
  review_count: number;
  platform: string;
  created_at: string;
  data_refreshed_at?: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  address: string;
  rating: number;
  review_count: number;
}

// ==================== Component ====================
export default function CompetitorTrackingPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan>(getEffectivePlan(null));

  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<"search" | "url" | "manual">("search");
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newRating, setNewRating] = useState("");
  const [newReviews, setNewReviews] = useState("");
  const [newGoogleLink, setNewGoogleLink] = useState("");
  const [newPlaceId, setNewPlaceId] = useState("");
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadCompetitors = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    try {
      const res = await fetch("/api/business/ensure", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (data.success) setEffectivePlan(getEffectivePlan(data.business));
    } catch (e) { console.error(e); }

    const { data } = await supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setCompetitors(data);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadCompetitors(); }, [loadCompetitors]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/google/places?action=search&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
        if (data.results.length === 0) setSearchError("No dental clinics found. Try a different search.");
      } else {
        setSearchError(data.error || "Search failed");
      }
    } catch (e: any) {
      setSearchError(e.message || "Network error");
    }
    setSearching(false);
  };

  const selectSearchResult = (place: GooglePlace) => {
    setNewName(place.name);
    setNewAddress(place.address);
    setNewRating(place.rating.toString());
    setNewReviews(place.review_count.toString());
    setNewPlaceId(place.place_id);
    setNewGoogleLink(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`);
    setSearchResults([]);
    setAddMode("manual");
  };

  const handleUrlParse = async () => {
    if (!newGoogleLink.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/google/places?action=parse-url&url=${encodeURIComponent(newGoogleLink)}`);
      const data = await res.json();
      if (data.success && data.place) {
        setNewName(data.place.name);
        setNewAddress(data.place.address);
        setNewRating(data.place.rating.toString());
        setNewReviews(data.place.review_count.toString());
        setNewPlaceId(data.place.place_id);
      } else {
        setSearchError(data.error || "Could not find this place on Google Maps");
      }
    } catch (e: any) {
      setSearchError(e.message || "Network error");
    }
    setSearching(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ratingVal = parseFloat(newRating) || 0;
    const reviewVal = parseInt(newReviews) || 0;

    const { error } = await supabase.from("competitors").insert({
      user_id: user.id,
      name: newName.trim(),
      address: newAddress.trim() || null,
      google_link: newGoogleLink.trim() || null,
      place_id: newPlaceId || null,
      rating: ratingVal,
      review_count: reviewVal,
      platform: "Google",
      data_refreshed_at: ratingVal > 0 ? new Date().toISOString() : null,
    });

    if (!error) {
      setNewName(""); setNewAddress(""); setNewRating(""); setNewReviews("");
      setNewGoogleLink(""); setNewPlaceId(""); setSearchQuery(""); setSearchResults([]);
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

  const handleRefreshSingle = async (comp: Competitor) => {
    setRefreshingId(comp.id);
    try {
      const res = await fetch("/api/google/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorIds: [comp.id] }),
      });
      const data = await res.json();
      if (data.updated > 0) loadCompetitors();
    } catch (e) { console.error("Refresh error:", e); }
    setRefreshingId(null);
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    const ids = competitors.map(c => c.id);
    try {
      await fetch("/api/google/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorIds: ids }),
      });
      loadCompetitors();
    } catch (e) { console.error("Refresh all error:", e); }
    setRefreshing(false);
  };

  const competitorLimit = getLimit(effectivePlan, "maxCompetitors");
  const atCompetitorLimit = competitors.length >= competitorLimit;
  const canAccess = effectivePlan.tier !== "free";

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors">
              <ArrowLeft size={16} />Back to Dashboard
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="font-bold text-xl text-gray-900 mb-2">Agency Plan Required</h1>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Competitor Tracking with real-time Google data is an Agency-only feature. Upgrade to monitor nearby clinics, track their ratings, and stay ahead of the competition.
            </p>
            <Link href="/dashboard/support" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors">
              <Lock size={16} />Upgrade to Agency
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avgRating = competitors.length > 0
    ? (competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length).toFixed(1)
    : "0.0";
  const totalReviews = competitors.reduce((sum, c) => sum + c.review_count, 0);

  const getFreshness = (refreshedAt?: string) => {
    if (!refreshedAt) return { label: "Manual", color: "text-gray-400", icon: Clock };
    const hours = (Date.now() - new Date(refreshedAt).getTime()) / 3600000;
    if (hours < 1) return { label: "Live", color: "text-green-500", icon: CheckCircle };
    if (hours < 24) return { label: `${Math.floor(hours)}h ago`, color: "text-yellow-500", icon: Clock };
    return { label: `${Math.floor(hours / 24)}d ago`, color: "text-gray-400", icon: Clock };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading competitors...</div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Competitor Tracking</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor nearby dental offices with real-time Google data.</p>
          </div>
          <div className="flex items-center gap-2">
            {competitors.length > 0 && (
              <button onClick={handleRefreshAll} disabled={refreshing}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />{refreshing ? "Refreshing..." : "Refresh All"}
              </button>
            )}
            {atCompetitorLimit ? (
              <Link href="/dashboard/support" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors">
                <Lock size={16} />Upgrade ({competitors.length}/{competitorLimit})
              </Link>
            ) : (
              <button onClick={() => { setShowAddForm(!showAddForm); setAddMode("search"); setSearchResults([]); setSearchError(""); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
                <Plus size={16} />{showAddForm ? "Cancel" : "Add Competitor"}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tracking", value: competitors.length, sub: `/${competitorLimit}` },
            { label: "Avg Rating", value: avgRating },
            { label: "Total Reviews", value: totalReviews.toLocaleString() },
            { label: "Data Source", value: null, icon: Globe, iconColor: "text-green-500", text: "Google Places" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              {stat.value !== null ? (
                <p className="font-bold text-2xl text-gray-900">
                  {stat.value}
                  {stat.sub && <span className="text-sm text-gray-400 font-normal">{stat.sub}</span>}
                </p>
              ) : (
                <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5 mt-1">
                  {stat.icon && <stat.icon size={16} className={stat.iconColor} />}
                  {stat.text}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Add New Competitor</h3>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
              {([
                { key: "search" as const, label: "Search Google", icon: Search },
                { key: "url" as const, label: "Paste URL", icon: LinkIcon },
                { key: "manual" as const, label: "Manual Entry", icon: Plus },
              ]).map(m => (
                <button key={m.key} onClick={() => setAddMode(m.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
                    addMode === m.key ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                  }`}>
                  <m.icon size={13} />{m.label}
                </button>
              ))}
            </div>

            {addMode === "search" && (
              <div>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search dental clinics on Google Maps..." className={`flex-1 ${inputClass}`} />
                  <button onClick={handleSearch} disabled={searching || !searchQuery.trim()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50">
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
                {searchError && <p className="text-xs text-red-500 mb-3">{searchError}</p>}
                {searchResults.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {searchResults.map((place) => (
                      <div key={place.place_id} onClick={() => selectSearchResult(place)}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{place.name}</p>
                          <p className="text-xs text-gray-500">{place.address}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-gray-900">{place.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({place.review_count})</span>
                          </div>
                          <span className="text-xs text-teal-600">+ Add</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {addMode === "url" && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Paste a Google Maps URL and we'll fetch the real-time data.</p>
                <div className="flex gap-2">
                  <input type="url" value={newGoogleLink} onChange={(e) => setNewGoogleLink(e.target.value)}
                    placeholder="https://www.google.com/maps/place/..." className={`flex-1 ${inputClass}`} />
                  <button onClick={handleUrlParse} disabled={searching || !newGoogleLink.trim()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5">
                    <Wand2 size={14} />{searching ? "Fetching..." : "Fetch Data"}
                  </button>
                </div>
                {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
              </div>
            )}

            {(addMode === "manual" || newName) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Clinic Name *</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Bright Smile Dental" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Auto-filled from Google" className={`${inputClass} bg-gray-50`} />
                </div>
                <div>
                  <label className={labelClass}>Rating {newRating && <span className="text-green-500 text-xs font-normal">(from Google)</span>}</label>
                  <input type="number" step="0.1" min="1" max="5" value={newRating} onChange={(e) => setNewRating(e.target.value)}
                    placeholder="e.g. 4.2" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Review Count {newReviews && <span className="text-green-500 text-xs font-normal">(from Google)</span>}</label>
                  <input type="number" min="0" value={newReviews} onChange={(e) => setNewReviews(e.target.value)}
                    placeholder="e.g. 127" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Google Maps Link</label>
                  <input type="url" value={newGoogleLink} onChange={(e) => setNewGoogleLink(e.target.value)}
                    placeholder="https://www.google.com/maps/place/..." className={inputClass} />
                </div>
              </div>
            )}

            {newName && (
              <button onClick={handleAdd} disabled={saving}
                className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                <Plus size={16} />{saving ? "Saving..." : "Add Competitor"}
              </button>
            )}
          </div>
        )}

        {/* Competitors List */}
        {competitors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Globe className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="font-semibold text-gray-900 mb-1">No competitors tracked yet</h3>
            <p className="text-sm text-gray-500 mb-4">Search Google Maps to add nearby dental clinics and track their reviews in real-time.</p>
            {atCompetitorLimit ? (
              <Link href="/dashboard/support" className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors inline-flex items-center gap-2">
                <Lock size={16} />Upgrade to Add Competitors
              </Link>
            ) : (
              <button onClick={() => { setShowAddForm(true); setAddMode("search"); }}
                className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors inline-flex items-center gap-2">
                <Search size={16} />Search on Google Maps
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Clinic", "Rating", "Reviews", "Address", "Data", "Action"].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 bg-gray-50 ${i === 3 ? "text-left" : i === 4 ? "text-center" : i === 5 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c) => {
                    const freshness = getFreshness(c.data_refreshed_at);
                    return (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.platform}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} className={i < Math.round(c.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{c.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-900 font-medium">{c.review_count.toLocaleString()}</span>
                          {c.data_refreshed_at && <span className="text-xs text-green-500 ml-1">▸ live</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          <span className="line-clamp-1">{c.address || "—"}</span>
                          {c.google_link && (
                            <a href={c.google_link} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-xs block mt-1">
                              View on Google Maps →
                            </a>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center gap-0.5" title={c.data_refreshed_at ? `Last refreshed: ${new Date(c.data_refreshed_at).toLocaleString()}` : "Manually entered data"}>
                            <freshness.icon size={13} className={freshness.color} />
                            <span className={`text-[10px] font-medium ${freshness.color}`}>{freshness.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleRefreshSingle(c)} disabled={refreshingId === c.id}
                              className="text-gray-400 hover:text-teal-600 transition-colors p-1.5" title="Refresh from Google">
                              <RefreshCw size={13} className={refreshingId === c.id ? "animate-spin" : ""} />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {competitors.map((c) => {
                const freshness = getFreshness(c.data_refreshed_at);
                return (
                  <div key={c.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{c.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleRefreshSingle(c)} disabled={refreshingId === c.id} className="text-gray-400 hover:text-teal-600 transition-colors p-1">
                          <RefreshCw size={13} className={refreshingId === c.id ? "animate-spin" : ""} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < Math.round(c.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{c.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({c.review_count.toLocaleString()} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <freshness.icon size={11} className={freshness.color} />
                      <span className={freshness.color}>{freshness.label} data</span>
                    </div>
                    {c.address && <p className="text-xs text-gray-500 mt-1">{c.address}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
