"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode";
import {
  ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle,
  AlertTriangle, HelpCircle, RefreshCw, Image, Star, Phone, Globe, MapPin
} from "lucide-react";

// ====================================================================
// 7 种模板参数 — 从桌面 .page 文件提取
// ====================================================================
interface TemplateStyle {
  id: string;
  name: string;
  desc: string;
  preview: string;
  // 桌面版颜色
  deskBg: string;           // 桌面版背景
  deskBar: string;          // 顶部栏颜色 (CSS gradient string)
  deskBarSolid: string;     // 顶部栏纯色
  deskClinicColor: string;  // 诊所名颜色
  deskInviteColor: string;  // "We'd love..." 颜色
  deskScanColor: string;    // "Scan to..." 颜色
  deskGoogleColor: string;  // Google Reviews 颜色
  deskStarsColor: string;   // 星星颜色
  deskAccent: string;       // 装饰色（logo等）
  deskBorder: string | null; // 边框颜色 (null=无边框)
  deskHasBorder: boolean;
  // 名片正面色
  cardBar: string;
  cardThanks: string;
  cardDr: string;
  cardTitle: string;
  cardIcon: string;
  // 名片背面色
  cardBackBg: string;
  cardBackBar: string;
  cardBackClinic: string;
  cardBackInvite: string;
  cardBackStars: string;
  cardBackAccent: string;
}

