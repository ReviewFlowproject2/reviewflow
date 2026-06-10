"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import QRCode from "qrcode"; import { toPng } from "html-to-image";
import { ArrowLeft, Download, Printer, QrCode, Copy, CheckCircle, AlertTriangle, HelpCircle, RefreshCw, Star, Phone, Globe, MapPin, Stethoscope } from "lucide-react";

/* ====================================================================
   每个模板的精确颜色 — 直接从 .page 文件逐元素提取
   ==================================================================== */
const TPL = [
{// 01 Classic Blue
  id:"classic-blue", name:"Classic Blue", desc:"全科 · 牙科 · 骨科", preview:"/images/qr-previews/preview_style_01_classic_blue.jpg",
  // 桌面版 d-bg: gradient 135 #0A2463→#1E88E5, shadow #0A246330
  d_bgGrad:true,  d_bg1:"#0A2463", d_bg2:"#1E88E5", d_shadow:"#0A246330",
  d_barGrad:true, d_bar1:"#0A2463", d_bar2:"#1E88E5",
  d_border:null, d_borderW:0,
  d_logo:"#FDC500", d_clinic:"#FFFFFF", d_invite:"#1E88E5",
  d_scan:"#FFFFFF", d_google:"#FFFFFF", d_stars:"#FDC500",
  d_accentLine:"#FDC500",
  // 名片正面 cf-bar: solid
  cf_bar:"#0A2463", cf_thanks:"#0A2463", cf_dr:"#0A2463", cf_title:"#1E88E5", cf_icon:"#1E88E5",
  // 名片背面 cb-bg: gradient 135 #0A2463→#1E88E5
  cb_bgGrad:true,  cb_bg1:"#0A2463", cb_bg2:"#1E88E5", cb_shadow:"#0A246325",
  cb_barGrad:true, cb_bar1:"#0A2463", cb_bar2:"#1E88E5",
  cb_logo:"#FDC500", cb_clinic:"#FFFFFF", cb_invite:"#1E88E5", cb_stars:"#FDC500",
  cb_accentLine:"#FDC500",
},
{// 02 Mint Green
  id:"mint-green", name:"Mint Green", desc:"儿科 · 医美 · 中医", preview:"/images/qr-previews/preview_style_02_mint_green.jpg",
  d_bgGrad:false, d_bg1:"#FFFFFF", d_bg2:"#FFFFFF", d_shadow:"#2E7D3230",
  d_barGrad:true, d_bar1:"#2E7D32", d_bar2:"#81C784",
  d_border:"#4CAF50", d_borderW:3,
  d_logo:"#4CAF50", d_clinic:"#1B5E20", d_invite:"#4CAF50",
  d_scan:"#1B5E20", d_google:"#1B5E20", d_stars:"#81C784",
  d_accentLine:"#81C784",
  cf_bar:"#2E7D32", cf_thanks:"#1B5E20", cf_dr:"#1B5E20", cf_title:"#4CAF50", cf_icon:"#4CAF50",
  cb_bgGrad:false, cb_bg1:"#FFFFFF", cb_bg2:"#FFFFFF", cb_shadow:"#2E7D3225",
  cb_barGrad:true, cb_bar1:"#2E7D32", cb_bar2:"#81C784",
  cb_logo:"#4CAF50", cb_clinic:"#1B5E20", cb_invite:"#4CAF50", cb_stars:"#81C784",
  cb_accentLine:"#81C784",
},
{// 03 Elegant Violet
  id:"elegant-violet", name:"Elegant Violet", desc:"高端医美 · 整形", preview:"/images/qr-previews/preview_style_03_violet.jpg",
  d_bgGrad:true,  d_bg1:"#4A148C", d_bg2:"#7B1FA2", d_shadow:"#4A148C30",
  d_barGrad:true, d_bar1:"#4A148C", d_bar2:"#7B1FA2",
  d_border:null, d_borderW:0,
  d_logo:"#D4AF37", d_clinic:"#FFFFFF", d_invite:"#9C27B0",
  d_scan:"#FFFFFF", d_google:"#FFFFFF", d_stars:"#D4AF37",
  d_accentLine:"#D4AF37",
  cf_bar:"#4A148C", cf_thanks:"#4A148C", cf_dr:"#4A148C", cf_title:"#9C27B0", cf_icon:"#9C27B0",
  cb_bgGrad:true,  cb_bg1:"#4A148C", cb_bg2:"#7B1FA2", cb_shadow:"#4A148C25",
  cb_barGrad:true, cb_bar1:"#4A148C", cb_bar2:"#7B1FA2",
  cb_logo:"#D4AF37", cb_clinic:"#FFFFFF", cb_invite:"#9C27B0", cb_stars:"#D4AF37",
  cb_accentLine:"#D4AF37",
},
{// 04 Coral Orange — SOLID orange bg! (.page: d-bg fill solid #E64A19)
  id:"coral-orange", name:"Coral Orange", desc:"家庭诊所 · 理疗", preview:"/images/qr-previews/preview_style_04_coral.jpg",
  d_bgGrad:false, d_bg1:"#E64A19", d_bg2:"#E64A19", d_shadow:"#E64A1930",
  d_barGrad:true, d_bar1:"#E64A19", d_bar2:"#FF7043",
  d_border:null, d_borderW:0,
  d_logo:"#FF8A65", d_clinic:"#FFFFFF", d_invite:"#FFFFFF",
  d_scan:"#FFFFFF", d_google:"#FFFFFF", d_stars:"#FFFFFF",
  d_accentLine:"#FF8A65",
  cf_bar:"#E64A19", cf_thanks:"#BF360C", cf_dr:"#BF360C", cf_title:"#FF7043", cf_icon:"#FF7043",
  cb_bgGrad:false, cb_bg1:"#E64A19", cb_bg2:"#E64A19", cb_shadow:"#E64A1925",
  cb_barGrad:true, cb_bar1:"#E64A19", cb_bar2:"#FF7043",
  cb_logo:"#FF8A65", cb_clinic:"#FFFFFF", cb_invite:"#FFFFFF", cb_stars:"#FFFFFF",
  cb_accentLine:"#FF8A65",
},
{// 05 Pro Gray — SOLID dark gray bg! (.page: d-bg fill solid #37474F, d-bar fill solid #37474F)
  id:"professional-gray", name:"Pro Gray", desc:"科技诊所 · 专科", preview:"/images/qr-previews/preview_style_05_gray.jpg",
  d_bgGrad:false, d_bg1:"#37474F", d_bg2:"#37474F", d_shadow:"#37474F30",
  d_barGrad:false, d_bar1:"#37474F", d_bar2:"#37474F",
  d_border:null, d_borderW:0,
  d_logo:"#90A4AE", d_clinic:"#FFFFFF", d_invite:"#607D8B",
  d_scan:"#FFFFFF", d_google:"#FFFFFF", d_stars:"#546E7A",
  d_accentLine:"#90A4AE",
  cf_bar:"#37474F", cf_thanks:"#263238", cf_dr:"#263238", cf_title:"#607D8B", cf_icon:"#607D8B",
  cb_bgGrad:false, cb_bg1:"#37474F", cb_bg2:"#37474F", cb_shadow:"#37474F25",
  cb_barGrad:false, cb_bar1:"#37474F", cb_bar2:"#37474F",
  cb_logo:"#90A4AE", cb_clinic:"#FFFFFF", cb_invite:"#607D8B", cb_stars:"#546E7A",
  cb_accentLine:"#90A4AE",
},
{// 06 Forest Green — cream bg #FAF5EF with #D7CCC8 border
  id:"forest-green", name:"Forest Green", desc:"中医 · 养生", preview:"/images/qr-previews/preview_style_06_forest.jpg",
  d_bgGrad:false, d_bg1:"#FAF5EF", d_bg2:"#FAF5EF", d_shadow:"#33691E30",
  d_barGrad:true, d_bar1:"#33691E", d_bar2:"#558B2F",
  d_border:"#D7CCC8", d_borderW:2,
  d_logo:"#8D6E63", d_clinic:"#1B5E20", d_invite:"#558B2F",
  d_scan:"#1B5E20", d_google:"#1B5E20", d_stars:"#689F38",
  d_accentLine:"#8D6E63",
  cf_bar:"#33691E", cf_thanks:"#1B5E20", cf_dr:"#1B5E20", cf_title:"#558B2F", cf_icon:"#558B2F",
  cb_bgGrad:false, cb_bg1:"#FAF5EF", cb_bg2:"#FAF5EF", cb_shadow:"#33691E25",
  cb_barGrad:true, cb_bar1:"#33691E", cb_bar2:"#558B2F",
  cb_logo:"#8D6E63", cb_clinic:"#1B5E20", cb_invite:"#558B2F", cb_stars:"#689F38",
  cb_accentLine:"#8D6E63",
},
{// 07 Luxury Gold — dark gradient with GOLD border and ALL GOLD text
  id:"luxury-blue-gold", name:"Luxury Gold", desc:"高端私立 · VIP", preview:"/images/qr-previews/preview_style_07_luxury.jpg",
  d_bgGrad:true,  d_bg1:"#051C3A", d_bg2:"#0A2463", d_shadow:"#051C3A30",
  d_barGrad:true, d_bar1:"#051C3A", d_bar2:"#0A2463",
  d_border:"#D4AF37", d_borderW:2,
  d_logo:"#D4AF37", d_clinic:"#D4AF37", d_invite:"#D4AF37",
  d_scan:"#D4AF37", d_google:"#D4AF37", d_stars:"#D4AF37",
  d_accentLine:"#D4AF37",
  cf_bar:"#051C3A", cf_thanks:"#051C3A", cf_dr:"#051C3A", cf_title:"#D4AF37", cf_icon:"#D4AF37",
  cb_bgGrad:true,  cb_bg1:"#051C3A", cb_bg2:"#0A2463", cb_shadow:"#051C3A25",
  cb_barGrad:true, cb_bar1:"#051C3A", cb_bar2:"#0A2463",
  cb_logo:"#D4AF37", cb_clinic:"#D4AF37", cb_invite:"#D4AF37", cb_stars:"#D4AF37",
  cb_accentLine:"#D4AF37",
}];

