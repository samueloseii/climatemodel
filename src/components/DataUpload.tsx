import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, AlertTriangle } from "lucide-react";

interface DataUploadProps {
  onDataLoaded: (data: Record<string, number>[]) => void;
  acceptedFormats?: string;
  label?: string;
  description?: string;
  templateColumns?: string[];
}

export default function DataUpload({ onDataLoaded, acceptedFormats = ".csv", label = "Import Data", description = "Upload CSV files with your project data", templateColumns }: DataUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [rowCount, setRowCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setStatus("error");
      setErrorMsg("File must have a header row and at least one data row");
      return;
    }
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const data: Record<string, number>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      if (vals.length !== headers.length) continue;
      const row: Record<string, number> = {};
      headers.forEach((h, j) => {
        const num = parseFloat(vals[j]);
        row[h] = isNaN(num) ? 0 : num;
      });
      data.push(row);
    }
    if (data.length === 0) {
      setStatus("error");
      setErrorMsg("No valid data rows found");
      return;
    }
    setRowCount(data.length);
    setStatus("success");
    onDataLoaded(data);
  };

  const handleFile = (f: File) => {
    setFile(f);
    setStatus("parsing");
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to read file");
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const downloadTemplate = () => {
    const cols = templateColumns || ["variable", "mean", "std_dev", "min", "max"];
    const csv = cols.join(",") + "\n" + cols.map((_, i) => i === 0 ? "example" : "0").join(",");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "geopro_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} style={{ color: "#2B7BC2" }} />
          <h3 className="text-sm font-semibold text-white">{label}</h3>
        </div>
        <button onClick={downloadTemplate} className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-2">
          Download Template
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">{description}</p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="relative rounded-lg p-6 text-center cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${dragActive ? "#2B7BC2" : "rgba(51,65,85,0.5)"}`,
          background: dragActive ? "rgba(43,123,194,0.05)" : "rgba(15,23,42,0.4)",
        }}
      >
        <input ref={inputRef} type="file" accept={acceptedFormats} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <Upload size={24} className="mx-auto mb-2" style={{ color: dragActive ? "#2B7BC2" : "#475569" }} />
        <p className="text-sm text-slate-300">
          {dragActive ? "Drop file here" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-slate-500 mt-1">Supports {acceptedFormats} files up to 10MB</p>
      </div>

      {/* Status */}
      {file && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {status === "parsing" && <span className="text-slate-400">Parsing {file.name}...</span>}
          {status === "success" && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Check size={12} />
              <span>{file.name} — {rowCount} rows loaded successfully</span>
              <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-auto text-slate-500 hover:text-slate-300"><X size={12} /></button>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={12} />
              <span>{errorMsg}</span>
              <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-auto text-slate-500 hover:text-slate-300"><X size={12} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
