"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode";
import {
  ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle,
  AlertTriangle, HelpCircle, RefreshCw, Image
} from "lucide-react";

// ====================================================================
// 7 种模板 — 从 .page 文件精确提取渐变色对
// ====================================================================
interface Tpl {
  id: string; name: string; desc: string; preview: string;
  // 桌面立牌
  deskBgSolid: string | null;    // null=用渐变
  deskBg1: string; deskBg2: string;
  deskBar1: string; deskBar2: string;
  deskClinic: string; deskInvite: string; deskScan: string;
  deskGoogle: string; deskStars: string; deskAccent: string;
  deskBorder: string | null;
  // 名片正面
  cardBar: string; cardThanks: string; cardDr: string; cardTitle: string; cardIcon: string;
  // 名片背面
  cardBackSolid: string | null;
  cardBackBg1: string; cardBackBg2: string;
  cardBackBar1: string; cardBackBar2: string;
  cardBackClinic: string; cardBackInvite: string; cardBackStars: string; cardBackAccent: string;
}

const T: Tpl[] = [
  { // 01 Classic Blue — 渐变深蓝背景
    id: "classic-blue", name: "Classic Blue", desc: "全科诊所 · 牙科 · 骨科",
    preview: "/images/qr-previews/preview_style_01_classic_blue.jpg",
    deskBgSolid: null, deskBg1: "#0A2463", deskBg2: "#1E88E5",
    deskBar1: "#0A2463", deskBar2: "#1E88E5",
    deskClinic: "#FFFFFF", deskInvite: "#1E88E5", deskScan: "#FFFFFF",
    deskGoogle: "#FFFFFF", deskStars: "#FDC500", deskAccent: "#FDC500", deskBorder: null,
    cardBar: "#0A2463", cardThanks: "#0A2463", cardDr: "#0A2463", cardTitle: "#1E88E5", cardIcon: "#1E88E5",
    cardBackSolid: null, cardBackBg1: "#0A2463", cardBackBg2: "#1E88E5",
    cardBackBar1: "#0A2463", cardBackBar2: "#1E88E5",
    cardBackClinic: "#FFFFFF", cardBackInvite: "#1E88E5", cardBackStars: "#FDC500", cardBackAccent: "#FDC500",
  },
  { // 02 Mint Green — 白底 + 绿色顶栏
    id: "mint-green", name: "Mint Green", desc: "儿科 · 医美 · 中医",
    preview: "/images/qr-previews/preview_style_02_mint_green.jpg",
    deskBgSolid: "#FFFFFF", deskBg1: "#FFFFFF", deskBg2: "#FFFFFF",
    deskBar1: "#2E7D32", deskBar2: "#81C784",
    deskClinic: "#1B5E20", deskInvite: "#4CAF50", deskScan: "#1B5E20",
    deskGoogle: "#1B5E20", deskStars: "#81C784", deskAccent: "#4CAF50", deskBorder: "#4CAF50",
    cardBar: "#2E7D32", cardThanks: "#1B5E20", cardDr: "#1B5E20", cardTitle: "#4CAF50", cardIcon: "#4CAF50",
    cardBackSolid: "#FFFFFF", cardBackBg1: "#FFFFFF", cardBackBg2: "#FFFFFF",
    cardBackBar1: "#2E7D32", cardBackBar2: "#81C784",
    cardBackClinic: "#1B5E20", cardBackInvite: "#4CAF50", cardBackStars: "#81C784", cardBackAccent: "#4CAF50",
  },
  { // 03 Elegant Violet — 渐变紫色背景
    id: "elegant-violet", name: "Elegant Violet", desc: "高端医美 · 整形",
    preview: "/images/qr-previews/preview_style_03_violet.jpg",
    deskBgSolid: null, deskBg1: "#4A148C", deskBg2: "#7B1FA2",
    deskBar1: "#4A148C", deskBar2: "#7B1FA2",
    deskClinic: "#FFFFFF", deskInvite: "#CE93D8", deskScan: "#FFFFFF",
    deskGoogle: "#FFFFFF", deskStars: "#D4AF37", deskAccent: "#D4AF37", deskBorder: null,
    cardBar: "#4A148C", cardThanks: "#4A148C", cardDr: "#4A148C", cardTitle: "#7B1FA2", cardIcon: "#7B1FA2",
    cardBackSolid: null, cardBackBg1: "#4A148C", cardBackBg2: "#7B1FA2",
    cardBackBar1: "#4A148C", cardBackBar2: "#7B1FA2",
    cardBackClinic: "#FFFFFF", cardBackInvite: "#CE93D8", cardBackStars: "#D4AF37", cardBackAccent: "#D4AF37",
  },
  { // 04 Coral Orange — 白底 + 橙色顶栏
    id: "coral-orange", name: "Coral Orange", desc: "家庭诊所 · 理疗",
    preview: "/images/qr-previews/preview_style_04_coral.jpg",
    deskBgSolid: "#FFFFFF", deskBg1: "#FFFFFF", deskBg2: "#FFFFFF",
    deskBar1: "#E64A19", deskBar2: "#FF8A65",
    deskClinic: "#BF360C", deskInvite: "#E64A19", deskScan: "#BF360C",
    deskGoogle: "#BF360C", deskStars: "#FF8A65", deskAccent: "#E64A19", deskBorder: "#E64A19",
    cardBar: "#E64A19", cardThanks: "#BF360C", cardDr: "#BF360C", cardTitle: "#E64A19", cardIcon: "#E64A19",
    cardBackSolid: "#FFFFFF", cardBackBg1: "#FFFFFF", cardBackBg2: "#FFFFFF",
    cardBackBar1: "#E64A19", cardBackBar2: "#FF8A65",
    cardBackClinic: "#BF360C", cardBackInvite: "#E64A19", cardBackStars: "#FF8A65", cardBackAccent: "#E64A19",
  },
  { // 05 Pro Gray — 白底 + 灰色顶栏
    id: "professional-gray", name: "Pro Gray", desc: "科技诊所 · 专科",
    preview: "/images/qr-previews/preview_style_05_gray.jpg",
    deskBgSolid: "#FFFFFF", deskBg1: "#FFFFFF", deskBg2: "#FFFFFF",
    deskBar1: "#37474F", deskBar2: "#90A4AE",
    deskClinic: "#263238", deskInvite: "#546E7A", deskScan: "#263238",
    deskGoogle: "#263238", deskStars: "#90A4AE", deskAccent: "#37474F", deskBorder: "#90A4AE",
    cardBar: "#37474F", cardThanks: "#263238", cardDr: "#263238", cardTitle: "#546E7A", cardIcon: "#546E7A",
    cardBackSolid: "#FFFFFF", cardBackBg1: "#FFFFFF", cardBackBg2: "#FFFFFF",
    cardBackBar1: "#37474F", cardBackBar2: "#90A4AE",
    cardBackClinic: "#263238", cardBackInvite: "#546E7A", cardBackStars: "#90A4AE", cardBackAccent: "#37474F",
  },
  { // 06 Forest Green — 米色底 + 绿褐顶栏
    id: "forest-green", name: "Forest Green", desc: "中医 · 养生",
    preview: "/images/qr-previews/preview_style_06_forest.jpg",
    deskBgSolid: "#FAF5EF", deskBg1: "#FAF5EF", deskBg2: "#FAF5EF",
    deskBar1: "#33691E", deskBar2: "#8D6E63",
    deskClinic: "#1B5E20", deskInvite: "#558B2F", deskScan: "#1B5E20",
    deskGoogle: "#1B5E20", deskStars: "#8D6E63", deskAccent: "#8D6E63", deskBorder: "#8D6E63",
    cardBar: "#33691E", cardThanks: "#1B5E20", cardDr: "#1B5E20", cardTitle: "#558B2F", cardIcon: "#558B2F",
    cardBackSolid: "#FAF5EF", cardBackBg1: "#FAF5EF", cardBackBg2: "#FAF5EF",
    cardBackBar1: "#33691E", cardBackBar2: "#8D6E63",
    cardBackClinic: "#1B5E20", cardBackInvite: "#558B2F", cardBackStars: "#8D6E63", cardBackAccent: "#8D6E63",
  },
  { // 07 Luxury Gold — 渐变深蓝 + 金色点缀
    id: "luxury-blue-gold", name: "Luxury Gold", desc: "高端私立 · VIP",
    preview: "/images/qr-previews/preview_style_07_luxury.jpg",
    deskBgSolid: null, deskBg1: "#051C3A", deskBg2: "#0D3B66",
    deskBar1: "#051C3A", deskBar2: "#0D3B66",
    deskClinic: "#FFFFFF", deskInvite: "#D4AF37", deskScan: "#FFFFFF",
    deskGoogle: "#FFFFFF", deskStars: "#D4AF37", deskAccent: "#D4AF37", deskBorder: null,
    cardBar: "#051C3A", cardThanks: "#051C3A", cardDr: "#051C3A", cardTitle: "#D4AF37", cardIcon: "#D4AF37",
    cardBackSolid: null, cardBackBg1: "#051C3A", cardBackBg2: "#0D3B66",
    cardBackBar1: "#051C3A", cardBackBar2: "#0D3B66",
    cardBackClinic: "#FFFFFF", cardBackInvite: "#D4AF37", cardBackStars: "#D4AF37", cardBackAccent: "#D4AF37",
  },
];

