"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle, Download, User, Mail, Phone, Calendar } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function ImportPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([
    { name: "", email: "", phone: "", visit_date: "" },
    { name: "", email: "", phone: "", visit_date: "" },
    { name: "", email: "", phone: "", visit_date: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAddRow = () => {
    setPatients([...patients, { name: "", email: "", phone: "", visit_date: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    if (patients.length <= 1) return;
    setPatients(patients.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newPatients = [...patients];
    newPatients[index] = { ...newPatients[index], [field]: value };
    setPatients(newPatients);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const phoneIdx = headers.indexOf("phone");
      const dateIdx = headers.indexOf("visit_date");

      if (nameIdx === -1 || emailIdx === -1 || dateIdx === -1) {
        setResult({ success: 0, failed: 0, errors: ["CSV must have headers: name, email, phone, visit_date"] });
        return;
      }

      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",");
        return {
          name: cols[nameIdx]?.trim(),
          email: cols[emailIdx]?.trim(),
          phone: phoneIdx >= 0 ? cols[phoneIdx]?.trim() : "",
          visit_date: cols[dateIdx]?.trim(),
        };
      }).filter((r) => r.name && r.email && r.visit_date);

      setPatients(rows.map((r) => ({ ...r })));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const validPatients = patients.filter((p) => p.name.trim() && p.email.trim() && p.visit_date.trim());

      if (validPatients.length === 0) {
        throw new Error("Please fill in at least one patient");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const businessId = biz?.id || user.id;

      const formatted = validPatients.map((p) => ({
        business_id: businessId,
        name: p.name.trim(),
        email: p.email.trim().toLowerCase(),
        phone: p.phone?.trim() || "",
        visit_date: p.visit_date.trim(),
        email_status: "pending",
      }));

      const res = await fetch("/api/patients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: formatted }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult({
        success: data.imported || 0,
        failed: data.failed || 0,
        errors: [],
      });

      setPatients([{ name: "", email: "", phone: "", visit_date: "" }]);
    } catch (err: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [err.message],
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleCSV = `name,email,phone,visit_date
John Smith,john@email.com,(713) 555-0123,2026-05-28
Jane Doe,jane@email.com,(713) 555-0124,2026-05-28`;

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="bg-white border-b border-[#E9F1FA]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-outfit font-bold text-xl text-brand-blue">
            ReviewFlow
          </Link>
          <Link href="/dashboard" className="text-sm text-brand-blue font-semibold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">
            Import Patients
          </h1>
          <p className="text-brand-muted">
            Add patients to send review request emails
          </p>
        </div>

        <div className="bg-white rounded-[16px] p-8 shadow-card">
          {/* File Upload */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-brand-dark">Upload CSV File</h3>
              <button
                onClick={() => {
                  const blob = new Blob([sampleCSV], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "patients-template.csv";
                  a.click();
                }}
                className="flex items-center gap-2 text-sm text-brand-blue hover:underline"
              >
                <Download size={16} />
                Download template
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E0E7F1] rounded-xl p-8 text-center cursor-pointer hover:border-brand-blue transition-colors"
            >
              <Upload className="w-8 h-8 text-brand-muted mx-auto mb-3" />
              <p className="text-sm text-brand-dark font-medium mb-1">
                Click to upload CSV file
              </p>
              <p className="text-xs text-brand-muted">
                or drag and drop here
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E0E7F1]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-brand-muted">or enter manually</span>
            </div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-3">Visit Date</div>
                <div className="col-span-1"></div>
              </div>

              {patients.map((patient, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <input
                        type="text"
                        placeholder="Patient name"
                        value={patient.name}
                        onChange={(e) => handleChange(index, "name", e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#E0E7F1] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={patient.email}
                        onChange={(e) => handleChange(index, "email", e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#E0E7F1] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <input
                        type="tel"
                        placeholder="(713) 555-0123"
                        value={patient.phone}
                        onChange={(e) => handleChange(index, "phone", e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#E0E7F1] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <input
                        type="date"
                        lang="en"
                        value={patient.visit_date}
                        onChange={(e) => handleChange(index, "visit_date", e.target.value)}
                        className="w-full h-10 rounded-lg border border-[#E0E7F1] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="w-8 h-8 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
                      disabled={patients.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="mt-4 flex items-center gap-2 text-sm text-brand-blue hover:underline"
            >
              + Add another patient
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6 bg-brand-blue text-white font-semibold rounded-[10px] text-sm hover:bg-brand-dark transition-all disabled:opacity-50"
            >
              {loading ? "Importing..." : `Import ${patients.filter((p) => p.name && p.email && p.visit_date).length} Patients`}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl ${result.errors.length > 0 ? "bg-red-50" : "bg-green-50"}`}>
              {result.errors.length > 0 ? (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-600 text-sm">Import failed</p>
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-500 mt-1">{err}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-600 text-sm">
                      Successfully imported {result.success} patients
                    </p>
                    {result.failed > 0 && (
                      <p className="text-sm text-brand-muted mt-1">
                        {result.failed} rows skipped
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
