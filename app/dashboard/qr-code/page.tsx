"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle,
  Link as LinkIcon, AlertTriangle, ExternalLink, HelpCircle,
  ChevronDown, ChevronUp
} from "lucide-react";

export default function QRCodePage() {
  const router = useRouter();
  const [googleLink, setGoogleLink] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState<"small" | "medium" | "large">("medium");
  const [showGuide, setShowGuide] = useState(false);

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
        .select("name, google_review_link")
        .eq("user_id", user.id)
        .single();

      if (biz) {
        setClinicName(biz.name || "My Clinic");
        setGoogleLink(biz.google_review_link || "");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 使用 Google Chart API 生成 QR 码
  const getQRUrl = () => {
    if (!googleLink) return "";
    const size = qrSize === "small" ? "200x200" : qrSize === "medium" ? "300x300" : "400x400";
    return `https://chart.googleapis.com/chart?cht=qr&chs=${size}&chld=H|0&chl=${encodeURIComponent(googleLink)}`;
  };

  const handleDownload = () => {
    const url = getQRUrl();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviewflow_qr_${clinicName.replace(/\s+/g, "_").toLowerCase()}.png`;
    a.click();
  };

  const handlePrint = () => {
    const url = getQRUrl();
    if (!url) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Print QR Code - ${clinicName}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial;">
          <h2 style="color:#1a3a5c;margin-bottom:10px;">${clinicName}</h2>
          <p style="color:#666;margin-bottom:30px;">Scan to leave a review on Google</p>
          <img src="${url}" style="max-width:300px;" />
          <p style="color:#888;margin-top:30px;font-size:12px;">Powered by ReviewFlow</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyLink = () => {
    if (!googleLink) return;
    navigator.clipboard.writeText(googleLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">QR Code Generator</h1>
        <p className="text-brand-muted text-sm mb-8">Generate a QR code that takes patients directly to your Google Review page.</p>

        {!googleLink ? (
          <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 text-sm mb-1">Google Review Link Not Set</h3>
                <p className="text-sm text-yellow-700 mb-3">You need to add your Google Review link in Settings before generating a QR code.</p>

                {/* 新增: 获取链接的引导 */}
                <div className="bg-white rounded-xl border border-yellow-200 p-4 mb-3">
                  <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center gap-2 text-sm font-semibold text-yellow-800 hover:text-yellow-900 transition-colors w-full"
                  >
                    <HelpCircle size={16} />
                    How do I get my Google Review Link?
                    {showGuide ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
                  </button>

                  {showGuide && (
                    <div className="mt-3 space-y-3 text-sm text-yellow-800">
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        <div>
                          <p className="font-medium">Go to Google Business Profile</p>
                          <p className="text-yellow-700/80 text-xs mt-0.5">Visit <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900 inline-flex items-center gap-1">business.google.com <ExternalLink size={10} /></a> and sign in</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        <div>
                          <p className="font-medium">Find your clinic</p>
                          <p className="text-yellow-700/80 text-xs mt-0.5">Select your dental clinic from the dashboard</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        <div>
                          <p className="font-medium">Get more reviews</p>
                          <p className="text-yellow-700/80 text-xs mt-0.5">Click the "Get more reviews" button or go to "Customers" → "Reviews"</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                        <div>
                          <p className="font-medium">Copy the short URL</p>
                          <p className="text-yellow-700/80 text-xs mt-0.5">Copy the link (looks like <code className="bg-yellow-100 px-1 py-0.5 rounded text-xs">g.page/your-clinic/review</code>)</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">5</span>
                        <div>
                          <p className="font-medium">Paste in Settings</p>
                          <p className="text-yellow-700/80 text-xs mt-0.5">Go to Settings → paste the link → come back here</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors">
                  Go to Settings
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Google Link Display */}
            <div className="bg-white rounded-2xl border border-brand-soft/50 p-5 mb-6">
              <label className="block text-sm font-semibold text-brand-dark mb-2">Your Google Review Link</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-brand-soft rounded-xl text-sm text-brand-dark overflow-hidden">
                  <LinkIcon size={14} className="text-brand-muted shrink-0" />
                  <span className="truncate">{googleLink}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors inline-flex items-center gap-2 shrink-0"
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="bg-white rounded-2xl border border-brand-soft/50 p-5 mb-6">
              <label className="block text-sm font-semibold text-brand-dark mb-3">QR Code Size</label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setQrSize(size)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      qrSize === size
                        ? "bg-brand-blue text-white"
                        : "bg-brand-soft text-brand-muted hover:text-brand-dark"
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                    <span className="block text-xs font-normal opacity-70">
                      {size === "small" ? "200px" : size === "medium" ? "300px" : "400px"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="bg-white rounded-2xl border border-brand-soft/50 p-8 text-center">
              <div className="inline-block p-6 bg-white rounded-2xl border-2 border-brand-soft shadow-lg mb-6">
                <img
                  src={getQRUrl()}
                  alt="QR Code"
                  className="mx-auto"
                  style={{ width: qrSize === "small" ? 200 : qrSize === "medium" ? 300 : 400 }}
                />
                <p className="text-sm font-semibold text-brand-dark mt-4">{clinicName}</p>
                <p className="text-xs text-brand-muted">Scan to leave a Google review</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors"
                >
                  <Download size={16} />Download PNG
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors"
                >
                  <Printer size={16} />Print
                </button>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="mt-6 bg-brand-soft rounded-2xl p-5">
              <h3 className="font-semibold text-brand-dark text-sm mb-3">Where to place your QR code:</h3>
              <ul className="space-y-2 text-sm text-brand-muted">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" />Front desk counter (patients see it while checking out)</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" />Treatment room door or wall</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" />Receipts and appointment cards</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500 shrink-0" />Waiting room table tents</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
