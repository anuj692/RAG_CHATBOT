import { useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import type { Theme } from "../../lib/storage";
import { TopBar } from "./TopBar";

interface AppShellProps {
  theme: Theme;
  onToggleTheme: () => void;
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ theme, onToggleTheme, sidebar, children }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Ambient brand glow, purely decorative and fixed behind everything. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-700/15" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-800/10" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-800/10" />
      </div>

      <TopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
      />

      <div className="relative flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/60 lg:block">
          {sidebar}
        </aside>

        {/* Mobile sidebar drawer */}
        <div
          className={clsx(
            "fixed inset-0 z-40 flex transition-opacity duration-300 lg:hidden",
            mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden
          />
          <aside
            className={clsx(
              "relative z-50 h-full w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-900",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            {sidebar}
          </aside>
        </div>

        <main className="relative min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
