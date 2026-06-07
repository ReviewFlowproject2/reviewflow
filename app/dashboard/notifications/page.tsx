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

  // 修复: 调用 Edge Function 而不是直接 fetch Webhook URL
  const handleTest = async (webhook: WebhookConfig) => {
    try {
      // 调用 Edge Function 发送测试消息
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

  const typeLabels = {
    slack: { name: "Slack", icon: MessageSquare, color: "bg-purple-50 text-purple-600", guide: "https://api.slack.com/messaging/webhooks" },
    teams: { name: "Microsoft Teams", icon: MessageSquare, color: "bg-blue-50 text-blue-600", guide: "https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook" },
    discord: { name: "Discord", icon: MessageSquare, color: "bg-indigo-50 text-indigo-600", guide: "https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" },
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

          <div className="mb-4 p-4 bg-brand-soft rounded-xl border border-brand-soft/50">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-brand-dark">What is a Webhook URL?</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  A webhook URL is a special address that ReviewFlow uses to send instant notifications to your team chat. 
                  When a patient leaves a review (especially a negative one), we immediately push a message to your Slack channel, 
                  Teams chat, or Discord server. You do not need to keep checking the dashboard — reviews come to you automatically.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                    <Zap size={10} /> Slack
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                    <Zap size={10} /> Teams
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-medium">
                    <Zap size={10} /> Discord
                  </span>
                </div>
              </div>
            </div>
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
                <div className="mt-2 p-3 bg-brand-soft rounded-lg border border-brand-soft/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-brand-dark">
                      How to get {typeLabels[newType].name} Webhook URL:
                    </p>
                    <a 
                      href={typeLabels[newType].guide} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-brand-blue hover:underline inline-flex items-center gap-1"
                    >
                      Full Guide <ExternalLink size={10} />
                    </a>
                  </div>
                  <ol className="text-xs text-brand-muted space-y-1.5 list-decimal list-inside">
                    {newType === "slack" && (
                      <>
                        <li>Open your Slack workspace</li>
                        <li>Go to <strong>Settings → Apps → Incoming Webhooks</strong></li>
                        <li>Click <strong>&quot;Add to Slack&quot;</strong> → Choose a channel</li>
                        <li>Copy the Webhook URL (starts with <code className="bg-white px-1 py-0.5 rounded text-[10px]">https://hooks.slack.com/...</code>)</li>
                      </>
                    )}
                    {newType === "teams" && (
                      <>
                        <li>Open Microsoft Teams</li>
                        <li>Go to your channel → <strong>... → Connectors</strong></li>
                        <li>Search <strong>&quot;Incoming Webhook&quot;</strong> → Add</li>
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
