"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Save, CheckCircle, AlertTriangle, MessageSquare,
  Trash2, FlaskConical, Bell
} from "lucide-react";

interface WebhookConfig {
  id: string;
  type: "slack" | "teams" | "discord";
  url: string;
  channel: string;
  events: string[];
  is_active: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<"slack" | "teams" | "discord">("slack");
  const [newUrl, setNewUrl] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadWebhooks = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data } = await supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setWebhooks(data);
    setLoading(false);
  };

  useEffect(() => { loadWebhooks(); }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async () => {
    if (!newUrl.trim() || !newUrl.includes("http")) {
      showToast("Please enter a valid webhook URL", "error");
      return;
    }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("webhooks").insert({
      user_id: user.id,
      type: newType,
      url: newUrl.trim(),
      channel: newChannel.trim() || null,
      events: ["negative_review", "new_review"],
      is_active: true,
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      setNewUrl("");
      setNewChannel("");
      setShowAddForm(false);
      showToast("Webhook added successfully", "success");
      loadWebhooks();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    await supabase.from("webhooks").delete().eq("id", id);
    loadWebhooks();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from("webhooks").update({ is_active: !current }).eq("id", id);
    loadWebhooks();
  };

  const handleTest = async (webhook: WebhookConfig) => {
    try {
      const payload = {
        text: "🔔 Test notification from ReviewFlow",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*ReviewFlow Test Notification*\nThis is a test message to confirm your webhook is working correctly.",
            },
          },
        ],
      };

      const res = await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Test notification sent successfully", "success");
      } else {
        showToast("Failed to send test notification. Check your webhook URL.", "error");
      }
    } catch (err) {
      showToast("Network error. Check your webhook URL.", "error");
    }
  };

  const typeLabels = {
    slack: { name: "Slack", icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
    teams: { name: "Microsoft Teams", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
    discord: { name: "Discord", icon: MessageSquare, color: "bg-indigo-50 text-indigo-600" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-brand-muted">Loading...</div>
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

        <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">Notification Settings</h1>
        <p className="text-brand-muted text-sm mb-8">Connect Slack, Teams, or Discord to get instant review alerts.</p>

        {toast && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${toast.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Add Webhook */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-blue">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark text-sm">Add Webhook</h3>
              <p className="text-xs text-brand-muted">Get instant alerts in Slack/Teams when patients leave reviews</p>
            </div>
          </div>

          <div className="mb-4 p-3 bg-brand-soft rounded-xl">
            <p className="text-xs font-semibold text-brand-dark mb-2">What is a Webhook URL?</p>
            <p className="text-xs text-brand-muted mb-2">A webhook URL is like a "delivery address" where ReviewFlow sends instant notifications. When a patient leaves a review, we immediately push a message to your Slack channel or Teams chat.</p>
            <p className="text-xs text-brand-muted">You don&apos;t need to keep checking the dashboard — reviews come to you automatically.</p>
          </div>

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-brand-soft text-brand-muted font-semibold rounded-xl text-sm hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              + Add New Webhook
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Platform</label>
                <div className="flex gap-2">
                  {(["slack", "teams", "discord"] as const).map((t) => {
                    const config = typeLabels[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          newType === t ? "bg-brand-blue text-white" : "bg-brand-soft text-brand-muted hover:text-brand-dark"
                        }`}
                      >
                        {config.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Webhook URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={newType === "slack" ? "https://hooks.slack.com/services/..." : newType === "teams" ? "https://outlook.office.com/webhook/..." : "https://discord.com/api/webhooks/..."}
                  className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
                <div className="mt-2 p-2 bg-brand-soft rounded-lg">
                  <p className="text-xs font-semibold text-brand-dark mb-1">
                    {newType === "slack" && "How to get Slack Webhook URL:"}
                    {newType === "teams" && "How to get Teams Webhook URL:"}
                    {newType === "discord" && "How to get Discord Webhook URL:"}
                  </p>
                  <ol className="text-xs text-brand-muted space-y-1 list-decimal list-inside">
                    {newType === "slack" && (
                      <>
                        <li>Open your Slack workspace</li>
                        <li>Go to Settings → Apps → Incoming Webhooks</li>
                        <li>Click "Add to Slack" → Choose a channel</li>
                        <li>Copy the Webhook URL (starts with https://hooks.slack.com/...)</li>
                      </>
                    )}
                    {newType === "teams" && (
                      <>
                        <li>Open Microsoft Teams</li>
                        <li>Go to your channel → ... → Connectors</li>
                        <li>Search "Incoming Webhook" → Add</li>
                        <li>Copy the URL (starts with https://outlook.office.com/...)</li>
                      </>
                    )}
                    {newType === "discord" && (
                      <>
                        <li>Open Discord → Server Settings</li>
                        <li>Integrations → Webhooks → New Webhook</li>
                        <li>Choose channel → Copy Webhook URL</li>
                      </>
                    )}
                  </ol>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Channel (optional)</label>
                <input
                  type="text"
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  placeholder="#reviews or general"
                  className="w-full rounded-xl border border-brand-soft p-3 text-sm text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Save size={16} />{saving ? "Saving..." : "Save Webhook"}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 border-2 border-brand-soft text-brand-muted font-semibold rounded-xl text-sm hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-10 text-center">
            <Bell className="mx-auto text-brand-muted mb-3" size={40} />
            <h3 className="font-semibold text-brand-dark mb-1">No webhooks configured</h3>
            <p className="text-sm text-brand-muted">Add a webhook to start receiving instant notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => {
              const config = typeLabels[wh.type];
              const Icon = config.icon;
              return (
                <div key={wh.id} className="bg-white rounded-2xl border border-brand-soft/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-dark text-sm">{config.name}</p>
                        <p className="text-xs text-brand-muted truncate max-w-[250px]">{wh.url}</p>
                        {wh.channel && <p className="text-xs text-brand-muted">Channel: {wh.channel}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(wh.id, wh.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          wh.is_active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {wh.is_active ? "Active" : "Paused"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-brand-soft/30">
                    <button
                      onClick={() => handleTest(wh)}
                      className="text-xs text-brand-blue font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <FlaskConical size={12} />Send Test
                    </button>
                    <button
                      onClick={() => handleDelete(wh.id)}
                      className="text-xs text-red-500 font-semibold hover:underline inline-flex items-center gap-1 ml-auto"
                    >
                      <Trash2 size={12} />Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
