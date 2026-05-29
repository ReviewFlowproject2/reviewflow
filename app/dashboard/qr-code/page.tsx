"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Download, QrCode, Settings, Copy, Check } from "lucide-react";

export default function QRCodePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placeId, setPlaceId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (biz) {
        setBusiness(biz);
        setPlaceId(biz.google_place_id || "");
        if (biz.google_place_id) {
          generateQR(biz.google_place_id, biz.name);
        }
      }
      setLoading(false);
    };

    loadBusiness();
  }, []);

  const generateQR = (pid: string, name: string) => {
    const reviewUrl = `https://search.google.com/local/writereview?placeid=${pid}`;
    // 使用 QRServer API 生成 QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(reviewUrl)}`;
    setQrUrl(qrApiUrl);
  };

  const handleGenerate = () => {
    if (!placeId.trim()) {
      alert("Please enter your Google Place ID");
      return;
    }
    generateQR(placeId, business?.name || "Your Clinic");
  };

  const handleSavePlaceId = async () => {
    if (!placeId.trim()) return;

    const { error } = await supabase
      .from("businesses")
      .update({ google_place_id: placeId })
      .eq("id", business.id);

    if (error) {
      alert("Failed to save: " + error.message);
    } else {
      alert("Google Place ID saved!");
      generateQR(placeId, business.name);
    }
  };

  const handleDownload = (size: number) => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl.replace("400x400", `${size}x${size}`);
    link.download = `reviewflow-qr-${size}x${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    if (!placeId) return;
    const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
    navigator.clipboard.writeText(reviewUrl);
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
    <div className="min-h-screen bg-[#F8FAFF]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9F1FA]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-blue transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="font-outfit font-bold text-lg text-brand-dark">QR Code Generator</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-xl text-brand-dark mb-2">
                Google Review QR Code
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Generate a QR code that takes patients directly to your Google Review page. 
                Place it at your front desk or include it with receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Place ID Input */}
        <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
          <h3 className="font-semibold text-brand-dark mb-4">1. Enter Your Google Place ID</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-brand-muted mb-1.5 block">
                Google Place ID
              </label>
              <input
                type="text"
                placeholder="ChIJ... (find it in your Google Business Profile)"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                className="w-full h-12 rounded-[10px] border border-[#E0E7F1] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
              <p className="text-xs text-brand-muted mt-2">
                Find your Place ID in{" "}
                <a 
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-blue hover:underline"
                >
                  Google Place ID Finder
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-colors"
              >
                Generate QR Code
              </button>
              <button
                onClick={handleSavePlaceId}
                className="px-6 py-2.5 border border-brand-blue text-brand-blue font-semibold rounded-[10px] text-sm hover:bg-brand-soft transition-colors"
              >
                Save Place ID
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {qrUrl && (
          <div className="bg-white rounded-[16px] p-6 shadow-card mb-6">
            <h3 className="font-semibold text-brand-dark mb-4">2. Your QR Code</h3>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* QR Code Image */}
              <div className="flex-1 flex flex-col items-center">
                <div className="bg-white p-4 rounded-[16px] border-2 border-brand-soft shadow-sm">
                  <img 
                    src={qrUrl} 
                    alt="QR Code" 
                    className="w-64 h-64"
                  />
                  <div className="text-center mt-3">
                    <p className="font-outfit font-bold text-brand-dark text-sm">
                      {business?.name || "Your Clinic"}
                    </p>
                    <p className="text-xs text-brand-muted mt-1">
                      Scan to leave a Google Review
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="flex-1 space-y-4">
                <h4 className="font-medium text-brand-dark text-sm">Download for Print</h4>

                <div className="space-y-3">
                  {/* 3x3 inch */}
                  <div className="flex items-center justify-between p-4 rounded-[12px] border border-[#E0E7F1]">
                    <div>
                      <p className="font-medium text-brand-dark text-sm">Front Desk Stand (3"×3")</p>
                      <p className="text-xs text-brand-muted">Perfect for checkout counter</p>
                    </div>
                    <button
                      onClick={() => handleDownload(900)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-[8px] hover:bg-brand-dark transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>

                  {/* 2x2 inch */}
                  <div className="flex items-center justify-between p-4 rounded-[12px] border border-[#E0E7F1]">
                    <div>
                      <p className="font-medium text-brand-dark text-sm">Receipt Card (2"×2")</p>
                      <p className="text-xs text-brand-muted">Include with patient receipts</p>
                    </div>
                    <button
                      onClick={() => handleDownload(600)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-[8px] hover:bg-brand-dark transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>

                {/* Copy Link */}
                <div className="pt-4 border-t border-[#E0E7F1]">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Link copied!" : "Copy review link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-brand-soft rounded-[16px] p-6">
          <h3 className="font-semibold text-brand-dark mb-3">💡 Placement Tips</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li className="flex items-start gap-2">
              <span className="text-brand-blue">•</span>
              Place the stand where patients pay — right after a positive experience
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-blue">•</span>
              Train front desk to say: "If you had a great visit, we'd love your feedback on Google"
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-blue">•</span>
              Include the card with receipts for patients who might review later
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-blue">•</span>
              Pro tip: Ask for reviews from patients who complimented your service
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
