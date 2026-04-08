import { Zap } from "lucide-react";

const Navbar = () => (
  <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15">
        <Zap className="w-4 h-4 text-primary" />
      </div>
      <div className="flex items-baseline gap-2">
        <h1 className="text-lg font-bold text-foreground tracking-tight">DataShift</h1>
        <span className="text-xs text-muted-foreground hidden sm:inline">Data Format Transformer</span>
      </div>
    </div>
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs">
      <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
      <span className="text-muted-foreground">API Status:</span>
      <span className="text-foreground font-medium">Online</span>
    </div>
  </header>
);

export default Navbar;
