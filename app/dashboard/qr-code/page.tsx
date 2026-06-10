"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import {
  ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle,
  AlertTriangle, HelpCircle, RefreshCw,
  Star, Phone, Globe, MapPin, Stethoscope, MessageCircle
} from "lucide-react";

// ====================================================================
// 7 种模板配色 — 从 .page 文件精确提取
// ====================================================================
interface TplColors {
  id: string; name: string; desc: string; preview: string;
  // 桌面版
  deskIsGradient: boolean; deskBg1: string; deskBg2: string;
  deskBar1: string; deskBar2: string;
  deskClinic: string; deskInvite: string; deskScan: string;
  deskStars: string; deskAccent: string; deskMuted: string;
  deskBorder: string | null;
  // 名片正面
  cardBar: string; cardThanks: string; cardDr: string; cardTitle: string; cardIcon: string;
  // 名片背面
  backIsGradient: boolean; backBg1: string; backBg2: string;
  backBar1: string; backBar2: string;
  backClinic: string; backInvite: string; backStars: string; backAccent: string;
}

const COLORS: TplColors[] = [
  { id:"classic-blue", name:"Classic Blue", desc:"全科 · 牙科 · 骨科", preview:"/images/qr-previews/preview_style_01_classic_blue.jpg",
    deskIsGradient:true, deskBg1:"#0A2463", deskBg2:"#1E88E5", deskBar1:"#0A2463", deskBar2:"#1E88E5",
    deskClinic:"#FFFFFF", deskInvite:"#64B5F6", deskScan:"#BBDEFB", deskStars:"#FDC500", deskAccent:"#FDC500", deskMuted:"#90CAF9", deskBorder:null,
    cardBar:"#0A2463", cardThanks:"#0A2463", cardDr:"#0A2463", cardTitle:"#1E88E5", cardIcon:"#1E88E5",
    backIsGradient:true, backBg1:"#0A2463", backBg2:"#1E88E5", backBar1:"#0A2463", backBar2:"#1E88E5",
    backClinic:"#FFFFFF", backInvite:"#64B5F6", backStars:"#FDC500", backAccent:"#FDC500" },
  { id:"mint-green", name:"Mint Green", desc:"儿科 · 医美 · 中医", preview:"/images/qr-previews/preview_style_02_mint_green.jpg",
    deskIsGradient:false, deskBg1:"#FFFFFF", deskBg2:"#FFFFFF", deskBar1:"#2E7D32", deskBar2:"#81C784",
    deskClinic:"#1B5E20", deskInvite:"#4CAF50", deskScan:"#689F38", deskStars:"#81C784", deskAccent:"#4CAF50", deskMuted:"#A5D6A7", deskBorder:"#4CAF50",
    cardBar:"#2E7D32", cardThanks:"#1B5E20", cardDr:"#1B5E20", cardTitle:"#4CAF50", cardIcon:"#4CAF50",
    backIsGradient:false, backBg1:"#FFFFFF", backBg2:"#FFFFFF", backBar1:"#2E7D32", backBar2:"#81C784",
    backClinic:"#1B5E20", backInvite:"#4CAF50", backStars:"#81C784", backAccent:"#4CAF50" },
  { id:"elegant-violet", name:"Elegant Violet", desc:"高端医美 · 整形", preview:"/images/qr-previews/preview_style_03_violet.jpg",
    deskIsGradient:true, deskBg1:"#4A148C", deskBg2:"#7B1FA2", deskBar1:"#4A148C", deskBar2:"#7B1FA2",
    deskClinic:"#FFFFFF", deskInvite:"#CE93D8", deskScan:"#E1BEE7", deskStars:"#D4AF37", deskAccent:"#D4AF37", deskMuted:"#9575CD", deskBorder:null,
    cardBar:"#4A148C", cardThanks:"#4A148C", cardDr:"#4A148C", cardTitle:"#7B1FA2", cardIcon:"#7B1FA2",
    backIsGradient:true, backBg1:"#4A148C", backBg2:"#7B1FA2", backBar1:"#4A148C", backBar2:"#7B1FA2",
    backClinic:"#FFFFFF", backInvite:"#CE93D8", backStars:"#D4AF37", backAccent:"#D4AF37" },
  { id:"coral-orange", name:"Coral Orange", desc:"家庭诊所 · 理疗", preview:"/images/qr-previews/preview_style_04_coral.jpg",
    deskIsGradient:false, deskBg1:"#FFFFFF", deskBg2:"#FFFFFF", deskBar1:"#E64A19", deskBar2:"#FF8A65",
    deskClinic:"#BF360C", deskInvite:"#E64A19", deskScan:"#FF7043", deskStars:"#FF8A65", deskAccent:"#E64A19", deskMuted:"#FFAB91", deskBorder:"#E64A19",
    cardBar:"#E64A19", cardThanks:"#BF360C", cardDr:"#BF360C", cardTitle:"#E64A19", cardIcon:"#E64A19",
    backIsGradient:false, backBg1:"#FFFFFF", backBg2:"#FFFFFF", backBar1:"#E64A19", backBar2:"#FF8A65",
    backClinic:"#BF360C", backInvite:"#E64A19", backStars:"#FF8A65", backAccent:"#E64A19" },
  { id:"professional-gray", name:"Pro Gray", desc:"科技诊所 · 专科", preview:"/images/qr-previews/preview_style_05_gray.jpg",
    deskIsGradient:false, deskBg1:"#FFFFFF", deskBg2:"#FFFFFF", deskBar1:"#37474F", deskBar2:"#90A4AE",
    deskClinic:"#263238", deskInvite:"#546E7A", deskScan:"#607D8B", deskStars:"#90A4AE", deskAccent:"#37474F", deskMuted:"#B0BEC5", deskBorder:"#90A4AE",
    cardBar:"#37474F", cardThanks:"#263238", cardDr:"#263238", cardTitle:"#546E7A", cardIcon:"#546E7A",
    backIsGradient:false, backBg1:"#FFFFFF", backBg2:"#FFFFFF", backBar1:"#37474F", backBar2:"#90A4AE",
    backClinic:"#263238", backInvite:"#546E7A", backStars:"#90A4AE", backAccent:"#37474F" },
  { id:"forest-green", name:"Forest Green", desc:"中医 · 养生", preview:"/images/qr-previews/preview_style_06_forest.jpg",
    deskIsGradient:false, deskBg1:"#FAF5EF", deskBg2:"#FAF5EF", deskBar1:"#33691E", deskBar2:"#8D6E63",
    deskClinic:"#1B5E20", deskInvite:"#558B2F", deskScan:"#689F38", deskStars:"#8D6E63", deskAccent:"#8D6E63", deskMuted:"#A1887F", deskBorder:"#8D6E63",
    cardBar:"#33691E", cardThanks:"#1B5E20", cardDr:"#1B5E20", cardTitle:"#558B2F", cardIcon:"#558B2F",
    backIsGradient:false, backBg1:"#FAF5EF", backBg2:"#FAF5EF", backBar1:"#33691E", backBar2:"#8D6E63",
    backClinic:"#1B5E20", backInvite:"#558B2F", backStars:"#8D6E63", backAccent:"#8D6E63" },
  { id:"luxury-blue-gold", name:"Luxury Gold", desc:"高端私立 · VIP", preview:"/images/qr-previews/preview_style_07_luxury.jpg",
    deskIsGradient:true, deskBg1:"#051C3A", deskBg2:"#0D3B66", deskBar1:"#051C3A", deskBar2:"#0D3B66",
    deskClinic:"#FFFFFF", deskInvite:"#D4AF37", deskScan:"#C5A85A", deskStars:"#D4AF37", deskAccent:"#D4AF37", deskMuted:"#8B9DC3", deskBorder:null,
    cardBar:"#051C3A", cardThanks:"#051C3A", cardDr:"#051C3A", cardTitle:"#D4AF37", cardIcon:"#D4AF37",
    backIsGradient:true, backBg1:"#051C3A", backBg2:"#0D3B66", backBar1:"#051C3A", backBar2:"#0D3B66",
    backClinic:"#FFFFFF", backInvite:"#D4AF37", backStars:"#D4AF37", backAccent:"#D4AF37" },
];

