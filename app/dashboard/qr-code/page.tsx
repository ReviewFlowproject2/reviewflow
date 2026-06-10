"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode"; import { toPng } from "html-to-image";
import { ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle, AlertTriangle, HelpCircle, RefreshCw, Stethoscope, Crown, Leaf, Plus, Lock } from "lucide-react";
import { getEffectivePlan, type EffectivePlan } from "@/lib/plan-config";

/* ====================================================================
   7 模板 — 严格按 style_0X_*_fixed.txt 设计规范
   ==================================================================== */
type TData = {
  id:string; name:string; desc:string; preview:string;
  // 桌面版
  d_bg:string; d_bgIsGrad:boolean; d_bg1:string; d_bg2:string;
  d_border:string; d_corner:string; // 四角装饰字符
  d_icon:"crown"|"leaf"|"plus"|"stethoscope"|null;
  d_iconColor:string;
  d_clinic:string; d_clinicFont:string; d_clinicSize:number; d_clinicWeight:number;
  d_invite:string; d_inviteFont:string; d_inviteSize:number; d_inviteColor:string;
  d_qrWrapBg:string; d_qrWrapRadius:number; // qr容器: 白色方/圆/无
  d_qrBorder:string; // qr容器边框
  d_qrDark:string; d_qrLight:string; // QR码颜色
  d_tagline:string; d_taglineColor:string; d_taglineFont:string;
  d_stars:string; d_starsColor:string; // ★★★★★ or ☆☆☆☆☆ or ★★★
  // 名片正面
  cf_bg:string; cf_bgIsGrad:boolean; cf_bg1:string; cf_bg2:string;
  cf_isDark:boolean;
  cf_topBar:string; cf_topBarColor:string; // null=细金线, string=色块
  cf_name:string; cf_nameFont:string; cf_nameColor:string; cf_nameSize:number;
  cf_title:string; cf_titleFont:string; cf_titleColor:string;
  cf_divider:string; // 分隔线颜色
  cf_contact:string; cf_contactColor:string; cf_contactFont:string;
  cf_script:string; cf_scriptFont:string; cf_scriptColor:string;
  cf_corner:string; // 四角装饰
  // 名片背面
  cb_bg:string; cb_bgIsGrad:boolean; cb_bg1:string; cb_bg2:string;
  cb_qrDark:string; cb_qrLight:string;
  cb_qrWrapBg:string; cb_qrWrapRadius:number; cb_qrBorder:string;
  cb_tagline:string; cb_taglineColor:string; cb_taglineFont:string;
  cb_stars:string; cb_starsColor:string;
  cb_corner:string;
};

