import { useState } from "react";
import type { ReactNode } from "react";
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
    <div className="flex h-svh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
      />

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:block">
          {sidebar}
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileSidebarOpen ? (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden
            />
            <aside className="relative z-50 h-full w-72 max-w-[85vw] bg-white shadow-xl dark:bg-slate-900">
              {sidebar}
            </aside>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