const TEMPLATES: TemplateStyle[] = [
  {
    id: "classic-blue", name: "Classic Blue", desc: "全科诊所 · 牙科 · 骨科",
    preview: "/images/qr-previews/preview_style_01_classic_blue.jpg",
    deskBg:           "linear-gradient(135deg, #0A2463, #1E88E5)",
    deskBar:          "linear-gradient(90deg, #0A2463, #1E88E5)",
    deskBarSolid:     "#0A2463",
    deskClinicColor:  "#FFFFFF",
    deskInviteColor:  "#1E88E5",
    deskScanColor:    "#FFFFFF",
    deskGoogleColor:  "#FFFFFF",
    deskStarsColor:   "#FDC500",
    deskAccent:       "#FDC500",
    deskBorder:       null,
    deskHasBorder:    false,
    cardBar:          "#0A2463",
    cardThanks:       "#0A2463",
    cardDr:           "#0A2463",
    cardTitle:        "#1E88E5",
    cardIcon:         "#1E88E5",
    cardBackBg:       "linear-gradient(135deg, #0A2463, #1E88E5)",
    cardBackBar:      "linear-gradient(90deg, #0A2463, #1E88E5)",
    cardBackClinic:   "#FFFFFF",
    cardBackInvite:   "#1E88E5",
    cardBackStars:    "#FDC500",
    cardBackAccent:   "#FDC500",
  },
  {
    id: "mint-green", name: "Mint Green", desc: "儿科 · 医美 · 中医",
    preview: "/images/qr-previews/preview_style_02_mint_green.jpg",
    deskBg:           "#FFFFFF",
    deskBar:          "linear-gradient(90deg, #2E7D32, #81C784)",
    deskBarSolid:     "#2E7D32",
    deskClinicColor:  "#1B5E20",
    deskInviteColor:  "#4CAF50",
    deskScanColor:    "#1B5E20",
    deskGoogleColor:  "#1B5E20",
    deskStarsColor:   "#81C784",
    deskAccent:       "#4CAF50",
    deskBorder:       "#4CAF50",
    deskHasBorder:    true,
    cardBar:          "#2E7D32",
    cardThanks:       "#1B5E20",
    cardDr:           "#1B5E20",
    cardTitle:        "#4CAF50",
    cardIcon:         "#4CAF50",
    cardBackBg:       "#FFFFFF",
    cardBackBar:      "linear-gradient(90deg, #2E7D32, #81C784)",
    cardBackClinic:   "#1B5E20",
    cardBackInvite:   "#4CAF50",
    cardBackStars:    "#81C784",
    cardBackAccent:   "#4CAF50",
  },
  {
    id: "elegant-violet", name: "Elegant Violet", desc: "高端医美 · 整形",
    preview: "/images/qr-previews/preview_style_03_violet.jpg",
    deskBg:           "linear-gradient(135deg, #4A148C, #7B1FA2)",
    deskBar:          "linear-gradient(90deg, #4A148C, #7B1FA2)",
    deskBarSolid:     "#4A148C",
    deskClinicColor:  "#FFFFFF",
    deskInviteColor:  "#CE93D8",
    deskScanColor:    "#FFFFFF",
    deskGoogleColor:  "#FFFFFF",
    deskStarsColor:   "#D4AF37",
    deskAccent:       "#D4AF37",
    deskBorder:       null,
    deskHasBorder:    false,
    cardBar:          "#4A148C",
    cardThanks:       "#4A148C",
    cardDr:           "#4A148C",
    cardTitle:        "#7B1FA2",
    cardIcon:         "#7B1FA2",
    cardBackBg:       "linear-gradient(135deg, #4A148C, #7B1FA2)",
    cardBackBar:      "linear-gradient(90deg, #4A148C, #7B1FA2)",
    cardBackClinic:   "#FFFFFF",
    cardBackInvite:   "#CE93D8",
    cardBackStars:    "#D4AF37",
    cardBackAccent:   "#D4AF37",
  },
  {
    id: "coral-orange", name: "Coral Orange", desc: "家庭诊所 · 理疗",
    preview: "/images/qr-previews/preview_style_04_coral.jpg",
    deskBg:           "#FFFFFF",
    deskBar:          "linear-gradient(90deg, #E64A19, #FF8A65)",
    deskBarSolid:     "#E64A19",
    deskClinicColor:  "#BF360C",
    deskInviteColor:  "#E64A19",
    deskScanColor:    "#BF360C",
    deskGoogleColor:  "#BF360C",
    deskStarsColor:   "#FF8A65",
    deskAccent:       "#E64A19",
    deskBorder:       "#E64A19",
    deskHasBorder:    true,
    cardBar:          "#E64A19",
    cardThanks:       "#BF360C",
    cardDr:           "#BF360C",
    cardTitle:        "#E64A19",
    cardIcon:         "#E64A19",
    cardBackBg:       "#FFFFFF",
    cardBackBar:      "linear-gradient(90deg, #E64A19, #FF8A65)",
    cardBackClinic:   "#BF360C",
    cardBackInvite:   "#E64A19",
    cardBackStars:    "#FF8A65",
    cardBackAccent:   "#E64A19",
  },
  {
    id: "professional-gray", name: "Pro Gray", desc: "科技诊所 · 专科",
    preview: "/images/qr-previews/preview_style_05_gray.jpg",
    deskBg:           "#FFFFFF",
    deskBar:          "linear-gradient(90deg, #37474F, #90A4AE)",
    deskBarSolid:     "#37474F",
    deskClinicColor:  "#263238",
    deskInviteColor:  "#546E7A",
    deskScanColor:    "#263238",
    deskGoogleColor:  "#263238",
    deskStarsColor:   "#90A4AE",
    deskAccent:       "#37474F",
    deskBorder:       "#90A4AE",
    deskHasBorder:    true,
    cardBar:          "#37474F",
    cardThanks:       "#263238",
    cardDr:           "#263238",
    cardTitle:        "#546E7A",
    cardIcon:         "#546E7A",
    cardBackBg:       "#FFFFFF",
    cardBackBar:      "linear-gradient(90deg, #37474F, #90A4AE)",
    cardBackClinic:   "#263238",
    cardBackInvite:   "#546E7A",
    cardBackStars:    "#90A4AE",
    cardBackAccent:   "#37474F",
  },
  {
    id: "forest-green", name: "Forest Green", desc: "中医 · 养生",
    preview: "/images/qr-previews/preview_style_06_forest.jpg",
    deskBg:           "#FAF5EF",
    deskBar:          "linear-gradient(90deg, #33691E, #8D6E63)",
    deskBarSolid:     "#33691E",
    deskClinicColor:  "#1B5E20",
    deskInviteColor:  "#558B2F",
    deskScanColor:    "#1B5E20",
    deskGoogleColor:  "#1B5E20",
    deskStarsColor:   "#8D6E63",
    deskAccent:       "#8D6E63",
    deskBorder:       "#8D6E63",
    deskHasBorder:    true,
    cardBar:          "#33691E",
    cardThanks:       "#1B5E20",
    cardDr:           "#1B5E20",
    cardTitle:        "#558B2F",
    cardIcon:         "#558B2F",
    cardBackBg:       "#FAF5EF",
    cardBackBar:      "linear-gradient(90deg, #33691E, #8D6E63)",
    cardBackClinic:   "#1B5E20",
    cardBackInvite:   "#558B2F",
    cardBackStars:    "#8D6E63",
    cardBackAccent:   "#8D6E63",
  },
  {
    id: "luxury-blue-gold", name: "Luxury Gold", desc: "高端私立 · VIP",
    preview: "/images/qr-previews/preview_style_07_luxury.jpg",
    deskBg:           "linear-gradient(135deg, #051C3A, #0D3B66)",
    deskBar:          "linear-gradient(90deg, #051C3A, #0D3B66)",
    deskBarSolid:     "#051C3A",
    deskClinicColor:  "#FFFFFF",
    deskInviteColor:  "#D4AF37",
    deskScanColor:    "#FFFFFF",
    deskGoogleColor:  "#FFFFFF",
    deskStarsColor:   "#D4AF37",
    deskAccent:       "#D4AF37",
    deskBorder:       null,
    deskHasBorder:    false,
    cardBar:          "#051C3A",
    cardThanks:       "#051C3A",
    cardDr:           "#051C3A",
    cardTitle:        "#D4AF37",
    cardIcon:         "#D4AF37",
    cardBackBg:       "linear-gradient(135deg, #051C3A, #0D3B66)",
    cardBackBar:      "linear-gradient(90deg, #051C3A, #0D3B66)",
    cardBackClinic:   "#FFFFFF",
    cardBackInvite:   "#D4AF37",
    cardBackStars:    "#D4AF37",
    cardBackAccent:   "#D4AF37",
  },
];