// ====================================================================
export default function QRCodePage() {
  const router = useRouter();
  const deskRef = useRef<HTMLCanvasElement | null>(null);
  const frontRef = useRef<HTMLCanvasElement | null>(null);
  const backRef = useRef<HTMLCanvasElement | null>(null);

  const [googleLink, setGoogleLink] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sel, setSel] = useState("classic-blue");
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<string | null>(null);
  const [drName, setDrName] = useState("");
  const [drTitle, setDrTitle] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicWeb, setClinicWeb] = useState("");
  const [clinicAddr, setClinicAddr] = useState("");

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const tpl = T.find(x => x.id === sel) || T[0];

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: biz } = await supabase.from("businesses").select("name, google_review_link, owner_name, owner_phone").eq("user_id", user.id).single();
      if (biz) {
        setClinicName(biz.name || "My Clinic");
        setGoogleLink(biz.google_review_link || "");
        setDrName(biz.owner_name || "");
        setClinicPhone(biz.owner_phone || "");
      }
      setLoading(false);
    })();
  }, [supabase, router]);

  // ========== Canvas 绘制 ==========
  const fillGrad = (ctx: CanvasRenderingContext2D, c1: string, c2: string, w: number, h: number, angle: number) => {
    const rad = angle * Math.PI / 180;
    const x2 = Math.cos(rad) * w, y2 = Math.sin(rad) * h;
    const g = ctx.createLinearGradient(0, 0, x2, y2);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
  };

  const drawAll = useCallback(async () => {
    if (!googleLink) return;
    const qrDataUrl = await QRCode.toDataURL(googleLink, { width: 400, margin: 2, color: { dark: tpl.deskBar1, light: "#FFFFFF" }, errorCorrectionLevel: "H" });
    if (!qrDataUrl) return;
    const qrImg = new window.Image();
    await new Promise<void>(r => { qrImg.onload = () => r(); qrImg.src = qrDataUrl; });

    // ---- 桌面立牌 500x580 ----
    {
      const c = deskRef.current; if (!c) return;
      const W = 500, H = 580; c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;

      // 背景
      ctx.beginPath(); rr(ctx, 0, 0, W, H, 24);
      if (tpl.deskBgSolid) { ctx.fillStyle = tpl.deskBgSolid; }
      else { fillGrad(ctx, tpl.deskBg1, tpl.deskBg2, W, H, 135); }
      ctx.fill();
      if (tpl.deskBorder) { ctx.strokeStyle = tpl.deskBorder; ctx.lineWidth = 3; ctx.beginPath(); rr(ctx, 1, 1, W-2, H-2, 24); ctx.stroke(); }

      // 顶栏
      ctx.beginPath(); rrt(ctx, 0, 0, W, 64, 24);
      fillGrad(ctx, tpl.deskBar1, tpl.deskBar2, W, 64, 0);
      ctx.fill();

      // 图标
      ctx.font = "28px serif"; ctx.fillStyle = tpl.deskAccent; ctx.textAlign = "center";
      ctx.fillText("🦷", W/2, 128);
      // 诊所名
      ctx.font = "bold 22px sans-serif"; ctx.fillStyle = tpl.deskClinic; ctx.fillText(clinicName || "Your Clinic", W/2, 175);
      // 邀请语
      ctx.font = "14px sans-serif"; ctx.fillStyle = tpl.deskInvite; ctx.fillText("We'd love your feedback", W/2, 205);
      // QR
      ctx.drawImage(qrImg, (W-220)/2, 220, 220, 220);
      // 扫码提示
      ctx.font = "12px sans-serif"; ctx.fillStyle = tpl.deskScan; ctx.fillText("Scan to leave a Google Review", W/2, 462);
      // Google + 星星
      ctx.font = "11px sans-serif"; ctx.fillStyle = tpl.deskGoogle; ctx.fillText("Google Reviews", W/2 - 65, 492);
      ctx.font = "16px sans-serif"; ctx.fillStyle = tpl.deskStars; ctx.fillText("★★★★★", W/2 + 65, 493);
    }

    // ---- 名片正面 420x260 ----
    {
      const c = frontRef.current; if (!c) return;
      const W = 420, H = 260; c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#FFF"; ctx.beginPath(); rr(ctx, 0, 0, W, H, 16); ctx.fill();
      // 顶条
      ctx.fillStyle = tpl.cardBar; ctx.beginPath(); rrt(ctx, 0, 0, W, 6, 16); ctx.fill();
      // 文字
      ctx.textAlign = "left";
      ctx.font = "bold 13px sans-serif"; ctx.fillStyle = tpl.cardThanks; ctx.fillText("Thank you for trusting us", 22, 40);
      ctx.font = "11px sans-serif"; ctx.fillStyle = "#888"; ctx.fillText("with your smile!", 22, 58);
      ctx.strokeStyle = "#E0E0E0"; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(22, 72); ctx.lineTo(W-22, 72); ctx.stroke();
      ctx.font = "bold 18px sans-serif"; ctx.fillStyle = tpl.cardDr; ctx.fillText(`Dr. ${drName || "[Doctor Name]"}`, 22, 100);
      ctx.font = "12px sans-serif"; ctx.fillStyle = tpl.cardTitle; ctx.fillText(drTitle || "[Title]", 22, 124);
      ctx.font = "11px sans-serif"; ctx.fillStyle = tpl.cardIcon; ctx.fillText("📞", 22, 154);
      ctx.fillStyle = "#666"; ctx.font = "11px sans-serif"; ctx.fillText(clinicPhone || "(555) 123-4567", 40, 154);
      ctx.fillStyle = tpl.cardIcon; ctx.fillText("🌐", 22, 174);
      ctx.fillStyle = "#666"; ctx.fillText(clinicWeb || "www.clinic.com", 40, 174);
      ctx.fillStyle = tpl.cardIcon; ctx.fillText("📍", 22, 194);
      ctx.fillStyle = "#666"; ctx.fillText(clinicAddr || "123 Healthcare Ave", 40, 194);
      ctx.font = "9px sans-serif"; ctx.fillStyle = "#BBB"; ctx.fillText("Powered by ReviewFlow", 22, 240);
    }

    // ---- 名片背面 420x310 ----
    {
      const c = backRef.current; if (!c) return;
      const W = 420, H = 310; c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      ctx.beginPath(); rr(ctx, 0, 0, W, H, 16);
      if (tpl.cardBackSolid) { ctx.fillStyle = tpl.cardBackSolid; }
      else { fillGrad(ctx, tpl.cardBackBg1, tpl.cardBackBg2, W, H, 135); }
      ctx.fill();
      // 顶栏
      ctx.beginPath(); rrt(ctx, 0, 0, W, 38, 16);
      fillGrad(ctx, tpl.cardBackBar1, tpl.cardBackBar2, W, 38, 0);
      ctx.fill();
      // 内容
      ctx.textAlign = "center";
      ctx.font = "24px serif"; ctx.fillStyle = tpl.cardBackAccent; ctx.fillText("🦷", W/2, 80);
      ctx.font = "bold 16px sans-serif"; ctx.fillStyle = tpl.cardBackClinic; ctx.fillText(clinicName || "Your Clinic", W/2, 115);
      ctx.font = "11px sans-serif"; ctx.fillStyle = tpl.cardBackInvite; ctx.fillText("We'd love your feedback", W/2, 138);
      ctx.drawImage(qrImg, (W-110)/2, 150, 110, 110);
      ctx.font = "13px sans-serif"; ctx.fillStyle = tpl.cardBackStars; ctx.fillText("★★★★★", W/2, 288);
    }
  }, [googleLink, clinicName, drName, drTitle, clinicPhone, clinicWeb, clinicAddr, tpl]);

  useEffect(() => { if (googleLink) drawAll(); }, [drawAll, googleLink]);

  const handleSave = async () => {
    if (!googleLink.trim()) return; setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("businesses").update({ google_review_link: googleLink.trim() }).eq("user_id", user.id);
    setSaving(false); setTimeout(() => drawAll(), 300);
  };

  const dl = (cv: HTMLCanvasElement | null, fn: string) => {
    if (!cv) return;
    const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = fn; a.click();
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center"><div className="text-brand-muted">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue"><ArrowLeft size={16} />Back to Dashboard</Link></div>
        <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center"><QrCode className="w-6 h-6 text-brand-blue" /></div><div><h1 className="font-outfit font-bold text-2xl text-brand-dark">QR Code Generator</h1><p className="text-brand-muted text-sm">7 professional templates — Desk Stand + Business Card (Front & Back)</p></div></div>

        {/* Step 1 */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">1</span><h2 className="font-semibold text-brand-dark">Google Review Link</h2></div>
          {!googleLink ? (<div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" /><div><p className="text-sm text-yellow-800 font-medium">No review link yet</p><button onClick={() => setShowGuide(!showGuide)} className="text-xs text-yellow-700 underline inline-flex items-center gap-1"><HelpCircle size={12} />How to find {showGuide ? "▲" : "▼"}</button>{showGuide && <div className="mt-2 text-xs text-yellow-700 space-y-1"><p>1. Go to business.google.com → Your Business</p><p>2. Click "Get more reviews" → Copy the short URL</p></div>}</div></div></div>
            <div className="flex gap-2"><input type="url" value={googleLink} onChange={e => setGoogleLink(e.target.value)} placeholder="https://g.page/your-clinic/review" className="flex-1 rounded-xl border border-brand-soft p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" /><button onClick={handleSave} disabled={saving || !googleLink.trim()} className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark disabled:opacity-50">{saving ? "Saving..." : "Save & Continue"}</button></div>
          </div>) : (<div className="flex items-center justify-between gap-3"><div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700"><CheckCircle size={14} className="text-green-500 shrink-0" /><span className="truncate">{googleLink}</span></div><button onClick={() => { navigator.clipboard.writeText(googleLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 text-brand-muted hover:text-brand-blue">{copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}</button><button onClick={() => setGoogleLink("")} className="p-2 text-brand-muted hover:text-red-500"><RefreshCw size={14} /></button></div>)}
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">2</span><h2 className="font-semibold text-brand-dark">Choose Template & Business Card Info</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {T.map(tm => (
              <button key={tm.id} onClick={() => setSel(tm.id)} className={`p-3 rounded-xl border-2 text-left transition-all relative ${sel === tm.id ? "border-brand-blue bg-brand-soft" : "border-gray-100 hover:border-brand-blue/30"}`}>
                <div className="relative w-full aspect-square rounded-lg mb-2 overflow-hidden bg-gray-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); setPreviewTpl(previewTpl === tm.id ? null : tm.id); }}>
                  <img src={tm.preview} alt={tm.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border" style={{ backgroundColor: tm.deskBar1 }} /><span className="font-medium text-xs">{tm.name}</span></div>
                <p className="text-[10px] text-brand-muted mt-1">{tm.desc}</p>
                {sel === tm.id && <CheckCircle size={14} className="absolute top-2 right-2 text-brand-blue" />}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[{l:"Clinic Name",v:clinicName,s:setClinicName},{l:"Doctor Name",v:drName,s:setDrName,ph:"Dr. Smith"},{l:"Title",v:drTitle,s:setDrTitle,ph:"General Dentist"},{l:"Phone",v:clinicPhone,s:setClinicPhone,ph:"(555) 123-4567"},{l:"Website",v:clinicWeb,s:setClinicWeb,ph:"clinic.com"}].map(f => (
              <div key={f.l}><label className="text-xs text-brand-muted mb-1 block">{f.l}</label><input value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.ph || ""} className="w-full rounded-lg border px-2 py-1.5 text-sm" /></div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        {googleLink && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">3</span><h2 className="font-semibold text-brand-dark">Preview & Download</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[{title:"Desk Stand", sub:"4\"×4\" / 5\"×5\"", ref:deskRef, fn:`desk-stand-${sel}.png`},
                {title:"Business Card Front", sub:"3.5\"×2\"", ref:frontRef, fn:`card-front-${sel}.png`},
                {title:"Business Card Back", sub:"3.5\"×2\"", ref:backRef, fn:`card-back-${sel}.png`}].map(p => (
                <div key={p.title} className="text-center">
                  <h3 className="font-semibold text-sm text-brand-dark mb-3">{p.title} <span className="text-xs text-brand-muted font-normal">{p.sub}</span></h3>
                  <div className="bg-gray-100 rounded-xl p-3 inline-block">
                    <canvas ref={(el: HTMLCanvasElement | null) => { p.ref.current = el; }} className="max-w-full h-auto rounded-lg" style={{ maxHeight: 320 }} />
                  </div>
                  <button onClick={() => dl(p.ref.current, p.fn)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14} />Download</button>
                </div>
              ))}
            </div>
            <div className="text-center pt-4 border-t border-brand-soft/50">
              <button onClick={() => { dl(deskRef.current, `desk-stand-${sel}.png`); setTimeout(() => dl(frontRef.current, `card-front-${sel}.png`), 200); setTimeout(() => dl(backRef.current, `card-back-${sel}.png`), 400); }}
                className="px-6 py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors inline-flex items-center gap-2"><Printer size={14} />Download All 3</button>
            </div>
          </div>
        )}
        {googleLink && <div className="bg-brand-soft rounded-2xl p-6"><h3 className="font-semibold text-brand-dark text-sm mb-3">Placement Tips</h3><ul className="space-y-2 text-sm text-brand-muted"><li>• Desk stand at front desk where patients check out</li><li>• Business cards in waiting room and treatment rooms</li><li>• Include card with receipts for patients who review later</li></ul></div>}
      </div>
      {previewTpl && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewTpl(null)}><div className="bg-white rounded-2xl p-4 max-w-md mx-4" onClick={e => e.stopPropagation()}><img src={T.find(x => x.id === previewTpl)?.preview} alt="Preview" className="w-full rounded-xl" /><button onClick={() => setPreviewTpl(null)} className="mt-3 w-full py-2 text-sm font-semibold text-brand-muted hover:text-brand-dark">Close</button></div></div>}
    </div>
  );
}

// helpers
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function rrt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
