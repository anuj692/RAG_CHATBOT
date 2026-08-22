import { Menu, Moon, Sparkles, Sun } from "lucide-react";
import type { Theme } from "../../lib/storage";

interface TopBarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ theme, onToggleTheme, onToggleSidebar }: TopBarProps) {
  return (
    <header className="relative flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-3 py-2.5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80 lg:hidden">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="flex items-center gap-1.5">
        <span className="brand-gradient flex h-6 w-6 items-center justify-center rounded-md shadow-sm shadow-violet-500/30">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          RAG Chatbot
        </span>
      </span>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Toggle color theme"
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
