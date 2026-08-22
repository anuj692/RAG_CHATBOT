import clsx from "clsx";
import { MessageSquare, Trash2 } from "lucide-react";
import type { SessionResponse } from "../../lib/types";
import { useDeleteSessionMutation } from "../../hooks/useSessions";

interface SessionListProps {
  sessions: SessionResponse[];
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  selectedSessionId,
  onSelect,
}: SessionListProps) {
  const deleteSession = useDeleteSessionMutation();

  if (sessions.length === 0) {
    return (
      <p className="px-1 text-xs text-slate-400 dark:text-slate-500">
        No chats yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {sessions.map((session) => {
        const isSelected = session.id === selectedSessionId;
        return (
          <li key={session.id}>
            <div
              className={clsx(
                "group relative flex items-center gap-2 overflow-hidden rounded-lg pl-2.5 pr-1.5 py-1.5 text-sm transition-colors",
                isSelected
                  ? "bg-violet-50 dark:bg-violet-950/40"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/70",
              )}
            >
              {isSelected ? (
                <span className="brand-gradient absolute inset-y-0 left-0 w-1" aria-hidden />
              ) : null}
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                className="flex flex-1 items-center gap-2 overflow-hidden text-left"
              >
                <MessageSquare
                  className={clsx(
                    "h-4 w-4 shrink-0",
                    isSelected
                      ? "text-violet-600 dark:text-violet-300"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                />
                <span
                  className={clsx(
                    "truncate",
                    isSelected
                      ? "font-medium text-violet-700 dark:text-violet-300"
                      : "text-slate-700 dark:text-slate-300",
                  )}
                >
                  {session.title}
                </span>
              </button>
              <button
                type="button"
                onClick={() => deleteSession.mutate(session.id)}
                disabled={deleteSession.isPending}
                aria-label={`Delete ${session.title}`}
                className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 disabled:opacity-40 dark:text-slate-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
