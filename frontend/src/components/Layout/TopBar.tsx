import type { Theme } from "../../lib/storage";

interface TopBarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ theme, onToggleTheme, onToggleSidebar }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        ☰
      </button>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        RAG Chatbot
      </span>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Toggle color theme"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </header>
  );
}
