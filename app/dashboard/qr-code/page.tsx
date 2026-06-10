"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode";
import {
  ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle,
  Link as LinkIcon, AlertTriangle, HelpCircle,
  ChevronDown, ChevronUp, RefreshCw, Image
} from "lucide-react";

// ==================== 7 种模板 ====================
const TEMPLATES = [
  { id: "classic-blue",   name: "Classic Blue",    dark: "#0A2463", light: "#FFFFFF", accent: "#FDC500", desc: "全科诊所 · 牙科 · 骨科", preview: "/images/qr-previews/preview_style_01_classic_blue.jpg" },
  { id: "mint-green",     name: "Mint Green",      dark: "#2E7D32", light: "#FFFFFF", accent: "#81C784", desc: "儿科 · 医美 · 中医",     preview: "/images/qr-previews/preview_style_02_mint_green.jpg" },
  { id: "elegant-violet", name: "Elegant Violet",  dark: "#4A148C", light: "#FFFFFF", accent: "#D4AF37", desc: "高端医美 · 整形",       preview: "/images/qr-previews/preview_style_03_violet.jpg" },
  { id: "coral-orange",   name: "Coral Orange",    dark: "#E64A19", light: "#FFFFFF", accent: "#FF8A65", desc: "家庭诊所 · 理疗",       preview: "/images/qr-previews/preview_style_04_coral.jpg" },
  { id: "professional-gray", name: "Pro Gray",     dark: "#37474F", light: "#FFFFFF", accent: "#90A4AE", desc: "科技诊所 · 专科",       preview: "/images/qr-previews/preview_style_05_gray.jpg" },
  { id: "forest-green",   name: "Forest Green",    dark: "#33691E", light: "#FAF5EF", accent: "#8D6E63", desc: "中医 · 养生",           preview: "/images/qr-previews/preview_style_06_forest.jpg" },
  { id: "luxury-blue-gold", name: "Luxury Gold",   dark: "#051C3A", light: "#FFFFFF", accent: "#D4AF37", desc: "高端私立 · VIP",        preview: "/images/qr-previews/preview_style_07_luxury.jpg" },
];

// ==================== 下载尺寸 ====================
const DOWNLOAD_SIZES = [
  { size: 1500, label: "desk-stand",  name: "Front Desk Stand (5\"×5\")",   desc: "High-res for professional printing" },
  { size: 1050, label: "card-front",  name: "Business Card Front (3.5\"×2\")", desc: "Doctor info & contact details" },
  { size: 1050, label: "card-back",   name: "Business Card Back (3.5\"×2\")",  desc: "QR code with review prompt" },
  { size: 600,  label: "receipt",     name: "Receipt Sticker (2\"×2\")",       desc: "Small sticker for receipts" },
];

