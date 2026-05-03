import { useState, useCallback, useRef } from "react";
import { ArrowRight, Copy, Download, Trash2, Check, Upload } from "lucide-react";
import FormatSelect from "./FormatSelect";
import HistoryPanel, { type HistoryEntry } from "./HistoryPanel";
import { type DataFormat } from "@/lib/transform";
import { toast } from "sonner";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Workspace = () => {
  const [inputFormat, setInputFormat] = useState<DataFormat>("JSON");
  const [outputFormat, setOutputFormat] = useState<DataFormat>("CSV");
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const detectFormat = useCallback((filename: string, content: string): DataFormat => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "json") return "JSON";
    if (ext === "csv") return "CSV";
    if (ext === "xml") return "XML";
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "JSON";
    if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) return "XML";
    return "CSV";
  }, []);

  const handleFileRead = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputValue(text);
      const detected = detectFormat(file.name, text);
      setInputFormat(detected);
      toast.success(`Loaded ${file.name} (detected as ${detected})`);
    };
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsText(file);
  }, [detectFormat]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  }, [handleFileRead]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      const mapped = data.map((item: any, i: number) => ({
        id: item.timestamp + i,
        from: item.input_format.toUpperCase() as DataFormat,
        to: item.output_format.toUpperCase() as DataFormat,
        inputPreview: (item.input_data || "").slice(0, 30),
        timestamp: new Date(item.timestamp),
        input: item.input_data || "",
      }));
      setHistory(mapped);
    } catch(err) {
      console.error("Failed to fetch history");
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleTransform = useCallback(async () => {
    if (!inputValue.trim()) {
      toast.error("Please paste some data first");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_data: inputValue,
          input_format: inputFormat.toLowerCase(),
          output_format: outputFormat.toLowerCase()
        })
      });
      const result = await res.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      setOutputValue(result.output_data);
      toast.success(`Converted ${inputFormat} → ${outputFormat}`);
      fetchHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transformation failed");
    }
  }, [inputValue, inputFormat, outputFormat, fetchHistory]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(outputValue);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [outputValue]);

  const handleDownload = useCallback(() => {
    const ext = outputFormat === "JSON" ? "json" : outputFormat === "CSV" ? "csv" : "xml";
    const blob = new Blob([outputValue], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datashift-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputValue, outputFormat]);

  const handleReload = useCallback((entry: HistoryEntry) => {
    setInputValue(entry.input);
    setInputFormat(entry.from);
    setOutputFormat(entry.to);
    toast.info("Conversion reloaded");
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 min-h-0">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Input Data</span>
            <FormatSelect value={inputFormat} onChange={setInputFormat} />
          </div>
          <div
            className={`relative flex-1 min-h-[200px] lg:min-h-0 rounded-xl transition-shadow ${
              isDragging ? "glow-border-active" : inputFocused ? "glow-border-active" : "glow-border"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Paste your JSON, CSV or XML data here, or drag & drop a file..."
              className="w-full h-full p-4 rounded-xl bg-input border-none font-mono text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
              spellCheck={false}
            />
            {isDragging && (
              <div className="absolute inset-0 rounded-xl bg-primary/10 border-2 border-dashed border-primary/50 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Drop file here</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => { setInputValue(""); setOutputValue(""); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
            >
              <Upload className="w-3 h-3" /> Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xml,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileRead(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Transform Button */}
        <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0 lg:px-2">
          <button
            onClick={handleTransform}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-button hover:brightness-110 active:scale-95 transition-all"
          >
            Transform <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-muted-foreground text-center hidden lg:block">
            Select formats and<br />click Transform
          </span>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Output Result</span>
            <FormatSelect value={outputFormat} onChange={setOutputFormat} />
          </div>
          <textarea
            value={outputValue}
            readOnly
            placeholder="Transformed output will appear here..."
            className="flex-1 min-h-[200px] lg:min-h-0 w-full p-4 rounded-xl bg-input border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none glow-border"
            spellCheck={false}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!outputValue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy Result"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputValue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Download className="w-3 h-3" /> Download File
            </button>
          </div>
        </div>
      </div>

      <HistoryPanel entries={history} onReload={handleReload} />
    </div>
  );
};

export default Workspace;