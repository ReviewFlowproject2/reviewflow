"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Save, CheckCircle, AlertTriangle, MessageSquare,
  Trash2, FlaskConical, Bell, Zap, Info, ExternalLink
} from "lucide-react";

interface WebhookConfig {
  id: string;
  user_id: string;
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

    if (data) setWebhooks(data as WebhookConfig[]);
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
      setNewUrl(""); setNewChannel("");
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
      const { data, error } = await supabase.functions.invoke("webhook-trigger", {
        body: {
          record: {
            user_id: webhook.user_id,
            patient_name: "Test Patient",
            rating: 3,
            comment: "This is a test notification from ReviewFlow",
            google_review_link: "https://www.google.com"
          }
        }
      });

      if (error) {
        showToast("Failed to send test: " + error.message, "error");
        return;
      }

      const results = data?.results || [];
      const successCount = results.filter((r: any) => r.success).length;

      if (successCount > 0) {
        showToast(`Test sent successfully to ${successCount} webhook(s)`, "success");
      } else {
        showToast("Test failed. Check webhook URL.", "error");
      }
    } catch (err: any) {
      showToast("Network error: " + err.message, "error");
    }
  };

  const typeLabels: Record<string, { name: string; icon: any; color: string; guide: string }> = {
    slack: { name: "Slack", icon: MessageSquare, color: "bg-purple-50 text-purple-600", guide: "https://api.slack.com/messaging/webhooks" },
    teams: { name: "Microsoft Teams", icon: MessageSquare, color: "bg-blue-50 text-blue-600", guide: "https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook" },
    discord: { name: "Discord", icon: MessageSquare, color: "bg-indigo-50 text-indigo-600", guide: "https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" },
  };

  const inputClass = "w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        <h1 className="font-bold text-2xl text-gray-900 mb-2">Notification Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Connect Slack, Teams, or Discord to get instant review alerts.</p>

        {toast && (
          <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Add Webhook */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-teal-600">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Add Webhook</h3>
              <p className="text-xs text-gray-500">Get instant alerts in Slack/Teams when patients leave reviews</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">What is a Webhook URL?</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  A webhook URL is a special address that ReviewFlow uses to send instant notifications to your team chat.
                  When a patient leaves a review (especially a negative one), we immediately push a message to your Slack channel,
                  Teams chat, or Discord server. You do not need to keep checking the dashboard — reviews come to you automatically.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["slack", "teams", "discord"] as const).map((k) => (
                    <span key={k} className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md font-medium ${typeLabels[k].color}`}>
                      <Zap size={10} /> {typeLabels[k].name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 font-semibold rounded-xl text-sm hover:border-teal-500 hover:text-teal-600 transition-colors">
              + Add New Webhook
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platform</label>
                <div className="flex gap-2">
                  {(["slack", "teams", "discord"] as const).map((t) => {
                    const config = typeLabels[t];
                    return (
                      <button key={t} onClick={() => setNewType(t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          newType === t ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-900"
                        }`}>
                        {config.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Webhook URL</label>
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={newType === "slack" ? "https://hooks.slack.com/services/..." : newType === "teams" ? "https://outlook.office.com/webhook/..." : "https://discord.com/api/webhooks/..."}
                  className={inputClass} />
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-900">How to get {typeLabels[newType].name} Webhook URL:</p>
                    <a href={typeLabels[newType].guide} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:underline inline-flex items-center gap-1">
                      Full Guide <ExternalLink size={10} />
                    </a>
                  </div>
                  <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                    {newType === "slack" && (
                      <>
                        <li>Open your Slack workspace</li>
                        <li>Go to <strong>Settings → Apps → Incoming Webhooks</strong></li>
                        <li>Click <strong>"Add to Slack"</strong> → Choose a channel</li>
                        <li>Copy the Webhook URL (starts with <code className="bg-white px-1 py-0.5 rounded text-[10px]">https://hooks.slack.com/...</code>)</li>
                      </>
                    )}
                    {newType === "teams" && (
                      <>
                        <li>Open Microsoft Teams</li>
                        <li>Go to your channel → <strong>... → Connectors</strong></li>
                        <li>Search <strong>"Incoming Webhook"</strong> → Add</li>
                        <li>Copy the URL (starts with <code className="bg-white px-1 py-0.5 rounded text-[10px]">https://outlook.office.com/...</code>)</li>
                      </>
                    )}
                    {newType === "discord" && (
                      <>
                        <li>Open Discord → <strong>Server Settings</strong></li>
                        <li><strong>Integrations → Webhooks → New Webhook</strong></li>
                        <li>Choose channel → <strong>Copy Webhook URL</strong></li>
                        <li>URL starts with <code className="bg-white px-1 py-0.5 rounded text-[10px]">https://discord.com/api/webhooks/...</code></li>
                      </>
                    )}
                  </ol>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Channel (optional)</label>
                <input type="text" value={newChannel} onChange={(e) => setNewChannel(e.target.value)}
                  placeholder="#reviews or general" className={inputClass} />
              </div>

              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving}
                  className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                  <Save size={16} />{saving ? "Saving..." : "Save Webhook"}
                </button>
                <button onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-500 font-semibold rounded-xl text-sm hover:border-teal-500 hover:text-teal-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <Bell className="mx-auto text-gray-400 mb-3" size={40} />
            <h3 className="font-semibold text-gray-900 mb-1">No webhooks configured</h3>
            <p className="text-sm text-gray-500">Add a webhook to start receiving instant notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => {
              const config = typeLabels[wh.type];
              const Icon = config.icon;
              return (
                <div key={wh.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{config.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[250px]">{wh.url}</p>
                        {wh.channel && <p className="text-xs text-gray-500">Channel: {wh.channel}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(wh.id, wh.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          wh.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                        {wh.is_active ? "Active" : "Paused"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button onClick={() => handleTest(wh)}
                      className="text-xs text-teal-600 font-semibold hover:underline inline-flex items-center gap-1">
                      <FlaskConical size={12} />Send Test
                    </button>
                    <button onClick={() => handleDelete(wh.id)}
                      className="text-xs text-red-500 font-semibold hover:underline inline-flex items-center gap-1 ml-auto">
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
