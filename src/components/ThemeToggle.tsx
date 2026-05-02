import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary border border-border text-foreground hover:bg-surface-hover transition-all"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
    </button>
  );
};
