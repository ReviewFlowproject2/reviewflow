"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft, Upload, Download, CheckCircle, AlertTriangle,
  FileSpreadsheet, X, ChevronDown, ChevronUp
} from "lucide-react";

interface CsvRow {
  name: string;
  phone: string;
  email: string;
  visit_date: string;
  rowNumber: number;
  errors: string[];
}

export default function ImportPatientsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [errorRows, setErrorRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [showErrors, setShowErrors] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 下载 CSV 模板
  const downloadTemplate = () => {
    const template = "name,phone,email,visit_date\nJohn Doe,+1-555-0101,john@example.com,2026-06-01\nJane Smith,+1-555-0102,jane@example.com,2026-06-02\nRobert Brown,+1-555-0103,,2026-06-03";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviewflow_patients_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 解析 CSV
  const parseCSV = (text: string): CsvRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const phoneIdx = headers.indexOf("phone");
    const emailIdx = headers.indexOf("email");
    const dateIdx = headers.indexOf("visit_date");

    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const errors: string[] = [];

      if (nameIdx === -1 || !cols[nameIdx]) errors.push("Name is required");
      if (phoneIdx === -1 || !cols[phoneIdx]) errors.push("Phone is required");
      if (dateIdx === -1 || !cols[dateIdx]) errors.push("Visit date is required");
      else {
        const d = new Date(cols[dateIdx]);
        if (isNaN(d.getTime())) errors.push("Invalid date format (use YYYY-MM-DD)");
      }

      rows.push({
        name: cols[nameIdx] || "",
        phone: cols[phoneIdx] || "",
        email: emailIdx >= 0 ? cols[emailIdx] : "",
        visit_date: cols[dateIdx] || "",
        rowNumber: i + 1,
        errors,
      });
    }
    return rows;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImportedCount(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      const valid = rows.filter((r) => r.errors.length === 0);
      const invalid = rows.filter((r) => r.errors.length > 0);
      setPreview(valid);
      setErrorRows(invalid);
    };
    reader.readAsText(f);
  }, []);

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
    const businessId = biz?.id || user.id;

    let successCount = 0;
    for (const row of preview) {
      const { error } = await supabase.from("patients").insert({
        business_id: businessId,
        name: row.name,
        phone: row.phone,
        email: row.email || null,
        visit_date: row.visit_date,
        email_status: "pending",
      });
      if (!error) successCount++;
    }

    setImportedCount(successCount);
    setPreview([]);
    setFile(null);
    setImporting(false);
  };

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setErrorRows([]);
    setImportedCount(0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-blue transition-colors">
            <ArrowLeft size={16} />Back to Dashboard
          </Link>
        </div>

        <h1 className="font-outfit font-bold text-2xl text-brand-dark mb-2">Import Patients</h1>
        <p className="text-brand-muted text-sm mb-8">Upload a CSV file to bulk import patients. Download the template below to get started.</p>

        {/* Template Download */}
        <div className="bg-white rounded-2xl border border-brand-soft/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-blue">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark text-sm">CSV Template</h3>
                <p className="text-xs text-brand-muted">Required columns: name, phone, email, visit_date</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 border border-brand-blue text-brand-blue font-semibold rounded-xl text-sm hover:bg-brand-blue hover:text-white transition-colors"
            >
              <Download size={16} />Download Template
            </button>
          </div>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div className="bg-white rounded-2xl border border-dashed border-brand-soft p-10 text-center">
            <Upload className="mx-auto text-brand-muted mb-3" size={40} />
            <h3 className="font-semibold text-brand-dark mb-1">Drop your CSV file here</h3>
            <p className="text-sm text-brand-muted mb-4">or click to browse</p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors cursor-pointer">
              <Upload size={16} />Select File
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-soft/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-brand-blue" />
                <div>
                  <p className="font-semibold text-brand-dark text-sm">{file.name}</p>
                  <p className="text-xs text-brand-muted">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={clearFile} className="text-brand-muted hover:text-red-500 transition-colors"><X size={18} /></button>
            </div>

            {/* Preview Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-brand-soft rounded-xl p-3 text-center">
                <p className="font-outfit font-bold text-lg text-brand-blue">{preview.length + errorRows.length}</p>
                <p className="text-xs text-brand-muted">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="font-outfit font-bold text-lg text-green-600">{preview.length}</p>
                <p className="text-xs text-brand-muted">Valid</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="font-outfit font-bold text-lg text-red-600">{errorRows.length}</p>
                <p className="text-xs text-brand-muted">Errors</p>
              </div>
            </div>

            {/* Error Rows */}
            {errorRows.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-2 text-sm text-red-600 font-semibold mb-2"
                >
                  <AlertTriangle size={16} />
                  {errorRows.length} row(s) have errors
                  {showErrors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showErrors && (
                  <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-red-100">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-red-700">Row</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-red-700">Name</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-red-700">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorRows.map((row) => (
                          <tr key={row.rowNumber} className="border-b border-red-100/50">
                            <td className="px-4 py-2 text-red-600 font-medium">#{row.rowNumber}</td>
                            <td className="px-4 py-2 text-brand-dark">{row.name || "—"}</td>
                            <td className="px-4 py-2 text-red-600">{row.errors.join("; ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Valid Preview */}
            {preview.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-brand-dark mb-2">Preview ({preview.length} valid rows)</p>
                <div className="bg-brand-soft/50 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white sticky top-0">
                      <tr className="border-b border-brand-soft">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-brand-muted">Name</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-brand-muted">Phone</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-brand-muted">Email</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-brand-muted">Visit Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-brand-soft/30">
                          <td className="px-4 py-2 text-brand-dark">{row.name}</td>
                          <td className="px-4 py-2 text-brand-muted">{row.phone}</td>
                          <td className="px-4 py-2 text-brand-muted">{row.email || "—"}</td>
                          <td className="px-4 py-2 text-brand-muted">{row.visit_date}</td>
                        </tr>
                      ))}
                      {preview.length > 10 && (
                        <tr><td colSpan={4} className="px-4 py-2 text-xs text-brand-muted text-center">...and {preview.length - 10} more rows</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            {preview.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                {importing ? "Importing..." : `Import ${preview.length} Patients`}
              </button>
            )}

            {importedCount > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-sm text-green-700">
                  Successfully imported <span className="font-semibold">{importedCount}</span> patients!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