// ====================================================================
export default function QRCodePage() {
  const router = useRouter();
  const deskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardFrontRef = useRef<HTMLCanvasElement | null>(null);
  const cardBackRef = useRef<HTMLCanvasElement | null>(null);

  const [googleLink, setGoogleLink] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic-blue");
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  // 诊所信息（用户可编辑）
  const [drName, setDrName] = useState("");
  const [drTitle, setDrTitle] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicWeb, setClinicWeb] = useState("");
  const [clinicAddr, setClinicAddr] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const t = TEMPLATES.find(x => x.id === selectedTemplate) || TEMPLATES[0];

  // ========== 加载数据 ==========
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: biz } = await supabase
        .from("businesses")
        .select("name, google_review_link, owner_name, owner_phone")
        .eq("user_id", user.id)
        .single();
      if (biz) {
        setClinicName(biz.name || "My Clinic");
        setGoogleLink(biz.google_review_link || "");
        setDrName(biz.owner_name || "");
        setClinicPhone(biz.owner_phone || "");
      }
      setLoading(false);
    };
    loadData();
  }, [supabase, router]);

  // ========== 生成 QR data URL ==========
  const generateQRDataUrl = useCallback(async (size: number): Promise<string> => {
    if (!googleLink) return "";
    try {
      return await QRCode.toDataURL(googleLink, {
        width: size,
        margin: 2,
        color: { dark: t.deskBarSolid, light: "#FFFFFF" },
        errorCorrectionLevel: "H",
      });
    } catch { return ""; }
  }, [googleLink, t.deskBarSolid]);

  // ========== 绘制桌面立牌 ==========
  const drawDeskStand = useCallback(async () => {
    const canvas = deskCanvasRef.current;
    if (!canvas) return;
    const w = 500, h = 580;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // 背景
    if (t.deskBg.startsWith("linear-gradient")) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, t.deskBarSolid);
      grad.addColorStop(1, t.deskInviteColor);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = t.deskBg;
    }
    ctx.beginPath(); roundRect(ctx, 0, 0, w, h, 24);
    ctx.fill();
    if (t.deskHasBorder && t.deskBorder) {
      ctx.strokeStyle = t.deskBorder; ctx.lineWidth = 3;
      ctx.beginPath(); roundRect(ctx, 1, 1, w-2, h-2, 24);
      ctx.stroke();
    }

    // 顶部栏
    ctx.beginPath(); roundRectTop(ctx, 0, 0, w, 64, 24);
    const barGrad = ctx.createLinearGradient(0, 0, w, 0);
    barGrad.addColorStop(0, t.deskBarSolid);
    barGrad.addColorStop(1, t.deskInviteColor);
    ctx.fillStyle = barGrad;
    ctx.fill();

    // 牙齿 icon（用文字模拟）
    ctx.font = "28px serif"; ctx.fillStyle = t.deskAccent;
    ctx.textAlign = "center";
    ctx.fillText("🦷", w/2, 128);

    // 诊所名
    ctx.font = "bold 22px sans-serif"; ctx.fillStyle = t.deskClinicColor;
    ctx.textAlign = "center";
    ctx.fillText(clinicName || "Your Clinic", w/2, 175);

    // We'd love your feedback
    ctx.font = "14px sans-serif"; ctx.fillStyle = t.deskInviteColor;
    ctx.fillText("We'd love your feedback", w/2, 205);

    // QR 码
    const qrData = await generateQRDataUrl(220);
    if (qrData) {
      const img = new window.Image();
      await new Promise<void>(r => { img.onload = () => r(); img.src = qrData; });
      ctx.drawImage(img, (w-220)/2, 220, 220, 220);
    }

    // Scan text
    ctx.font = "12px sans-serif"; ctx.fillStyle = t.deskScanColor;
    ctx.fillText("Scan to leave a Google Review", w/2, 462);

    // Google + Stars
    ctx.font = "11px sans-serif"; ctx.fillStyle = t.deskGoogleColor;
    ctx.fillText("📱 Google Reviews", w/2 - 60, 492);
    ctx.font = "16px sans-serif"; ctx.fillStyle = t.deskStarsColor;
    ctx.fillText("★★★★★", w/2 + 60, 493);
  }, [googleLink, clinicName, t, generateQRDataUrl]);

  // ========== 绘制名片正面 ==========
  const drawCardFront = useCallback(() => {
    const canvas = cardFrontRef.current;
    if (!canvas) return;
    const w = 420, h = 260;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // 白色背景
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); roundRect(ctx, 0, 0, w, h, 16);
    ctx.fill();
    // 阴影模拟
    ctx.shadowColor = "#00000015"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
    ctx.beginPath(); roundRect(ctx, 2, 2, w-4, h-4, 16);
    ctx.fill();
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // 顶部色条
    ctx.fillStyle = t.cardBar;
    ctx.beginPath(); roundRectTop(ctx, 0, 0, w, 6, 16);
    ctx.fill();

    // Thank you
    ctx.font = "bold 13px sans-serif"; ctx.fillStyle = t.cardThanks;
    ctx.textAlign = "left";
    ctx.fillText("Thank you for trusting us", 22, 40);
    ctx.font = "11px sans-serif"; ctx.fillStyle = "#888";
    ctx.fillText("with your smile!", 22, 58);

    // 分割线
    ctx.strokeStyle = "#E0E0E0"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(22, 72); ctx.lineTo(w-22, 72); ctx.stroke();

    // Dr. 姓名
    ctx.font = "bold 18px sans-serif"; ctx.fillStyle = t.cardDr;
    ctx.fillText(`Dr. ${drName || "[Doctor Name]"}`, 22, 100);

    // 职位
    ctx.font = "12px sans-serif"; ctx.fillStyle = t.cardTitle;
    ctx.fillText(drTitle || "[Title]", 22, 124);

    // 联系方式
    const iconX = 22, textX = 40, lineH = 20;
    ctx.font = "11px sans-serif"; ctx.fillStyle = t.cardIcon;
    ctx.fillText("📞", iconX, 154);
    ctx.fillStyle = "#666"; ctx.font = "11px sans-serif";
    ctx.fillText(clinicPhone || "(555) 123-4567", textX, 154);

    ctx.fillStyle = t.cardIcon; ctx.font = "11px sans-serif";
    ctx.fillText("🌐", iconX, 154 + lineH);
    ctx.fillStyle = "#666"; ctx.font = "11px sans-serif";
    ctx.fillText(clinicWeb || "www.clinic.com", textX, 154 + lineH);

    ctx.fillStyle = t.cardIcon; ctx.font = "11px sans-serif";
    ctx.fillText("📍", iconX, 154 + lineH*2);
    ctx.fillStyle = "#666"; ctx.font = "11px sans-serif";
    ctx.fillText(clinicAddr || "123 Healthcare Ave", textX, 154 + lineH*2);

    // Powered by
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#BBB";
    ctx.textAlign = "left";
    ctx.fillText("Powered by ReviewFlow", 22, 240);
  }, [t, drName, drTitle, clinicPhone, clinicWeb, clinicAddr]);

  // ========== 绘制名片背面 ==========
  const drawCardBack = useCallback(async () => {
    const canvas = cardBackRef.current;
    if (!canvas) return;
    const w = 420, h = 310;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // 背景
    if (t.cardBackBg.startsWith("linear-gradient")) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, t.deskBarSolid);
      grad.addColorStop(1, t.deskInviteColor);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = t.cardBackBg;
    }
    ctx.beginPath(); roundRect(ctx, 0, 0, w, h, 16);
    ctx.fill();

    // 顶部栏
    ctx.beginPath(); roundRectTop(ctx, 0, 0, w, 38, 16);
    const barGrad = ctx.createLinearGradient(0, 0, w, 0);
    barGrad.addColorStop(0, t.deskBarSolid);
    barGrad.addColorStop(1, t.deskInviteColor);
    ctx.fillStyle = barGrad;
    ctx.fill();

    // 牙标
    ctx.font = "24px serif"; ctx.fillStyle = t.cardBackAccent;
    ctx.textAlign = "center";
    ctx.fillText("🦷", w/2, 80);

    // 诊所名
    ctx.font = "bold 16px sans-serif"; ctx.fillStyle = t.cardBackClinic;
    ctx.fillText(clinicName || "Your Clinic", w/2, 115);

    // We'd love...
    ctx.font = "11px sans-serif"; ctx.fillStyle = t.cardBackInvite;
    ctx.fillText("We'd love your feedback", w/2, 138);

    // QR 码 (小)
    const qrData = await generateQRDataUrl(110);
    if (qrData) {
      const img = new window.Image();
      await new Promise<void>(r => { img.onload = () => r(); img.src = qrData; });
      ctx.drawImage(img, (w-110)/2, 150, 110, 110);
    }

    // 星星
    ctx.font = "13px sans-serif"; ctx.fillStyle = t.cardBackStars;
    ctx.fillText("★★★★★", w/2, 288);
  }, [googleLink, clinicName, t, generateQRDataUrl]);

  // ========== 全部重新绘制 ==========
  const redrawAll = useCallback(async () => {
    await drawDeskStand();
    drawCardFront();
    await drawCardBack();
  }, [drawDeskStand, drawCardFront, drawCardBack]);

  useEffect(() => { if (googleLink) redrawAll(); }, [redrawAll, googleLink]);

  // ========== 保存链接 ==========
  const handleSaveLink = async () => {
    if (!googleLink.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("businesses").update({ google_review_link: googleLink.trim() }).eq("user_id", user.id);
    setSaving(false);
    setTimeout(() => redrawAll(), 300);
  };

  // ========== 下载 ==========
  const downloadCanvas = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    a.click();
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center"><div className="text-brand-muted">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue"><ArrowLeft size={16} />Back to Dashboard</Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center"><QrCode className="w-6 h-6 text-brand-blue" /></div>
          <div>
            <h1 className="font-outfit font-bold text-2xl text-brand-dark">QR Code Generator</h1>
            <p className="text-brand-muted text-sm">7 professional templates — Desk Stand + Business Card (Front & Back)</p>
          </div>
        </div>

        {/* ======= Step 1: Review Link ======= */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">1</span>
            <h2 className="font-semibold text-brand-dark">Google Review Link</h2>
          </div>
          {!googleLink ? (
            <div>
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">No review link yet</p>
                    <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-yellow-700 underline inline-flex items-center gap-1"><HelpCircle size={12} />How to find {showGuide ? "▲" : "▼"}</button>
                    {showGuide && (
                      <div className="mt-2 text-xs text-yellow-700 space-y-1">
                        <p>1. Go to business.google.com → Your Business</p>
                        <p>2. Click "Get more reviews" → Copy the short URL</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="url" value={googleLink} onChange={e => setGoogleLink(e.target.value)} placeholder="https://g.page/your-clinic/review" className="flex-1 rounded-xl border border-brand-soft p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                <button onClick={handleSaveLink} disabled={saving || !googleLink.trim()} className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark disabled:opacity-50">{saving ? "Saving..." : "Save & Continue"}</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700"><CheckCircle size={14} className="text-green-500 shrink-0" /><span className="truncate">{googleLink}</span></div>
              <button onClick={() => { navigator.clipboard.writeText(googleLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 text-brand-muted hover:text-brand-blue">{copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}</button>
              <button onClick={() => setGoogleLink("")} className="p-2 text-brand-muted hover:text-red-500"><RefreshCw size={14} /></button>
            </div>
          )}
        </div>

        {/* ======= Step 2: Template + Info ======= */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">2</span>
            <h2 className="font-semibold text-brand-dark">Choose Template & Business Card Info</h2>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {TEMPLATES.map(tmpl => (
              <button key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all relative ${selectedTemplate === tmpl.id ? "border-brand-blue bg-brand-soft" : "border-gray-100 hover:border-brand-blue/30"}`}>
                <div className="relative w-full aspect-square rounded-lg mb-2 overflow-hidden bg-gray-50 cursor-pointer group"
                  onClick={(e) => { e.stopPropagation(); setPreviewTemplate(previewTemplate === tmpl.id ? null : tmpl.id); }}>
                  <img src={tmpl.preview} alt={tmpl.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border" style={{ backgroundColor: tmpl.deskBarSolid }} /><span className="font-medium text-xs">{tmpl.name}</span></div>
                <p className="text-[10px] text-brand-muted mt-1">{tmpl.desc}</p>
                {selectedTemplate === tmpl.id && <CheckCircle size={14} className="absolute top-2 right-2 text-brand-blue" />}
              </button>
            ))}
          </div>

          {/* Card Info Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <div><label className="text-xs text-brand-muted mb-1 block">Clinic Name</label><input value={clinicName} onChange={e => setClinicName(e.target.value)} className="w-full rounded-lg border px-2 py-1.5 text-sm" /></div>
            <div><label className="text-xs text-brand-muted mb-1 block">Doctor Name</label><input value={drName} onChange={e => setDrName(e.target.value)} placeholder="Dr. Smith" className="w-full rounded-lg border px-2 py-1.5 text-sm" /></div>
            <div><label className="text-xs text-brand-muted mb-1 block">Title</label><input value={drTitle} onChange={e => setDrTitle(e.target.value)} placeholder="General Dentist" className="w-full rounded-lg border px-2 py-1.5 text-sm" /></div>
            <div><label className="text-xs text-brand-muted mb-1 block">Phone</label><input value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} placeholder="(555) 123-4567" className="w-full rounded-lg border px-2 py-1.5 text-sm" /></div>
            <div><label className="text-xs text-brand-muted mb-1 block">Website</label><input value={clinicWeb} onChange={e => setClinicWeb(e.target.value)} placeholder="clinic.com" className="w-full rounded-lg border px-2 py-1.5 text-sm" /></div>
          </div>
        </div>

        {/* ======= Step 3: Previews & Downloads ======= */}
        {googleLink && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">3</span>
              <h2 className="font-semibold text-brand-dark">Preview & Download</h2>
            </div>

            {/* 3-column preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Desk Stand */}
              <div className="text-center">
                <h3 className="font-semibold text-sm text-brand-dark mb-3">Desk Stand <span className="text-xs text-brand-muted font-normal">4"×4" / 5"×5"</span></h3>
                <div className="bg-gray-100 rounded-xl p-3 inline-block">
                  <canvas ref={(el: HTMLCanvasElement | null) => { deskCanvasRef.current = el; }} className="max-w-full h-auto rounded-lg" style={{ maxHeight: 320 }} />
                </div>
                <button onClick={() => downloadCanvas(deskCanvasRef.current, `desk-stand-${selectedTemplate}.png`)}
                  className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2">
                  <Download size={14} />Download Desk Stand
                </button>
              </div>

              {/* Card Front */}
              <div className="text-center">
                <h3 className="font-semibold text-sm text-brand-dark mb-3">Business Card Front <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
                <div className="bg-gray-100 rounded-xl p-3 inline-block">
                  <canvas ref={(el: HTMLCanvasElement | null) => { cardFrontRef.current = el; }} className="max-w-full h-auto rounded-lg" style={{ maxHeight: 320 }} />
                </div>
                <button onClick={() => downloadCanvas(cardFrontRef.current, `card-front-${selectedTemplate}.png`)}
                  className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2">
                  <Download size={14} />Download Card Front
                </button>
              </div>

              {/* Card Back */}
              <div className="text-center">
                <h3 className="font-semibold text-sm text-brand-dark mb-3">Business Card Back <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
                <div className="bg-gray-100 rounded-xl p-3 inline-block">
                  <canvas ref={(el: HTMLCanvasElement | null) => { cardBackRef.current = el; }} className="max-w-full h-auto rounded-lg" style={{ maxHeight: 320 }} />
                </div>
                <button onClick={() => downloadCanvas(cardBackRef.current, `card-back-${selectedTemplate}.png`)}
                  className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2">
                  <Download size={14} />Download Card Back
                </button>
              </div>
            </div>

            {/* Print All */}
            <div className="text-center pt-4 border-t border-brand-soft/50">
              <button onClick={() => {
                downloadCanvas(deskCanvasRef.current, `desk-stand-${selectedTemplate}.png`);
                setTimeout(() => downloadCanvas(cardFrontRef.current, `card-front-${selectedTemplate}.png`), 200);
                setTimeout(() => downloadCanvas(cardBackRef.current, `card-back-${selectedTemplate}.png`), 400);
              }} className="px-6 py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors inline-flex items-center gap-2">
                <Printer size={14} />Download All 3
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        {googleLink && (
          <div className="bg-brand-soft rounded-2xl p-6">
            <h3 className="font-semibold text-brand-dark text-sm mb-3">Placement Tips</h3>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>• Desk stand at front desk where patients check out</li>
              <li>• Business cards in waiting room and treatment rooms</li>
              <li>• Include card with receipts for patients who review later</li>
            </ul>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <img src={TEMPLATES.find(x => x.id === previewTemplate)?.preview} alt="Preview" className="w-full rounded-xl" />
            <button onClick={() => setPreviewTemplate(null)} className="mt-3 w-full py-2 text-sm font-semibold text-brand-muted hover:text-brand-dark">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== Canvas Helpers ==========
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