// ====================================================================
export default function QRCodePage() {
  const router = useRouter();
  const dRef=useRef<HTMLDivElement>(null), fRef=useRef<HTMLDivElement>(null), bRef=useRef<HTMLDivElement>(null);
  const [link,setLink]=useState(""), [cname,setCname]=useState(""), [loading,setLoad]=useState(true);
  const [copied,setCopy]=useState(false), [sel,setSel]=useState("classic-blue"), [saving,setSave]=useState(false);
  const [guide,setGuide]=useState(false), [preview,setPreview]=useState<string|null>(null);
  const [dr,setDr]=useState(""), [title,setTitle]=useState("");
  const [phone,setPhone]=useState(""), [web,setWeb]=useState(""), [addr,setAddr]=useState("");
  const [qr,setQr]=useState("");

  const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const t=TPL.find(x=>x.id===sel)||TPL[0];

  useEffect(()=>{(async()=>{
    const{data:{user}}=await supabase.auth.getUser(); if(!user){router.push("/login");return}
    const{data:biz}=await supabase.from("businesses").select("name,google_review_link,owner_name,owner_phone").eq("user_id",user.id).single();
    if(biz){setCname(biz.name||"My Clinic");setLink(biz.google_review_link||"");setDr(biz.owner_name||"");setPhone(biz.owner_phone||"")}
    setLoad(false);
  })()},[supabase,router]);

  useEffect(()=>{if(!link)return;QRCode.toDataURL(link,{width:400,margin:2,color:{dark:t.d_bar1,light:"#FFFFFF"},errorCorrectionLevel:"H"}).then(setQr).catch(()=>{})},[link,t.d_bar1]);

  const save=async()=>{if(!link.trim())return;setSave(true);const{data:{user}}=await supabase.auth.getUser();if(user)await supabase.from("businesses").update({google_review_link:link.trim()}).eq("user_id",user.id);setSave(false)};
  const dl=useCallback(async(el:HTMLDivElement|null,fn:string)=>{if(!el)return;try{const u=await toPng(el,{quality:1,pixelRatio:3});const a=document.createElement("a");a.href=u;a.download=fn;a.click()}catch(e){console.error(e)}},[]);

  // 样式生成
  const bg=(g:boolean,c1:string,c2:string)=>g?`linear-gradient(135deg,${c1},${c2})`:c1;
  const barBg=(g:boolean,c1:string,c2:string)=>g?`linear-gradient(90deg,${c1},${c2})`:c1;

  if(loading)return<div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center"><div className="text-brand-muted">Loading...</div></div>;

  return(<div className="min-h-screen bg-[#F8FAFF] p-6"><div className="max-w-6xl mx-auto">
    <div className="mb-6"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue"><ArrowLeft size={16}/>Back to Dashboard</Link></div>
    <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center"><QrCode className="w-6 h-6 text-brand-blue"/></div><div><h1 className="font-outfit font-bold text-2xl text-brand-dark">QR Code Generator</h1><p className="text-brand-muted text-sm">7 professional templates — Desk Stand + Business Card (Front & Back)</p></div></div>

    {/* Step 1 */}
    <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">1</span><h2 className="font-semibold text-brand-dark">Google Review Link</h2></div>
      {!link?(<div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 mb-4"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0"/><div><p className="text-sm text-yellow-800 font-medium">No review link yet</p><button onClick={()=>setGuide(!guide)} className="text-xs text-yellow-700 underline inline-flex items-center gap-1"><HelpCircle size={12}/>How to find {guide?"▲":"▼"}</button>{guide&&<div className="mt-2 text-xs text-yellow-700 space-y-1"><p>1. Go to business.google.com → Your Business</p><p>2. Click "Get more reviews" → Copy the short URL</p></div>}</div></div></div>
        <div className="flex gap-2"><input type="url" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://g.page/your-clinic/review" className="flex-1 rounded-xl border border-brand-soft p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"/><button onClick={save} disabled={saving||!link.trim()} className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark disabled:opacity-50">{saving?"Saving...":"Save & Continue"}</button></div>
      </div>):(<div className="flex items-center justify-between gap-3"><div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl text-sm text-green-700"><CheckCircle size={14} className="text-green-500 shrink-0"/><span className="truncate">{link}</span></div><button onClick={()=>{navigator.clipboard.writeText(link);setCopy(true);setTimeout(()=>setCopy(false),2000)}} className="p-2 text-brand-muted hover:text-brand-blue">{copied?<CheckCircle size={14} className="text-green-500"/>:<Copy size={14}/>}</button><button onClick={()=>setLink("")} className="p-2 text-brand-muted hover:text-red-500"><RefreshCw size={14}/></button></div>)}
    </div>

    {/* Step 2 */}
    <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">2</span><h2 className="font-semibold text-brand-dark">Choose Template & Business Card Info</h2></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TPL.map(tm=>(<button key={tm.id} onClick={()=>setSel(tm.id)} className={`p-3 rounded-xl border-2 text-left transition-all relative ${sel===tm.id?"border-brand-blue bg-brand-soft":"border-gray-100 hover:border-brand-blue/30"}`}>
          <div className="relative w-full aspect-square rounded-lg mb-2 overflow-hidden bg-gray-50 cursor-pointer" onClick={e=>{e.stopPropagation();setPreview(preview===tm.id?null:tm.id)}}><img src={tm.preview} alt={tm.name} className="w-full h-full object-cover"/></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border" style={{backgroundColor:tm.d_bar1}}/><span className="font-medium text-xs">{tm.name}</span></div>
          <p className="text-[10px] text-brand-muted mt-1">{tm.desc}</p>
          {sel===tm.id&&<CheckCircle size={14} className="absolute top-2 right-2 text-brand-blue"/>}
        </button>))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[{l:"Clinic Name",v:cname,s:setCname},{l:"Doctor Name",v:dr,s:setDr,ph:"Dr. Smith"},{l:"Title",v:title,s:setTitle,ph:"General Dentist"},{l:"Phone",v:phone,s:setPhone,ph:"(555) 123-4567"},{l:"Website",v:web,s:setWeb,ph:"clinic.com"}].map(f=>(<div key={f.l}><label className="text-xs text-brand-muted mb-1 block">{f.l}</label><input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.ph||""} className="w-full rounded-lg border px-2 py-1.5 text-sm"/></div>))}
      </div>
    </div>

    {/* Step 3 */}
    {link&&qr&&(<div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6"><span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">3</span><h2 className="font-semibold text-brand-dark">Preview & Download</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">

        {/* === DESK STAND === */}
        <div className="text-center w-full max-w-[260px]">
          <h3 className="font-semibold text-sm text-brand-dark mb-3">Desk Stand <span className="text-xs text-brand-muted font-normal">4"×4" / 5"×5"</span></h3>
          <div ref={dRef} className="w-full aspect-[45/47] rounded-[16px] overflow-hidden relative shadow-xl flex flex-col items-center"
            style={{background:bg(t.d_bgGrad,t.d_bg1,t.d_bg2),boxShadow:`0 8px 20px ${t.d_shadow}`,border:t.d_border?`${t.d_borderW}px solid ${t.d_border}`:"none"}}>
            {/* Top bar */}
            <div className="w-full h-[11.7%] rounded-t-[16px]" style={{background:barBg(t.d_barGrad,t.d_bar1,t.d_bar2)}}/>
            {/* Logo icon */}
            <div className="mt-[14%]"><Stethoscope size={28} color={t.d_logo} strokeWidth={1.5}/></div>
            {/* Clinic */}
            <p className="font-bold text-[13px] mt-[11%] px-3 text-center leading-tight" style={{color:t.d_clinic,fontFamily:"Georgia,serif"}}>{cname||"Your Clinic"}</p>
            {/* Invite */}
            <p className="text-[10px] mt-[4%]" style={{color:t.d_invite}}>We'd love your feedback</p>
            {/* QR */}
            <div className="bg-white rounded-xl p-1.5 shadow-inner mt-[5%]"><img src={qr} alt="QR" className="w-[130px] h-[130px]"/></div>
            {/* Scan text */}
            <p className="text-[9px] mt-[3%]" style={{color:t.d_scan}}>Scan to leave a Google Review</p>
            {/* Footer */}
            <div className="flex items-center justify-center gap-3 mt-[2%] mb-3">
              <div className="flex items-center gap-1"><Globe size={10} color={t.d_google}/><span className="text-[8px]" style={{color:t.d_google}}>Google Reviews</span></div>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={9} fill={t.d_stars} color={t.d_stars}/>)}</div>
            </div>
            {/* Bottom accent line */}
            <div className="absolute bottom-0 w-full h-[3px]" style={{background:`linear-gradient(90deg,${t.d_accentLine},transparent,${t.d_accentLine})`}}/>
          </div>
          <button onClick={()=>dl(dRef.current,`desk-stand-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14}/>Download</button>
        </div>

        {/* === CARD FRONT === */}
        <div className="text-center w-full max-w-[260px]">
          <h3 className="font-semibold text-sm text-brand-dark mb-3">Card Front <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
          <div ref={fRef} className="w-full aspect-[3.5/2] rounded-xl overflow-hidden bg-white shadow-lg border border-gray-100">
            <div className="h-[4px] w-full" style={{backgroundColor:t.cf_bar}}/>
            <div className="px-3.5 pt-3">
              <p className="font-semibold text-[11px] leading-tight" style={{color:t.cf_thanks}}>Thank you for trusting us</p>
              <p className="text-[9px] text-gray-400 mt-0.5">with your smile!</p>
              <div className="border-b border-gray-200 my-2"/>
              <p className="font-bold text-[13px]" style={{color:t.cf_dr}}>Dr. {dr||"[Doctor Name]"}</p>
              <p className="text-[10px] mt-0.5" style={{color:t.cf_title}}>{title||"[Title]"}</p>
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center gap-1.5"><Phone size={9} color={t.cf_icon}/><span className="text-[9px] text-gray-500">{phone||"(555) 123-4567"}</span></div>
                <div className="flex items-center gap-1.5"><Globe size={9} color={t.cf_icon}/><span className="text-[9px] text-gray-500">{web||"www.clinic.com"}</span></div>
                <div className="flex items-center gap-1.5"><MapPin size={9} color={t.cf_icon}/><span className="text-[9px] text-gray-500">{addr||"123 Healthcare Ave"}</span></div>
              </div>
            </div>
            <div className="text-center mt-2 pb-2"><span className="text-[7px] text-gray-300">Powered by ReviewFlow</span></div>
          </div>
          <button onClick={()=>dl(fRef.current,`card-front-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14}/>Download</button>
        </div>

        {/* === CARD BACK === */}
        <div className="text-center w-full max-w-[260px]">
          <h3 className="font-semibold text-sm text-brand-dark mb-3">Card Back <span className="text-xs text-brand-muted font-normal">3.5"×2"</span></h3>
          <div ref={bRef} className="w-full aspect-[3.15/2.5] rounded-xl overflow-hidden relative shadow-lg flex flex-col items-center"
            style={{background:bg(t.cb_bgGrad,t.cb_bg1,t.cb_bg2),boxShadow:`0 4px 12px ${t.cb_shadow}`}}>
            {/* Top bar */}
            <div className="w-full h-[14%] rounded-t-xl" style={{background:barBg(t.cb_barGrad,t.cb_bar1,t.cb_bar2)}}/>
            {/* Logo */}
            <div className="mt-[10%]"><Stethoscope size={22} color={t.cb_logo} strokeWidth={1.5}/></div>
            {/* Clinic */}
            <p className="font-bold text-[11px] mt-[10%] px-3 text-center leading-tight" style={{color:t.cb_clinic,fontFamily:"Georgia,serif"}}>{cname||"Your Clinic"}</p>
            {/* Invite */}
            <p className="text-[9px] mt-[5%]" style={{color:t.cb_invite}}>We'd love your feedback</p>
            {/* QR */}
            <div className="bg-white rounded-lg p-1 shadow-inner mt-[5%]"><img src={qr} alt="QR" className="w-[72px] h-[72px]"/></div>
            {/* Stars */}
            <div className="flex gap-0.5 mt-[5%]">{[1,2,3,4,5].map(i=><Star key={i} size={10} fill={t.cb_stars} color={t.cb_stars}/>)}</div>
            {/* Bottom accent */}
            <div className="absolute bottom-0 w-full h-[2px]" style={{background:`linear-gradient(90deg,transparent,${t.cb_accentLine},transparent)`}}/>
          </div>
          <button onClick={()=>dl(bRef.current,`card-back-${sel}.png`)} className="mt-3 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-dark inline-flex items-center gap-2"><Download size={14}/>Download</button>
        </div>

      </div>
      <div className="text-center pt-6 mt-6 border-t border-brand-soft/50">
        <button onClick={async()=>{await dl(dRef.current,`desk-stand-${sel}.png`);setTimeout(async()=>{await dl(fRef.current,`card-front-${sel}.png`)},300);setTimeout(async()=>{await dl(bRef.current,`card-back-${sel}.png`)},600)}}
          className="px-6 py-2.5 border-2 border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors inline-flex items-center gap-2"><Printer size={14}/>Download All 3</button>
      </div>
    </div>)}
    {link&&<div className="bg-brand-soft rounded-2xl p-6"><h3 className="font-semibold text-brand-dark text-sm mb-3">Placement Tips</h3><ul className="space-y-2 text-sm text-brand-muted"><li>• Desk stand at front desk where patients check out</li><li>• Business cards in waiting room and treatment rooms</li><li>• Include card with receipts for patients who review later</li></ul></div>}
  </div>
  {preview&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={()=>setPreview(null)}><div className="bg-white rounded-2xl p-4 max-w-md mx-4" onClick={e=>e.stopPropagation()}><img src={TPL.find(x=>x.id===preview)?.preview} alt="Preview" className="w-full rounded-xl"/><button onClick={()=>setPreview(null)} className="mt-3 w-full py-2 text-sm font-semibold text-brand-muted hover:text-brand-dark">Close</button></div></div>}
  </div>);
}
