import type { DataFormat } from "@/lib/transform";

interface FormatSelectProps {
  value: DataFormat;
  onChange: (value: DataFormat) => void;
}

const formats: DataFormat[] = ["JSON", "CSV", "XML"];

const FormatSelect = ({ value, onChange }: FormatSelectProps) => (
  <div className="flex gap-1 p-1 rounded-lg bg-secondary border border-border">
    {formats.map((f) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === f
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
        }`}
      >
        {f}
      </button>
    ))}
  </div>
);

export default FormatSelect;
