import { RotateCcw } from "lucide-react";
import type { DataFormat } from "@/lib/transform";

export interface HistoryEntry {
  id: string;
  from: DataFormat;
  to: DataFormat;
  inputPreview: string;
  timestamp: Date;
  input: string;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onReload: (entry: HistoryEntry) => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const HistoryPanel = ({ entries, onReload }: HistoryPanelProps) => {
  if (entries.length === 0) return null;

  return (
    <div className="border-t border-border bg-card/50 px-6 py-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">Recent Conversions</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {entries.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="flex-shrink-0 w-56 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary">
                {entry.from} → {entry.to}
              </span>
              <button
                onClick={() => onReload(entry)}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-surface-hover transition-all"
                title="Reload this conversion"
              >
                <RotateCcw className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate mb-1">
              {entry.inputPreview}
            </p>
            <span className="text-[10px] text-muted-foreground/60">{timeAgo(entry.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
