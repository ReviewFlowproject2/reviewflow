"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Upload, Download, CheckCircle, AlertTriangle, FileSpreadsheet, X, ChevronDown, ChevronUp } from "lucide-react";

interface CsvRow { name: string; phone: string; email: string; visit_date: string; rowNumber: number; errors: string[]; }

export default function ImportPatientsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [errorRows, setErrorRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [showErrors, setShowErrors] = useState(true);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const downloadTemplate = () => {
    const template = "name,phone,email,visit_date\nJohn Doe,+1-555-0101,john@example.com,2026-06-01\nJane Smith,+1-555-0102,jane@example.com,2026-06-02\nRobert Brown,+1-555-0103,,2026-06-03";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reviewflow_patients_template.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((h, j) => { obj[h] = values[j] || ""; });
      const errors: string[] = [];
      if (!obj.name) errors.push("Name is required");
      if (!obj.phone) errors.push("Phone is required");
      if (obj.visit_date && !/^\d{4}-\d{2}-\d{2}$/.test(obj.visit_date)) errors.push("Invalid date format (YYYY-MM-DD)");
      rows.push({ name: obj.name || "", phone: obj.phone || "", email: obj.email || "", visit_date: obj.visit_date || "", rowNumber: i + 1, errors });
    }
    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setPreview(rows.filter((r) => r.errors.length === 0));
      setErrorRows(rows.filter((r) => r.errors.length > 0));
      setImportedCount(0);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setImporting(false); return; }
    const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
    if (!biz) { setImporting(false); return; }

    const toInsert = preview.map((r) => ({ business_id: biz.id, name: r.name, phone: r.phone, visit_date: r.visit_date || new Date().toISOString().split("T")[0] }));
    const { error } = await supabase.from("patients").upsert(toInsert, { onConflict: "business_id, phone", ignoreDuplicates: true });
    if (error) { alert(error.message); } else { setImportedCount(toInsert.length); setPreview([]); setFile(null); }
    setImporting(false);
  };

  const inputClass = "w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6"><ArrowLeft size={14} /> Back to Dashboard</Link>
        <h1 className="font-extrabold text-3xl text-gray-900 tracking-tight mb-2">Import Patients</h1>
        <p className="text-gray-500 mb-8">Upload a CSV with patient data to send review requests.</p>

        {importedCount > 0 ? (
          <div className="bg-white rounded-2xl border border-teal-200 p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-teal-600" /></div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">Import Complete</h2>
            <p className="text-gray-500 mb-6">{importedCount} patients imported successfully.</p>
            <button onClick={() => { setImportedCount(0); setFile(null); }} className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-full text-sm hover:bg-teal-700 transition-colors">Import Another File</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <button onClick={downloadTemplate} className="text-sm text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1.5"><Download size={16} />Download CSV Template</button>
            </div>

            {/* Upload area */}
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors bg-white mb-6">
              <Upload size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 mb-1">{file ? file.name : "Drop your CSV here or click to browse"}</p>
              <p className="text-sm text-gray-400">CSV format: name, phone, email, visit_date</p>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Error rows */}
            {errorRows.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm mb-6 overflow-hidden">
                <button onClick={() => setShowErrors(!showErrors)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-semibold text-red-500 flex items-center gap-2"><AlertTriangle size={16} />{errorRows.length} rows with errors</span>
                  {showErrors ? <ChevronUp size={18} className="text-red-500" /> : <ChevronDown size={18} className="text-red-500" />}
                </button>
                {showErrors && (
                  <div className="px-4 pb-4">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50"><th className="py-2 pr-4">Row</th><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Phone</th><th className="py-2">Errors</th></tr></thead>
                      <tbody>
                        {errorRows.map((r) => (
                          <tr key={r.rowNumber} className="border-b border-gray-100">
                            <td className="py-2 pr-4 text-gray-500">#{r.rowNumber}</td>
                            <td className="py-2 pr-4 text-gray-700">{r.name || "-"}</td>
                            <td className="py-2 pr-4 text-gray-500">{r.phone || "-"}</td>
                            <td className="py-2 text-red-500">{r.errors.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Preview table */}
            {preview.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <span className="font-semibold text-gray-900 flex items-center gap-2"><CheckCircle size={16} className="text-teal-600" />{preview.length} valid rows</span>
                  <button onClick={handleImport} disabled={importing}
                    className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-full text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors">
                    {importing ? "Importing..." : `Import ${preview.length} Patients`}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-200 bg-gray-50"><th className="py-3 px-4">#</th><th className="py-3 px-4">Name</th><th className="py-3 px-4">Phone</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Visit Date</th></tr></thead>
                    <tbody>
                      {preview.slice(0, 10).map((r) => (
                        <tr key={r.rowNumber} className="border-b border-gray-100">
                          <td className="py-2.5 px-4 text-gray-500">{r.rowNumber}</td>
                          <td className="py-2.5 px-4 text-gray-900 font-medium">{r.name}</td>
                          <td className="py-2.5 px-4 text-gray-600">{r.phone}</td>
                          <td className="py-2.5 px-4 text-gray-600">{r.email || "-"}</td>
                          <td className="py-2.5 px-4 text-gray-600">{r.visit_date || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && <p className="text-xs text-gray-500 p-4">Showing 10 of {preview.length} rows</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