const TPL:TData[]=[
{// 01 Classic Blue — ✦四角金花 + 深蓝渐变 + Playfair Display
  id:"classic-blue",name:"Classic Blue",desc:"全科 · 牙科 · 骨科",preview:"/images/qr-previews/preview_style_01_classic_blue.jpg",
  d_bg:"#0A2463",d_bgIsGrad:true,d_bg1:"#0A2463",d_bg2:"#1A3A5C",d_border:"none",d_corner:"✦",
  d_icon:"stethoscope",d_iconColor:"#D4AF37",
  d_clinic:"Dancing Script",d_clinicFont:"'Dancing Script',cursive",d_clinicSize:26,d_clinicWeight:700,
  d_invite:"",d_inviteFont:"'Lato',sans-serif",d_inviteSize:0,d_inviteColor:"#FFFFFF",
  d_qrWrapBg:"#FFFFFF",d_qrWrapRadius:6,d_qrBorder:"none",
  d_qrDark:"#0A2463",d_qrLight:"#FFFFFF",
  d_tagline:"Scan to leave a Google Review",d_taglineColor:"#FFFFFF",d_taglineFont:"'Lato',sans-serif",
  d_stars:"★★★★★",d_starsColor:"#D4AF37",
  cf_bg:"#0A2463",cf_bgIsGrad:true,cf_bg1:"#0A2463",cf_bg2:"#1A3A5C",cf_isDark:true,
  cf_topBar:null,cf_topBarColor:"",
  cf_name:"Playfair Display",cf_nameFont:"'Playfair Display',serif",cf_nameColor:"#D4AF37",cf_nameSize:22,
  cf_title:"",cf_titleFont:"",cf_titleColor:"",
  cf_divider:"#D4AF37",
  cf_contact:"Phone • Website",cf_contactColor:"#D4AF37",cf_contactFont:"'Lato',sans-serif",
  cf_script:"Thank you for trusting us with your smile",cf_scriptFont:"'Dancing Script',cursive",cf_scriptColor:"#D4AF37",
  cf_corner:"✦",
  cb_bg:"#0A2463",cb_bgIsGrad:true,cb_bg1:"#0A2463",cb_bg2:"#1A3A5C",
  cb_qrDark:"#0A2463",cb_qrLight:"#FFFFFF",
  cb_qrWrapBg:"#FFFFFF",cb_qrWrapRadius:6,cb_qrBorder:"none",
  cb_tagline:"Scan for our social media",cb_taglineColor:"#FFFFFF",cb_taglineFont:"'Lato',sans-serif",
  cb_stars:"★★★★★",cb_starsColor:"#D4AF37",cb_corner:"",
},
{// 02 Mint Green — 薄荷绿QR无白底 + Dancing Script + ☆☆ outline stars
  id:"mint-green",name:"Mint Green",desc:"儿科 · 医美 · 中医",preview:"/images/qr-previews/preview_style_02_mint_green.jpg",
  d_bg:"#FFFFFF",d_bgIsGrad:false,d_bg1:"#FFFFFF",d_bg2:"#FFFFFF",d_border:"6px solid #6BC4B0",d_corner:"",
  d_icon:"plus",d_iconColor:"#6BC4B0",
  d_clinic:"Dancing Script",d_clinicFont:"'Dancing Script',cursive",d_clinicSize:24,d_clinicWeight:700,
  d_invite:"We'd love your feedback",d_inviteFont:"'Montserrat',sans-serif",d_inviteSize:15,d_inviteColor:"#4CAF50",
  d_qrWrapBg:"transparent",d_qrWrapRadius:6,d_qrBorder:"none", // 透明背景！
  d_qrDark:"#2F855A",d_qrLight:"transparent", // 薄荷绿QR，透明背景
  d_tagline:"Scan to leave a Google Review",d_taglineColor:"#2F855A",d_taglineFont:"'Montserrat',sans-serif",
  d_stars:"☆☆☆☆☆",d_starsColor:"#6BC4B0",
  cf_bg:"#FFFFFF",cf_bgIsGrad:false,cf_bg1:"#FFFFFF",cf_bg2:"#FFFFFF",cf_isDark:false,
  cf_topBar:"bar",cf_topBarColor:"#6BC4B0",
  cf_name:"Montserrat",cf_nameFont:"'Montserrat',sans-serif",cf_nameColor:"#2F855A",cf_nameSize:18,
  cf_title:"Pediatric Dentist",cf_titleFont:"'Montserrat',sans-serif",cf_titleColor:"#4CAF50",
  cf_divider:"",
  cf_contact:"Phone • Email • Web",cf_contactColor:"#666666",cf_contactFont:"'Montserrat',sans-serif",
  cf_script:"",cf_scriptFont:"",cf_scriptColor:"",
  cf_corner:"",
  cb_bg:"#FFFFFF",cb_bgIsGrad:false,cb_bg1:"#FFFFFF",cb_bg2:"#FFFFFF",
  cb_qrDark:"#2F855A",cb_qrLight:"transparent",
  cb_qrWrapBg:"transparent",cb_qrWrapRadius:6,cb_qrBorder:"none",
  cb_tagline:"Thank you for trusting us with your smile",cb_taglineColor:"#2F855A",cb_taglineFont:"'Montserrat',sans-serif",
  cb_stars:"",cb_starsColor:"",cb_corner:"",
},
{// 03 Elegant Violet — 👑皇冠 + Great Vibes + 深紫渐变
  id:"elegant-violet",name:"Elegant Violet",desc:"高端医美 · 整形",preview:"/images/qr-previews/preview_style_03_violet.jpg",
  d_bg:"#1A0B2E",d_bgIsGrad:true,d_bg1:"#1A0B2E",d_bg2:"#3D265E",d_border:"none",d_corner:"",
  d_icon:"crown",d_iconColor:"#D4AF37",
  d_clinic:"Great Vibes",d_clinicFont:"'Great Vibes',cursive",d_clinicSize:24,d_clinicWeight:400,
  d_invite:"Scan to Rate",d_inviteFont:"'Dancing Script',cursive",d_inviteSize:18,d_inviteColor:"#D4AF37",
  d_qrWrapBg:"#FFFFFF",d_qrWrapRadius:6,d_qrBorder:"2px solid #D4AF37",
  d_qrDark:"#1A0B2E",d_qrLight:"#FFFFFF",
  d_tagline:"",d_taglineColor:"",d_taglineFont:"",
  d_stars:"★★★★★",d_starsColor:"#D4AF37",
  cf_bg:"#1A0B2E",cf_bgIsGrad:true,cf_bg1:"#1A0B2E",cf_bg2:"#3D265E",cf_isDark:true,
  cf_topBar:null,cf_topBarColor:"",
  cf_name:"Playfair Display",cf_nameFont:"'Playfair Display',serif",cf_nameColor:"#D4AF37",cf_nameSize:20,
  cf_title:"",cf_titleFont:"",cf_titleColor:"",
  cf_divider:"",
  cf_contact:"Phone • Email • Web",cf_contactColor:"#D4AF37",cf_contactFont:"'Cormorant Garamond',serif",
  cf_script:"",cf_scriptFont:"",cf_scriptColor:"",
  cf_corner:"",
  cb_bg:"#1A0B2E",cb_bgIsGrad:true,cb_bg1:"#1A0B2E",cb_bg2:"#3D265E",
  cb_qrDark:"#1A0B2E",cb_qrLight:"#FFFFFF",
  cb_qrWrapBg:"#FFFFFF",cb_qrWrapRadius:6,cb_qrBorder:"2px solid #D4AF37",
  cb_tagline:"",cb_taglineColor:"",cb_taglineFont:"",
  cb_stars:"★★★",cb_starsColor:"#D4AF37",cb_corner:"",
},
{// 04 Coral Orange — 圆形QR容器 + 白标签 + Dancing Script
  id:"coral-orange",name:"Coral Orange",desc:"家庭诊所 · 理疗",preview:"/images/qr-previews/preview_style_04_coral.jpg",
  d_bg:"#E07A5F",d_bgIsGrad:false,d_bg1:"#E07A5F",d_bg2:"#E07A5F",d_border:"none",d_corner:"",
  d_icon:"stethoscope",d_iconColor:"#FFFFFF",
  d_clinic:"Dancing Script",d_clinicFont:"'Dancing Script',cursive",d_clinicSize:20,d_clinicWeight:700,
  d_invite:"We'd love your feedback",d_inviteFont:"'Montserrat',sans-serif",d_inviteSize:15,d_inviteColor:"#FFFFFF",
  d_qrWrapBg:"#FFFFFF",d_qrWrapRadius:9999,d_qrBorder:"none", // 圆形！
  d_qrDark:"#E07A5F",d_qrLight:"#FFFFFF",
  d_tagline:"",d_taglineColor:"",d_taglineFont:"",
  d_stars:"★★★★★",d_starsColor:"#FFD54F",
  cf_bg:"#FFFFFF",cf_bgIsGrad:false,cf_bg1:"#FFFFFF",cf_bg2:"#FFFFFF",cf_isDark:false,
  cf_topBar:"bar",cf_topBarColor:"#E07A5F",
  cf_name:"Montserrat",cf_nameFont:"'Montserrat',sans-serif",cf_nameColor:"#E07A5F",cf_nameSize:18,
  cf_title:"",cf_titleFont:"",cf_titleColor:"",
  cf_divider:"",
  cf_contact:"",cf_contactColor:"",cf_contactFont:"",
  cf_script:"",cf_scriptFont:"",cf_scriptColor:"",
  cf_corner:"",
  cb_bg:"#FFFFFF",cb_bgIsGrad:false,cb_bg1:"#FFFFFF",cb_bg2:"#FFFFFF",
  cb_qrDark:"#E07A5F",cb_qrLight:"#FFFFFF",
  cb_qrWrapBg:"#FFFFFF",cb_qrWrapRadius:6,cb_qrBorder:"none",
  cb_tagline:"We'd love your feedback",cb_taglineColor:"#E07A5F",cb_taglineFont:"'Montserrat',sans-serif",
  cb_stars:"★★",cb_starsColor:"#E07A5F",cb_corner:"",
},
{// 05 Pro Gray — 极简深灰 + Dancing Script + ☆☆ outline
  id:"professional-gray",name:"Pro Gray",desc:"科技诊所 · 专科",preview:"/images/qr-previews/preview_style_05_gray.jpg",
  d_bg:"#2D2D2D",d_bgIsGrad:false,d_bg1:"#2D2D2D",d_bg2:"#2D2D2D",d_border:"none",d_corner:"",
  d_icon:null,d_iconColor:"",
  d_clinic:"Dancing Script",d_clinicFont:"'Dancing Script',cursive",d_clinicSize:26,d_clinicWeight:700,
  d_invite:"Scan to Review",d_inviteFont:"'Montserrat',sans-serif",d_inviteSize:13,d_inviteColor:"#9CA3AF",
  d_qrWrapBg:"#FFFFFF",d_qrWrapRadius:6,d_qrBorder:"1px solid #4B5563",
  d_qrDark:"#2D2D2D",d_qrLight:"#FFFFFF",
  d_tagline:"",d_taglineColor:"",d_taglineFont:"",
  d_stars:"☆☆☆☆☆",d_starsColor:"#9CA3AF",
  cf_bg:"#2D2D2D",cf_bgIsGrad:false,cf_bg1:"#2D2D2D",cf_bg2:"#2D2D2D",cf_isDark:true,
  cf_topBar:null,cf_topBarColor:"",
  cf_name:"Montserrat",cf_nameFont:"'Montserrat',sans-serif",cf_nameColor:"#FFFFFF",cf_nameSize:20,
  cf_title:"",cf_titleFont:"",cf_titleColor:"",
  cf_divider:"#FFFFFF",
  cf_contact:"Phone • Email",cf_contactColor:"#FFFFFF",cf_contactFont:"'Montserrat',sans-serif",
  cf_script:"",cf_scriptFont:"",cf_scriptColor:"",
  cf_corner:"",
  cb_bg:"#2D2D2D",cb_bgIsGrad:false,cb_bg1:"#2D2D2D",cb_bg2:"#2D2D2D",
  cb_qrDark:"#2D2D2D",cb_qrLight:"#FFFFFF",
  cb_qrWrapBg:"#FFFFFF",cb_qrWrapRadius:6,cb_qrBorder:"none",
  cb_tagline:"",cb_taglineColor:"",cb_taglineFont:"",
  cb_stars:"",cb_starsColor:"",cb_corner:"",
},
{// 06 Forest Green — 🍃叶子 + Dancing Script + 木质边框
  id:"forest-green",name:"Forest Green",desc:"中医 · 养生",preview:"/images/qr-previews/preview_style_06_forest.jpg",
  d_bg:"#FAF8F3",d_bgIsGrad:false,d_bg1:"#FAF8F3",d_bg2:"#FAF8F3",d_border:"4px solid #8B6F47",d_corner:"",
  d_icon:"leaf",d_iconColor:"#3D7A4F",
  d_clinic:"Dancing Script",d_clinicFont:"'Dancing Script',cursive",d_clinicSize:28,d_clinicWeight:400,
  d_invite:"We'd love your feedback",d_inviteFont:"'Lato',sans-serif",d_inviteSize:14,d_inviteColor:"#558B2F",
  d_qrWrapBg:"#FFFFFF",d_qrWrapRadius:6,d_qrBorder:"3px solid #8B6F47",
  d_qrDark:"#1B5E20",d_qrLight:"#FFFFFF",
  d_tagline:"",d_taglineColor:"",d_taglineFont:"",
  d_stars:"★★★★★",d_starsColor:"#3D7A4F",
  cf_bg:"#FAF8F3",cf_bgIsGrad:false,cf_bg1:"#FAF8F3",cf_bg2:"#FAF8F3",cf_isDark:false,
  cf_topBar:"bar",cf_topBarColor:"#8B6F47",
  cf_name:"Dancing Script",cf_nameFont:"'Dancing Script',cursive",cf_nameColor:"#1B5E20",cf_nameSize:22,
  cf_title:"",cf_titleFont:"",cf_titleColor:"",
  cf_divider:"",
  cf_contact:"",cf_contactColor:"",cf_contactFont:"",
  cf_script:"",cf_scriptFont:"",cf_scriptColor:"",
  cf_corner:"",
  cb_bg:"#FAF8F3",cb_bgIsGrad:false,cb_bg1:"#FAF8F3",cb_bg2:"#FAF8F3",
  cb_qrDark:"#1B5E20",cb_qrLight:"#FFFFFF",
  cb_qrWrapBg:"#FFFFFF",cb_qrWrapRadius:6,cb_qrBorder:"2px solid #3D7A4F",
  cb_tagline:"",cb_taglineColor:"",cb_taglineFont:"",
  cb_stars:"",cb_starsColor:"",cb_corner:"",
},
{// 07 Luxury Gold — ❦四角金花 + 👑皇冠 + Great Vibes + 金边框
  id:"luxury-blue-gold",name:"Luxury Gold",desc:"高端私立 · VIP",preview:"/images/qr-previews/preview_style_07_luxury.jpg",
  d_bg:"#0F172A",d_bgIsGrad:false,d_bg1:"#0F172A",d_bg2:"#0F172A",d_border:"1px solid #D4AF37",d_corner:"❦",
  d_icon:"crown",d_iconColor:"#D4AF37",
  d_clinic:"Great Vibes",d_clinicFont:"'Great Vibes',cursive",d_clinicSize:32,d_clinicWeight:400,
  d_invite:"We Value Your Feedback",d_inviteFont:"'Playfair Display',serif",d_inviteSize:13,d_inviteColor:"#D4AF37",
  d_qrWrapBg:"#FFFFFF",d_qrWrapRadius:6,d_qrBorder:"1px solid #D4AF37",
  d_qrDark:"#0F172A",d_qrLight:"#FFFFFF",
  d_tagline:"",d_taglineColor:"",d_taglineFont:"",
  d_stars:"★★★★★",d_starsColor:"#D4AF37",
  cf_bg:"#0F172A",cf_bgIsGrad:false,cf_bg1:"#0F172A",cf_bg2:"#0F172A",cf_isDark:true,
  cf_topBar:null,cf_topBarColor:"",
  cf_name:"Great Vibes",cf_nameFont:"'Great Vibes',cursive",cf_nameColor:"#D4AF37",cf_nameSize:24,
  cf_title:"CHIEF PHYSICIAN",cf_titleFont:"'Cormorant Garamond',serif",cf_titleColor:"#D4AF37",
  cf_divider:"#D4AF37",
  cf_contact:"Phone • Web",cf_contactColor:"#D4AF37",cf_contactFont:"'Playfair Display',serif",
  cf_script:"",cf_scriptFont:"",cf_scriptColor:"",
  cf_corner:"❦",
  cb_bg:"#0F172A",cb_bgIsGrad:false,cb_bg1:"#0F172A",cb_bg2:"#0F172A",
  cb_qrDark:"#0F172A",cb_qrLight:"#FFFFFF",
  cb_qrWrapBg:"#FFFFFF",cb_qrWrapRadius:6,cb_qrBorder:"1px solid #D4AF37",
  cb_tagline:"",cb_taglineColor:"",cb_taglineFont:"",
  cb_stars:"★★★",cb_starsColor:"#D4AF37",cb_corner:"",
},
];

