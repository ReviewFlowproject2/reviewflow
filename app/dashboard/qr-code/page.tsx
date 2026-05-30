"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Download, QrCode, Copy, Check } from "lucide-react";

const templates = [
  { id: 'classic-blue', name: 'Classic Blue', color: '#0A2463', desc: 'General Practice · Dental · Orthopedic' },
  { id: 'mint-green', name: 'Mint Green', color: '#2E7D32', desc: 'Pediatrics · Aesthetics · TCM' },
  { id: 'elegant-violet', name: 'Elegant Violet', color: '#4A148C', desc: 'Luxury Aesthetics · Plastic Surgery' },
  { id: 'coral-orange', name: 'Coral Orange', color: '#E64A19', desc: 'Family Clinic · Physical Therapy' },
  { id: 'professional-gray', name: 'Pro Gray', color: '#37474F', desc: 'Tech Clinic · Lab · Specialist' },
  { id: 'forest-green', name: 'Forest Green', color: '#33691E', desc: 'TCM · Wellness · Organic' },
  { id: 'luxury-blue-gold', name: 'Luxury Gold', color: '#051C3A', desc: 'Premium Private · VIP' },
];

export default function QRCodePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placeId, setPlaceId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-blue');
  const [generating, setGenerating] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: biz } = await supabase.from("businesses").select("*").eq("user_id", user.id).single();
      if (biz) { setBusiness(biz); setPlaceId(biz.google_place_id || ""); }
      setLoading(false);
    };
    loadBusiness();
  }, []);

  const generateQR = async () => {
    if (!placeId.trim()) { alert("Please enter your Google Place ID"); return; }
    setGenerating(true);
    const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
    try {
      const res = await fetch('/api/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: reviewUrl, template: selectedTemplate, size: 400 }),
      });
      const data = await res.json();
      if (data.qrCodeUrl) setQrUrl(data.qrCodeUrl);
      else alert('Failed to generate QR code');
    } catch (err) { alert('Error generating QR code'); }
    setGenerating(false);
  };

  const handleSavePlaceId = async () => {
    if (!placeId.trim() || !business) return;
    const { error } = await supabase.from("businesses").update({ google_place_id: placeId }).eq("id", business.id);
    if (error) alert("Failed to save: " + error.message);
    else { alert("Google Place ID saved!"); generateQR(); }
  };

  const handleDownload = (size: number, label: string) => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `reviewflow-qr-${selectedTemplate}-${label}-${size}x${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    if (!placeId) return;
    navigator.clipboard.writeText(`https://search.google.com/local/writereview?placeid=${placeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center"><div className="text-brand-muted">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="bg-white border-b border-[#E9F1FA]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-blue transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="font-outfit font-bold text-lg text-brand-dark">QR Code Generator</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-xl text-brand-dark mb-2">Google Review QR Code</h2>
              <p className="text-brand-muted text-sm leading-relaxed">Generate a QR code that takes patients directly to your Google Review page. Choose from 7 professional templates.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
          <h3 className="font-semibold text-brand-dark mb-4">1. Enter Your Google Place ID</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-brand-muted mb-1.5 block">Google Place ID</label>
              <input type="text" placeholder="ChIJ... (find it in your Google Business Profile)" value={placeId} onChange={(e) => setPlaceId(e.target.value)}
                className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue" />
              <p className="text-xs text-brand-muted mt-2">Find your Place ID in <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Google Place ID Finder</a></p>
            </div>
            <button onClick={handleSavePlaceId} className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-colors">Save & Generate</button>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
          <h3 className="font-semibold text-brand-dark mb-4">2. Choose Template Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map((t) => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-[12px] border-2 text-left transition-all ${selectedTemplate === t.id ? 'border-brand-blue bg-brand-soft' : 'border-[#E0E7F1] hover:border-brand-blue/50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: t.color }} />
                  <span className="font-medium text-sm text-brand-dark">{t.name}</span>
                </div>
                <p className="text-xs text-brand-muted">{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={generateQR} disabled={generating || !placeId}
              className="px-8 py-3 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-colors disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </div>

        {qrUrl && (
          <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
            <h3 className="font-semibold text-brand-dark mb-4">3. Your QR Code</h3>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 flex flex-col items-center">
                <div className="bg-white p-4 rounded-[16px] border-2 border-brand-soft shadow-sm">
                  <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
                  <div className="text-center mt-3">
                    <p className="font-outfit font-bold text-brand-dark text-sm">{business?.name || "Your Clinic"}</p>
                    <p className="text-xs text-brand-muted mt-1">Scan to leave a Google Review</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h4 className="font-medium text-brand-dark text-sm">Download for Print</h4>
                <div className="space-y-3">
                  {[
                    { size: 1500, label: 'desk-stand', name: 'Front Desk Stand (5\"×5\")', desc: 'High-res for professional printing' },
                    { size: 1050, label: 'card-front', name: 'Business Card Front (3.5\"×2\")', desc: 'Doctor info & contact details' },
                    { size: 1050, label: 'card-back', name: 'Business Card Back (3.5\"×2\")', desc: 'QR code with review prompt' },
                    { size: 600, label: 'receipt', name: 'Receipt Sticker (2\"×2\")', desc: 'Small sticker for receipts' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-[12px] border border-[#E0E7F1]">
                      <div>
                        <p className="font-medium text-brand-dark text-sm">{item.name}</p>
                        <p className="text-xs text-brand-muted">{item.desc}</p>
                      </div>
                      <button onClick={() => handleDownload(item.size, item.label)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-[8px] hover:bg-brand-dark transition-colors">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-[#E0E7F1]">
                  <button onClick={handleCopyLink} className="flex items-center gap-2 text-sm text-brand-blue hover:underline">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Link copied!" : "Copy review link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-brand-soft rounded-[16px] p-6">
          <h3 className="font-semibold text-brand-dark mb-3">💡 Placement Tips</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li className="flex items-start gap-2"><span className="text-brand-blue">•</span> Place the stand where patients pay — right after a positive experience</li>
            <li className="flex items-start gap-2"><span className="text-brand-blue">•</span> Train front desk to say: "If you had a great visit, we'd love your feedback on Google"</li>
            <li className="flex items-start gap-2"><span className="text-brand-blue">•</span> Include the card with receipts for patients who might review later</li>
            <li className="flex items-start gap-2"><span className="text-brand-blue">•</span> Pro tip: Ask for reviews from patients who complimented your service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
