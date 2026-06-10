"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Search, Filter, Star, MailOpen, Mail, CheckCircle, Reply,
  Clock, ChevronDown, ChevronUp, MessageSquare, X, ArrowLeft,
  AlertTriangle, ExternalLink
} from "lucide-react";

// ===================== TYPES =====================
interface Review {
  id: string;
  patient_name: string;
  email: string;
  rating: number;
  comment: string;
  platform: string;
  status: string;
  created_at: string;
  sentiment: string;
  resolved: boolean;
}

// ===================== COMPONENTS =====================
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={14} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
    ))}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    read: "bg-gray-50 text-gray-700 border-gray-200",
    replied: "bg-purple-50 text-purple-700 border-purple-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
  };
  const icons: Record<string, any> = { new: Mail, read: MailOpen, replied: Reply, resolved: CheckCircle };
  const Icon = icons[status] || Mail;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.new}`}>
      <Icon size={12} />{status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const styles: Record<string, string> = {
    negative: "bg-red-50 text-red-700",
    neutral: "bg-yellow-50 text-yellow-700",
    positive: "bg-green-50 text-green-700",
  };
  return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[sentiment] || styles.neutral}`}>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</span>;
};

// ===================== MAIN PAGE =====================
export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [googleLink, setGoogleLink] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 从 Google 拉取真实评论
  const fetchFromGoogle = async () => {
    setSyncing(true); setSyncMsg("");
    try {
      const res = await fetch("/api/google/reviews");
      const data = await res.json();
      if (data.success) {
        setSyncMsg(`Synced ${data.reviews?.length || 0} reviews from Google (${data.place_total_reviews || 0} total on Google)`);
        loadReviews();
      } else {
        setSyncMsg(data.error || "Failed to fetch reviews");
      }
    } catch (e: any) {
      setSyncMsg(e.message || "Network error");
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 5000);
  };

  const quickTemplates = [
    "Thank you for your feedback. We sincerely apologize for the inconvenience and are looking into this matter.",
    "We're so glad you had a positive experience! Thank you for choosing us.",
    "We appreciate your feedback and would love to discuss this further. Please contact our office directly.",
  ];

  // 加载真实数据
  const loadReviews = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: biz } = await supabase.from("businesses").select("google_review_link").eq("user_id", user.id).single();
    if (biz) setGoogleLink(biz.google_review_link || "");

    const businessId = user.id;
    const { data: revs } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (revs) {
      const processed = revs.map((r: any) => ({
        id: r.id,
        patient_name: r.patient_name || "Unknown",
        email: r.email || "",
        rating: r.rating || 0,
        comment: r.comment || "No comment",
        platform: r.platform || "Google",
        status: r.resolved ? "resolved" : (r.status || "new"),
        created_at: r.created_at,
        sentiment: r.rating <= 2 ? "negative" : r.rating === 3 ? "neutral" : "positive",
        resolved: r.resolved || false,
      }));
      setReviews(processed);
    }
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const matchesSearch = item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || item.comment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesRating = ratingFilter === "all" || item.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  const stats = {
    total: reviews.length,
    new: reviews.filter((f) => f.status === "new").length,
    negative: reviews.filter((f) => f.sentiment === "negative").length,
    resolved: reviews.filter((f) => f.status === "resolved").length,
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("reviews").update({ status: newStatus, resolved: newStatus === "resolved" }).eq("id", id);
    if (!error) loadReviews();
  };

  const handleReply = async (id: string) => {
    const draft = replyDraft[id];
    if (!draft?.trim()) return;
    // 保存回复草稿到数据库（可选）
    const { error } = await supabase.from("reviews").update({ reply_draft: draft, status: "replied" }).eq("id", id);
    if (!error) {
      setReplyDraft((prev) => ({ ...prev, [id]: "" }));
      setShowReplyForm(null);
      loadReviews();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviews</h1>
            <p className="text-gray-600">Manage and respond to patient reviews across all platforms.</p>
          </div>
          <div className="flex items-center gap-3">
            {syncMsg && <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">{syncMsg}</span>}
            <button onClick={fetchFromGoogle} disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50">
              {syncing ? "Syncing..." : "Fetch from Google"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Total Reviews</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div>
              <MessageSquare className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">New Reviews</p><p className="text-2xl font-bold text-blue-600">{stats.new}</p></div>
              <Mail className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Needs Attention</p><p className="text-2xl font-bold text-red-600">{stats.negative}</p></div>
              <Star className="text-red-500 fill-red-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-600">Resolved</p><p className="text-2xl font-bold text-green-600">{stats.resolved}</p></div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search by patient name or keyword..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="resolved">Resolved</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <div className="relative">
                <select className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg outline-none cursor-pointer" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                  <option value="all">All Ratings</option><option value="1">1 Star</option><option value="2">2 Stars</option><option value="3">3 Stars</option><option value="4">4 Stars</option><option value="5">5 Stars</option>
                </select>
                <Star className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
              <p className="text-gray-500 mb-4">Click "Fetch from Google" to pull real reviews from your Google Business Profile.</p>
              <button onClick={fetchFromGoogle} disabled={syncing}
                className="px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark disabled:opacity-50 inline-flex items-center gap-2">
                {syncing ? "Fetching..." : "Fetch from Google"}
              </button>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${review.status === "new" ? "border-blue-300 shadow-md" : "border-gray-200 shadow-sm"}`}>
                <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                        {review.patient_name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{review.patient_name}</h3>
                          <StatusBadge status={review.status} />
                          <SentimentBadge sentiment={review.sentiment} />
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} />{formatDate(review.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2"><StarRating rating={review.rating} /><span className="text-xs text-gray-400">via {review.platform}</span></div>
                        <p className="text-gray-700 text-sm line-clamp-2">{review.comment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {review.status === "new" && (
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(review.id, "read"); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Mark as read"><MailOpen size={18} /></button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">{expandedId === review.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                    </div>
                  </div>
                </div>

                {expandedId === review.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="ml-14">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4"><p className="text-gray-800 leading-relaxed">{review.comment}</p></div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {review.status !== "resolved" && (
                          <button onClick={() => updateStatus(review.id, "resolved")} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"><CheckCircle size={16} />Mark Resolved</button>
                        )}
                        {review.status !== "replied" && (
                          <button onClick={() => setShowReplyForm(showReplyForm === review.id ? null : review.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"><Reply size={16} />{showReplyForm === review.id ? "Cancel Reply" : "Draft Reply"}</button>
                        )}
                        <button onClick={() => updateStatus(review.id, "read")} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"><MailOpen size={16} />Mark as Read</button>
                        {googleLink && (
                          <a href={googleLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"><ExternalLink size={16} />Reply on Google</a>
                        )}
                      </div>

                      {showReplyForm === review.id && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Draft Reply</h4>
                            <button onClick={() => setShowReplyForm(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {quickTemplates.map((template, idx) => (
                              <button key={idx} onClick={() => setReplyDraft((prev) => ({ ...prev, [review.id]: template }))} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors text-left">Template {idx + 1}</button>
                            ))}
                          </div>
                          <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" rows={4} placeholder="Write your response here..." value={replyDraft[review.id] || ""} onChange={(e) => setReplyDraft((prev) => ({ ...prev, [review.id]: e.target.value }))} />
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-gray-500">This will be saved as a draft. Direct platform reply coming soon.</p>
                            <div className="flex gap-2">
                              <button onClick={() => setReplyDraft((prev) => ({ ...prev, [review.id]: "" }))} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Clear</button>
                              <button onClick={() => handleReply(review.id)} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Save Draft</button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={14} />{review.email || "No email"}</span>
                        <span>Platform: {review.platform}</span>
                        <span>Review ID: {review.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