export default function QRCodePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [googleLink, setGoogleLink] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic-blue");
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

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
  }, [supabase, router]);

  // ========== 生成 QR 码 ==========
  const generateQR = useCallback(async () => {
    if (!googleLink || !canvasRef.current) return;
    try {
      await QRCode.toCanvas(canvasRef.current, googleLink, {
        width: 400,
        margin: 3,
        color: { dark: currentTemplate.dark, light: currentTemplate.light },
        errorCorrectionLevel: "H",
      });
    } catch (e) {
      console.error("QR generation error:", e);
    }
  }, [googleLink, currentTemplate]);

  useEffect(() => {
    if (googleLink) generateQR();
  }, [generateQR, googleLink]);

  // ========== 保存链接 ==========
  const handleSaveLink = async () => {
    if (!googleLink.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("businesses")
      .update({ google_review_link: googleLink.trim() })
      .eq("user_id", user.id);
    setTimeout(() => generateQR(), 200);
    setSaving(false);
  };

  // ========== 下载 ==========
  const handleDownload = (pxSize: number, label: string) => {
    if (!canvasRef.current) return;
    // 创建临时大尺寸 canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = pxSize;
    tempCanvas.height = pxSize;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    // 缩放原 canvas 到目标尺寸
    ctx.drawImage(canvasRef.current, 0, 0, pxSize, pxSize);
    const url = tempCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviewflow-qr-${selectedTemplate}-${label}-${pxSize}x${pxSize}.png`;
    a.click();
  };

  // ========== 打印 ==========
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Print QR Code - ${clinicName}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial;">
        <h2 style="color:${currentTemplate.dark};margin-bottom:10px;">${clinicName}</h2>
        <p style="color:#666;margin-bottom:30px;">Scan to leave a review on Google</p>
        <img src="${url}" style="max-width:300px;" />
        <p style="color:#888;margin-top:30px;font-size:12px;">Powered by ReviewFlow</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ========== 复制 ==========
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center">
            <QrCode className="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <h1 className="font-outfit font-bold text-2xl text-brand-dark">QR Code Generator</h1>
            <p className="text-brand-muted text-sm">7 professional templates — choose your style and download for print.</p>
          </div>
        </div>

        {/* ======= Step 1: Enter Link ======= */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">1</span>
            <h2 className="font-semibold text-brand-dark">Enter Your Google Review Link</h2>
          </div>

          {!googleLink ? (
            <div>
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 font-medium mb-1">No review link set yet</p>
                    <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-yellow-700 hover:text-yellow-900 underline inline-flex items-center gap-1">
                      <HelpCircle size={12} />How to find your link {showGuide ? "▲" : "▼"}
                    </button>
                    {showGuide && (
                      <div className="mt-2 text-xs text-yellow-700 space-y-1">
                        <p>1. Go to <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="underline">business.google.com</a></p>
                        <p>2. Select your clinic → "Get more reviews"</p>
                        <p>3. Copy the short URL (e.g., g.page/your-clinic/review)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={googleLink}
                  onChange={(e) => setGoogleLink(e.target.value)}
                  placeholder="https://g.page/your-clinic/review"
                  className="flex-1 rounded-xl border border-brand-soft p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button onClick={handleSaveLink} disabled={saving || !googleLink.trim()}
                  className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark disabled:opacity-50">
                  {saving ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                <span className="truncate">{googleLink}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyLink} className="px-3 py-2 text-sm text-brand-muted hover:text-brand-blue transition-colors">
                  {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button onClick={() => setGoogleLink("")} className="px-3 py-2 text-sm text-brand-muted hover:text-red-500 transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======= Step 2: Choose Template ======= */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">2</span>
            <h2 className="font-semibold text-brand-dark">Choose Template Style</h2>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                  selectedTemplate === t.id
                    ? "border-brand-blue bg-brand-soft shadow-sm"
                    : "border-gray-100 hover:border-brand-blue/30"
                }`}
              >
                {/* Preview Image */}
                <div
                  className="relative w-full aspect-square rounded-lg mb-2 overflow-hidden bg-gray-50 cursor-pointer group"
                  onClick={(e) => { e.stopPropagation(); setPreviewTemplate(previewTemplate === t.id ? null : t.id); }}
                >
                  <img
                    src={t.preview}
                    alt={t.name}
                    className={`w-full h-full object-cover transition-transform ${previewTemplate === t.id ? "scale-110" : "group-hover:scale-105"}`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Image size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Color + Name */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: t.dark }} />
                  <span className="font-medium text-xs text-brand-dark leading-tight">{t.name}</span>
                </div>
                <p className="text-[10px] text-brand-muted mt-1">{t.desc}</p>

                {selectedTemplate === t.id && (
                  <CheckCircle size={14} className="absolute top-2 right-2 text-brand-blue" />
                )}
              </button>
            ))}
          </div>

          {/* Preview Modal */}
          {previewTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}>
              <div className="bg-white rounded-2xl p-4 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <img
                  src={TEMPLATES.find(t => t.id === previewTemplate)?.preview || ""}
                  alt="Preview"
                  className="w-full rounded-xl"
                />
                <button onClick={() => setPreviewTemplate(null)} className="mt-3 w-full py-2 text-sm font-semibold text-brand-muted hover:text-brand-dark transition-colors">
                  Close Preview
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======= Step 3: QR Code & Downloads ======= */}
        {googleLink && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">3</span>
              <h2 className="font-semibold text-brand-dark">Your QR Code</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* QR Code Display */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="bg-white p-5 rounded-2xl border-2 shadow-sm" style={{ borderColor: currentTemplate.accent }}>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="w-64 h-64"
                  />
                  <div className="text-center mt-3">
                    <p className="font-outfit font-bold text-sm" style={{ color: currentTemplate.dark }}>{clinicName}</p>
                    <p className="text-xs text-brand-muted mt-1">Scan to leave a Google Review</p>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <button onClick={handlePrint} className="px-4 py-2 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors inline-flex items-center gap-2">
                    <Printer size={14} />Print
                  </button>
                </div>
              </div>

              {/* Download Options */}
              <div className="flex-1 w-full">
                <h3 className="font-semibold text-brand-dark text-sm mb-3">Download for Print</h3>
                <div className="space-y-3">
                  {DOWNLOAD_SIZES.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-brand-soft/50 hover:border-brand-blue/30 transition-colors">
                      <div>
                        <p className="font-medium text-brand-dark text-sm">{item.name}</p>
                        <p className="text-xs text-brand-muted">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(item.size, item.label)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors shrink-0"
                      >
                        <Download size={14} />Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-brand-soft rounded-2xl p-6">
          <h3 className="font-semibold text-brand-dark text-sm mb-3">Placement Tips</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li className="flex items-start gap-2"><span className="text-brand-blue font-bold">•</span> Place the stand where patients pay — right after a positive experience</li>
            <li className="flex items-start gap-2"><span className="text-brand-blue font-bold">•</span> Train front desk: "If you had a great visit, we'd love your feedback on Google"</li>
            <li className="flex items-start gap-2"><span className="text-brand-blue font-bold">•</span> Include the card with receipts for patients who might review later</li>
            <li className="flex items-start gap-2"><span className="text-brand-blue font-bold">•</span> Pro tip: Ask for reviews from patients who complimented your service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