// ====================================================================
const IconMap={crown:Crown,leaf:Leaf,plus:Plus,stethoscope:Stethoscope};

export default function QRCodePage(){
  const router=useRouter();
  const dRef=useRef<HTMLDivElement>(null),fRef=useRef<HTMLDivElement>(null),bRef=useRef<HTMLDivElement>(null);
  const [link,setLink]=useState(""),[cname,setCname]=useState(""),[loading,setLoad]=useState(true);
  const [copied,setCopy]=useState(false),[sel,setSel]=useState("classic-blue"),[saving,setSave]=useState(false);
  const [guide,setGuide]=useState(false),[preview,setPreview]=useState<string|null>(null);
  const [dr,setDr]=useState(""),[title,setTitle]=useState("");
  const [phone,setPhone]=useState(""),[web,setWeb]=useState(""),[addr,setAddr]=useState("");
  const [qrDataUrl,setQr]=useState("");
  const [effectivePlan,setEffectivePlan]=useState<EffectivePlan>(getEffectivePlan(null));

  const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const t=TPL.find(x=>x.id===sel)||TPL[0];
  const isFree=effectivePlan.tier==="free";

  useEffect(()=>{(async()=>{
    const{data:{user}}=await supabase.auth.getUser();if(!user){router.push("/login");return}
    const{data:biz}=await supabase.from("businesses").select("name,google_review_link,owner_name,owner_phone").eq("user_id",user.id).single();
    if(biz){setCname(biz.name||"My Clinic");setLink(biz.google_review_link||"");setDr(biz.owner_name||"");setPhone(biz.owner_phone||"")}
    // 获取 plan（用 API 绕过 RLS）
    try{const r=await fetch("/api/business/ensure",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});const d=await r.json();if(d.success)setEffectivePlan(getEffectivePlan(d.business))}catch(e){}
    setLoad(false);
  })()},[supabase,router]);

  // 生成QR
  useEffect(()=>{
    if(!link)return;
    QRCode.toDataURL(link,{width:400,margin:2,color:{dark:"#000000",light:"#FFFFFF"},errorCorrectionLevel:"H"}).then(setQr).catch(()=>{});
  },[link,t.d_qrDark,t.d_qrLight]);

  const save=async()=>{if(!link.trim())return;setSave(true);const{data:{user}}=await supabase.auth.getUser();if(user)await supabase.from("businesses").update({google_review_link:link.trim()}).eq("user_id",user.id);setSave(false)};
  const dl=useCallback(async(el:HTMLDivElement|null,fn:string)=>{if(!el)return;try{const u=await toPng(el,{quality:1,pixelRatio:3});const a=document.createElement("a");a.href=u;a.download=fn;a.click()}catch(e){console.error(e)}},[]);

  const bgStyle=(isGrad:boolean,c1:string,c2:string)=>isGrad?`linear-gradient(135deg,${c1},${c2})`:c1;
  const Icon=t.d_icon?IconMap[t.d_icon]:null;

  if(loading)return<div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center"><div className="text-brand-muted">Loading...</div></div>;

  return(<div className="min-h-screen bg-[#F8FAFF] p-6"><div className="max-w-6xl mx-auto">
    <div className="mb-6"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue"><ArrowLeft size={16}/>Back to Dashboard</Link></div>
    <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center"><QrCode className="w-6 h-6 text-brand-blue"/></div><div><h1 className="font-outfit font-bold text-2xl text-brand-dark">QR Code Generator</h1><p className="text-brand-muted text-sm">7 professional templates — Desk Stand + Business Card (Front & Back)</p></div></div>

    {/* Step 1: Link */}
    <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">1</span><h2 className="font-semibold text-brand-dark">Google Review Link</h2></div>
      {!link?(<div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0"/><div><p className="text-sm text-yellow-800 font-medium">No review link yet</p><button onClick={()=>setGuide(!guide)} className="text-xs text-yellow-700 underline inline-flex items-center gap-1"><HelpCircle size={12}/>How to find {guide?"▲":"▼"}</button>{guide&&<div className="mt-2 text-xs text-yellow-700 space-y-1"><p>1. Go to business.google.com → Your Business</p><p>2. Click "Get more reviews" → Copy the short URL</p></div>}</div></div></div>
        <div className="flex gap-2"><input type="url" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://g.page/your-clinic/review" className="flex-1 rounded-xl border border-brand-soft p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"/><button onClick={save} disabled={saving||!link.trim()} className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark disabled:opacity-50">{saving?"Saving...":"Save & Continue"}</button></div>
      </div>):(<div className="flex items-center justify-between gap-3"><div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700"><CheckCircle size={14} className="text-green-500 shrink-0"/><span className="truncate">{link}</span></div><button onClick={()=>{navigator.clipboard.writeText(link);setCopy(true);setTimeout(()=>setCopy(false),2000)}} className="p-2 text-brand-muted hover:text-brand-blue">{copied?<CheckCircle size={14} className="text-green-500"/>:<Copy size={14}/>}</button><button onClick={()=>setLink("")} className="p-2 text-brand-muted hover:text-red-500"><RefreshCw size={14}/></button></div>)}
    </div>

    {/* Step 2: Template + Info */}
    <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">2</span><h2 className="font-semibold text-brand-dark">Choose Template & Business Card Info</h2></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TPL.map(tm=>(<button key={tm.id} onClick={()=>{if(isFree&&tm.id==="luxury-blue-gold")return;setSel(tm.id)}} className={`p-3 rounded-xl border-2 text-left transition-all relative ${sel===tm.id?"border-brand-blue bg-brand-soft":isFree&&tm.id==="luxury-blue-gold"?"border-gray-100 opacity-50 cursor-not-allowed":"border-gray-100 hover:border-brand-blue/30"}`}>
          <div className="relative w-full aspect-square rounded-lg mb-2 overflow-hidden bg-gray-50 cursor-pointer" onClick={e=>{e.stopPropagation();setPreview(preview===tm.id?null:tm.id)}}>
            <img src={tm.preview} alt={tm.name} className="w-full h-full object-cover"/>
            {isFree&&tm.id==="luxury-blue-gold"&&<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Lock size={24} className="text-white"/></div>}
          </div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border" style={{background:tm.d_bgIsGrad?tm.d_bg1:tm.d_bg}}/><span className="font-medium text-xs">{tm.name}</span></div>
          <p className="text-[10px] text-brand-muted mt-1">{tm.desc}</p>
          {sel===tm.id&&<CheckCircle size={14} className="absolute top-2 right-2 text-brand-blue"/>}
        </button>))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[{l:"Clinic Name",v:cname,s:setCname},{l:"Doctor Name",v:dr,s:setDr,ph:"Dr. Smith"},{l:"Card Tagline",v:title,s:setTitle,ph:"Your smile is our priority"},{l:"Phone",v:phone,s:setPhone,ph:"555-123-4567"},{l:"Website",v:web,s:setWeb,ph:"clinic.com"}].map(f=>(<div key={f.l}><label className="text-xs text-brand-muted mb-1 block">{f.l}</label><input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.ph||""} className="w-full rounded-lg border px-2 py-1.5 text-sm"/></div>))}
      </div>
    </div>

    {/* Step 3: Previews */}
    {link&&qrDataUrl&&(<div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">3</span><h2 className="font-semibold text-brand-dark">Preview & Download</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">

        {/* === DESK STAND === */}
        <div className="text-center w-full max-w-[260px]">
          <h3 className="font-semibold text-sm text-brand-dark mb-3">Desk Stand <span className="text-xs text-brand-muted font-normal">5"×5"</span></h3>
          <div ref={dRef} className="w-full rounded-[16px] relative shadow-xl flex flex-col items-center"
            style={{aspectRatio:"45/52",background:bgStyle(t.d_bgIsGrad,t.d_bg1,t.d_bg2),border:t.d_border,boxShadow:`0 8px 20px ${t.d_bg1}30`,overflow:"visible"}}>
            {/* Four corner ornaments for 01 & 07 */}
            {t.d_corner&&(<>
              <span className="absolute top-[3%] left-[4%] text-[20px]" style={{color:t.d_starsColor}}>{t.d_corner}</span>
              <span className="absolute top-[3%] right-[4%] text-[20px]" style={{color:t.d_starsColor}}>{t.d_corner}</span>
              <span className="absolute bottom-[3%] left-[4%] text-[20px]" style={{color:t.d_starsColor}}>{t.d_corner}</span>
              <span className="absolute bottom-[3%] right-[4%] text-[20px]" style={{color:t.d_starsColor}}>{t.d_corner}</span>
            </>)}
            {/* Icon */}
            {Icon&&<div className="mt-[8%]"><Icon size={28} color={t.d_iconColor} strokeWidth={1.5}/></div>}
            {/* White label pill for 04 */}
            {sel==="coral-orange"&&<div className="bg-white rounded-full px-4 py-1.5 mt-[6%]" style={{color:t.d_bg}}><span className="font-bold text-[13px]" style={{fontFamily:t.d_clinicFont}}>{cname||"Family Care Clinic"}</span></div>}
            {/* Clinic name (non-04) */}
            {sel!=="coral-orange"&&<p className="font-bold mt-[10%] px-3 text-center leading-tight" style={{fontFamily:t.d_clinicFont,fontSize:t.d_clinicSize,color:sel==="mint-green"?"#2F855A":sel==="forest-green"?"#1B5E20":sel==="luxury-blue-gold"?"#D4AF37":"#FFFFFF",fontWeight:t.d_clinicWeight}}>{cname||"Your Clinic"}</p>}
            {/* Invite */}
            {t.d_invite&&<p className="mt-[4%]" style={{fontFamily:t.d_inviteFont,fontSize:t.d_inviteSize,color:t.d_inviteColor}}>{t.d_invite}</p>}
            {/* QR */}
            <div className="mt-[5%]" style={{background:t.d_qrWrapBg,borderRadius:t.d_qrWrapRadius===9999?"50%":`${t.d_qrWrapRadius*2}px`,border:t.d_qrBorder,padding:t.d_qrWrapBg==="transparent"?0:8}}>
              <img src={qrDataUrl} alt="QR" style={{width:sel==="mint-green"?150:130,height:sel==="mint-green"?150:130,borderRadius:t.d_qrWrapRadius===9999?"50%":"4px"}}/>
            </div>
            {/* Tagline */}
            {t.d_tagline&&<p className="text-center mt-[3%]" style={{fontFamily:t.d_taglineFont,fontSize:12,color:t.d_taglineColor}}>{t.d_tagline}</p>}
            {/* Stars */}
            {t.d_stars&&<p className="mt-[3%] mb-3" style={{fontSize:16,color:t.d_starsColor}}>{t.d_stars}</p>}
            {/* Bottom accent for 02 */}
            {sel==="mint-green"&&<div className="absolute bottom-0 w-full h-[4%]" style={{background:`linear-gradient(90deg,transparent,#6BC4B0,transparent)`}}/>}
          </div>
          <button onClick={()=>dl(dRef.current,`desk-stand-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14}/>Download</button>
        </div>

        {/* === CARD FRONT === */}
        <div className="text-center w-full max-w-[260px]">
          <h3 className="font-semibold text-sm text-brand-dark mb-3">Card Front <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
          <div ref={fRef} className="w-full rounded-xl overflow-visible relative shadow-lg flex flex-col" style={{aspectRatio:"3.5/2.3",background:bgStyle(t.cf_bgIsGrad,t.cf_bg1,t.cf_bg2)}}>
            {/* Corner ornaments */}
            {t.cf_corner&&(<>
              <span className="absolute top-[3%] left-[2%] text-[12px]" style={{color:t.cf_scriptColor||t.cf_nameColor}}>{t.cf_corner}</span>
              <span className="absolute top-[3%] right-[2%] text-[12px]" style={{color:t.cf_scriptColor||t.cf_nameColor}}>{t.cf_corner}</span>
              <span className="absolute bottom-[3%] left-[2%] text-[12px]" style={{color:t.cf_scriptColor||t.cf_nameColor}}>{t.cf_corner}</span>
              <span className="absolute bottom-[3%] right-[2%] text-[12px]" style={{color:t.cf_scriptColor||t.cf_nameColor}}>{t.cf_corner}</span>
            </>)}
            {/* Top bar or gold line */}
            {t.cf_topBar==="bar"&&<div className="w-full h-[25%] rounded-t-xl" style={{background:t.cf_topBarColor}}/>}
            {t.cf_topBar===null&&t.cf_divider&&<div className="mx-auto mt-[8%] w-[54%] h-[1px]" style={{background:t.cf_divider}}/>}
            {/* Name */}
            <p className={`font-bold px-3 text-center leading-tight ${t.cf_topBar==="bar"?"mt-[16%]":"mt-[12%]"}`} style={{fontFamily:t.cf_nameFont,fontSize:t.cf_nameSize,color:t.cf_nameColor}}>Dr. {dr||"Smith"}</p>
            {/* Title */}
            {t.cf_title&&<p className="text-center mt-[4%]" style={{fontFamily:t.cf_titleFont,fontSize:11,color:t.cf_titleColor,letterSpacing:"0.15em"}}>{t.cf_title}</p>}
            {/* Divider */}
            {t.cf_divider&&t.cf_topBar===null&&<div className="mx-auto w-[32%] h-[1px] mt-[4%]" style={{background:t.cf_divider}}/>}
            {/* Contact */}
            {t.cf_contact&&<p className="text-center mt-[6%] px-3 leading-relaxed" style={{fontFamily:t.cf_contactFont,fontSize:10,color:t.cf_contactColor}}>
              {phone||"555-123-4567"}<br/>{web||"www.clinic.com"}
            </p>}
            {/* Custom tagline from Title field — replaces hardcoded script text */}
            {title&&<p className="text-center mt-auto mb-[8%] px-3" style={{fontFamily:t.cf_scriptFont||"'Dancing Script',cursive",fontSize:14,color:t.cf_scriptColor||t.cf_nameColor}}>{title}</p>}
            {/* Fallback: show default script text if no custom title */}
            {!title&&t.cf_script&&<p className="text-center mt-auto mb-[8%] px-3" style={{fontFamily:t.cf_scriptFont,fontSize:14,color:t.cf_scriptColor}}>{t.cf_script}</p>}
          </div>
          <button onClick={()=>dl(fRef.current,`card-front-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14}/>Download</button>
        </div>

        {/* === CARD BACK === */}
        <div className="text-center w-full max-w-[260px]">
          <h3 className="font-semibold text-sm text-brand-dark mb-3">Card Back <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
          <div ref={bRef} className="w-full rounded-xl overflow-visible relative shadow-lg flex flex-col items-center" style={{aspectRatio:"3.5/2.5",background:bgStyle(t.cb_bgIsGrad,t.cb_bg1,t.cb_bg2)}}>
            {/* QR */}
            <div className="mt-[8%]" style={{background:t.cb_qrWrapBg,borderRadius:`${t.cb_qrWrapRadius*2}px`,border:t.cb_qrBorder,padding:t.cb_qrWrapBg==="transparent"?0:6}}>
              <img src={qrDataUrl} alt="QR" style={{width:70,height:70,borderRadius:`${t.cb_qrWrapRadius}px`}}/>
            </div>
            {/* Tagline */}
            {t.cb_tagline&&<p className="text-center mt-[8%] px-3" style={{fontFamily:t.cb_taglineFont,fontSize:11,color:t.cb_taglineColor}}>{t.cb_tagline}</p>}
            {/* Stars */}
            {t.cb_stars&&<p className="mt-[4%]" style={{fontSize:12,color:t.cb_starsColor}}>{t.cb_stars}</p>}
            {/* Bottom accent for 02 */}
            {sel==="mint-green"&&<div className="absolute bottom-0 w-full h-[10%] rounded-b-xl" style={{background:"#6BC4B0"}}/>}
            {/* Leaf deco for 06 */}
            {sel==="forest-green"&&<div className="absolute bottom-[5%] right-[7%]"><Leaf size={12} color="#3D7A4F"/></div>}
          </div>
          <button onClick={()=>dl(bRef.current,`card-back-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14}/>Download</button>
        </div>
      </div>
      <div className="text-center pt-6 mt-6 border-t border-brand-soft/50">
        <button onClick={async()=>{await dl(dRef.current,`desk-stand-${sel}.png`);setTimeout(async()=>{await dl(fRef.current,`card-front-${sel}.png`)},300);setTimeout(async()=>{await dl(bRef.current,`card-back-${sel}.png`)},600)}} className="px-6 py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white inline-flex items-center gap-2"><Printer size={14}/>Download All 3</button>
      </div>
    </div>)}
    {link&&<div className="bg-brand-soft rounded-2xl p-6"><h3 className="font-semibold text-brand-dark text-sm mb-3">Placement Tips</h3><ul className="space-y-2 text-sm text-brand-muted"><li>• Desk stand at front desk where patients check out</li><li>• Business cards in waiting room and treatment rooms</li><li>• Include card with receipts for patients who review later</li></ul></div>}
  </div>
  {preview&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={()=>setPreview(null)}><div className="bg-white rounded-2xl p-4 max-w-md mx-4" onClick={e=>e.stopPropagation()}><img src={TPL.find(x=>x.id===preview)?.preview} alt="Preview" className="w-full rounded-xl"/><button onClick={()=>setPreview(null)} className="mt-3 w-full py-2 text-sm font-semibold text-brand-muted hover:text-brand-dark">Close</button></div></div>}
  </div>);
}