// ====================================================================
export default function QRCodePage() {
  const router = useRouter();
  const deskRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

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
  const [qrDataUrl, setQrDataUrl] = useState("");

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const clr = COLORS.find(x => x.id === sel) || COLORS[0];

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

  // 生成 QR
  useEffect(() => {
    if (!googleLink) return;
    QRCode.toDataURL(googleLink, { width: 400, margin: 2, color: { dark: clr.deskBar1, light: "#FFFFFF" }, errorCorrectionLevel: "H" })
      .then(setQrDataUrl).catch(() => {});
  }, [googleLink, clr.deskBar1]);

  const handleSave = async () => {
    if (!googleLink.trim()) return; setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("businesses").update({ google_review_link: googleLink.trim() }).eq("user_id", user.id);
    setSaving(false);
  };

  const downloadRef = useCallback(async (el: HTMLDivElement | null, filename: string) => {
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 3 });
      const a = document.createElement("a"); a.href = dataUrl; a.download = filename; a.click();
    } catch (e) { console.error("Download failed:", e); }
  }, []);

  // ========== 模板 CSS 生成 ==========
  const deskBg = clr.deskIsGradient
    ? `linear-gradient(135deg, ${clr.deskBg1}, ${clr.deskBg2})`
    : clr.deskBg1;
  const deskBarBg = `linear-gradient(90deg, ${clr.deskBar1}, ${clr.deskBar2})`;
  const backBg = clr.backIsGradient
    ? `linear-gradient(135deg, ${clr.backBg1}, ${clr.backBg2})`
    : clr.backBg1;
  const backBarBg = `linear-gradient(90deg, ${clr.backBar1}, ${clr.backBar2})`;

  if (loading) return <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center"><div className="text-brand-muted">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue"><ArrowLeft size={16} />Back to Dashboard</Link></div>
        <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center"><QrCode className="w-6 h-6 text-brand-blue" /></div><div><h1 className="font-outfit font-bold text-2xl text-brand-dark">QR Code Generator</h1><p className="text-brand-muted text-sm">7 professional templates — Desk Stand + Business Card (Front & Back)</p></div></div>

        {/* Step 1: Link */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">1</span><h2 className="font-semibold text-brand-dark">Google Review Link</h2></div>
          {!googleLink ? (<div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" /><div><p className="text-sm text-yellow-800 font-medium">No review link yet</p><button onClick={() => setShowGuide(!showGuide)} className="text-xs text-yellow-700 underline inline-flex items-center gap-1"><HelpCircle size={12} />How to find {showGuide ? "▲" : "▼"}</button>{showGuide && <div className="mt-2 text-xs text-yellow-700 space-y-1"><p>1. Go to business.google.com → Your Business</p><p>2. Click "Get more reviews" → Copy the short URL</p></div>}</div></div></div>
            <div className="flex gap-2"><input type="url" value={googleLink} onChange={e => setGoogleLink(e.target.value)} placeholder="https://g.page/your-clinic/review" className="flex-1 rounded-xl border border-brand-soft p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" /><button onClick={handleSave} disabled={saving || !googleLink.trim()} className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark disabled:opacity-50">{saving ? "Saving..." : "Save & Continue"}</button></div>
          </div>) : (<div className="flex items-center justify-between gap-3"><div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700"><CheckCircle size={14} className="text-green-500 shrink-0" /><span className="truncate">{googleLink}</span></div><button onClick={() => { navigator.clipboard.writeText(googleLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 text-brand-muted hover:text-brand-blue">{copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}</button><button onClick={() => setGoogleLink("")} className="p-2 text-brand-muted hover:text-red-500"><RefreshCw size={14} /></button></div>)}
        </div>

        {/* Step 2: Template + Info */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">2</span><h2 className="font-semibold text-brand-dark">Choose Template & Business Card Info</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {COLORS.map(tm => (
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

        {/* Step 3: Previews */}
        {googleLink && qrDataUrl && (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">3</span><h2 className="font-semibold text-brand-dark">Preview & Download</h2></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              {/* ---- Desk Stand ---- */}
              <div className="text-center w-full max-w-[280px]">
                <h3 className="font-semibold text-sm text-brand-dark mb-3">Desk Stand <span className="text-xs text-brand-muted font-normal">4"×4" / 5"×5"</span></h3>
                <div ref={deskRef} className="w-full aspect-[5/5.8] rounded-2xl overflow-hidden relative shadow-xl" style={{ background: deskBg, border: clr.deskBorder ? `3px solid ${clr.deskBorder}` : "none" }}>
                  {/* Top Bar */}
                  <div className="h-[11%] w-full rounded-t-2xl" style={{ background: deskBarBg }} />
                  {/* Icon */}
                  <div className="flex justify-center mt-3">
                    <Stethoscope size={32} color={clr.deskAccent} strokeWidth={1.5} />
                  </div>
                  {/* Clinic Name */}
                  <div className="text-center px-4 mt-2">
                    <p className="font-bold text-[13px] leading-tight" style={{ color: clr.deskClinic, fontFamily: "Georgia, serif" }}>{clinicName || "Your Clinic"}</p>
                  </div>
                  {/* Invite */}
                  <p className="text-center text-[10px] mt-1" style={{ color: clr.deskInvite }}>We'd love your feedback</p>
                  {/* QR Code */}
                  <div className="flex justify-center mt-2">
                    <div className="bg-white rounded-xl p-1.5 shadow-inner">
                      <img src={qrDataUrl} alt="QR" className="w-[140px] h-[140px]" />
                    </div>
                  </div>
                  {/* Scan text */}
                  <p className="text-center text-[9px] mt-1.5" style={{ color: clr.deskScan }}>Scan to leave a Google Review</p>
                  {/* Footer row */}
                  <div className="flex items-center justify-center gap-4 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Globe size={10} color={clr.deskMuted} />
                      <span className="text-[8px]" style={{ color: clr.deskMuted }}>Google Reviews</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={10} fill={clr.deskStars} color={clr.deskStars} />)}
                    </div>
                  </div>
                  {/* Decorative bottom line */}
                  <div className="absolute bottom-0 w-full h-[3px]" style={{ background: `linear-gradient(90deg, ${clr.deskAccent}, transparent, ${clr.deskAccent})` }} />
                </div>
                <button onClick={() => downloadRef(deskRef.current, `desk-stand-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14} />Download</button>
              </div>

              {/* ---- Card Front ---- */}
              <div className="text-center w-full max-w-[280px]">
                <h3 className="font-semibold text-sm text-brand-dark mb-3">Card Front <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
                <div ref={frontRef} className="w-full aspect-[3.5/2] rounded-xl overflow-hidden bg-white shadow-lg border border-gray-100">
                  {/* Top color bar */}
                  <div className="h-[4px] w-full" style={{ backgroundColor: clr.cardBar }} />
                  <div className="px-3.5 pt-3">
                    <p className="font-semibold text-[11px] leading-tight" style={{ color: clr.cardThanks }}>Thank you for trusting us</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">with your smile!</p>
                    <div className="border-b border-gray-200 my-2" />
                    <p className="font-bold text-[13px]" style={{ color: clr.cardDr }}>Dr. {drName || "[Doctor Name]"}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: clr.cardTitle }}>{drTitle || "[Title]"}</p>
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center gap-1.5"><Phone size={9} color={clr.cardIcon} /><span className="text-[9px] text-gray-500">{clinicPhone || "(555) 123-4567"}</span></div>
                      <div className="flex items-center gap-1.5"><Globe size={9} color={clr.cardIcon} /><span className="text-[9px] text-gray-500">{clinicWeb || "www.clinic.com"}</span></div>
                      <div className="flex items-center gap-1.5"><MapPin size={9} color={clr.cardIcon} /><span className="text-[9px] text-gray-500">{clinicAddr || "123 Healthcare Ave"}</span></div>
                    </div>
                  </div>
                  <div className="text-center mt-2 pb-2">
                    <span className="text-[7px] text-gray-300">Powered by ReviewFlow</span>
                  </div>
                </div>
                <button onClick={() => downloadRef(frontRef.current, `card-front-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14} />Download</button>
              </div>

              {/* ---- Card Back ---- */}
              <div className="text-center w-full max-w-[280px]">
                <h3 className="font-semibold text-sm text-brand-dark mb-3">Card Back <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
                <div ref={backRef} className="w-full aspect-[3.5/2.6] rounded-xl overflow-hidden relative shadow-lg" style={{ background: backBg }}>
                  {/* Top Bar */}
                  <div className="h-[12%] w-full rounded-t-xl" style={{ background: backBarBg }} />
                  {/* Icon */}
                  <div className="flex justify-center mt-2">
                    <Stethoscope size={22} color={clr.backAccent} strokeWidth={1.5} />
                  </div>
                  {/* Clinic */}
                  <p className="text-center font-bold text-[11px] mt-1.5 px-3" style={{ color: clr.backClinic, fontFamily: "Georgia, serif" }}>{clinicName || "Your Clinic"}</p>
                  {/* Invite */}
                  <p className="text-center text-[9px] mt-0.5" style={{ color: clr.backInvite }}>We'd love your feedback</p>
                  {/* QR */}
                  <div className="flex justify-center mt-1.5">
                    <div className="bg-white rounded-lg p-1 shadow-inner">
                      <img src={qrDataUrl} alt="QR" className="w-[72px] h-[72px]" />
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex justify-center gap-0.5 mt-1.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={10} fill={clr.backStars} color={clr.backStars} />)}
                  </div>
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${clr.backAccent}, transparent)` }} />
                </div>
                <button onClick={() => downloadRef(backRef.current, `card-back-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14} />Download</button>
              </div>
            </div>

            {/* Download All */}
            <div className="text-center pt-6 mt-6 border-t border-brand-soft/50">
              <button onClick={async () => {
                await downloadRef(deskRef.current, `desk-stand-${sel}.png`);
                setTimeout(async () => { await downloadRef(frontRef.current, `card-front-${sel}.png`); }, 300);
                setTimeout(async () => { await downloadRef(backRef.current, `card-back-${sel}.png`); }, 600);
              }} className="px-6 py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors inline-flex items-center gap-2"><Printer size={14} />Download All 3</button>
            </div>
          </div>
        )}

        {googleLink && <div className="bg-brand-soft rounded-2xl p-6"><h3 className="font-semibold text-brand-dark text-sm mb-3">Placement Tips</h3><ul className="space-y-2 text-sm text-brand-muted"><li>• Desk stand at front desk where patients check out</li><li>• Business cards in waiting room and treatment rooms</li><li>• Include card with receipts for patients who review later</li></ul></div>}
      </div>

      {/* Preview Modal */}
      {previewTpl && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewTpl(null)}><div className="bg-white rounded-2xl p-4 max-w-md mx-4" onClick={e => e.stopPropagation()}><img src={COLORS.find(x => x.id === previewTpl)?.preview} alt="Preview" className="w-full rounded-xl" /><button onClick={() => setPreviewTpl(null)} className="mt-3 w-full py-2 text-sm font-semibold text-brand-muted hover:text-brand-dark">Close</button></div></div>}
    </div>
  );
}
