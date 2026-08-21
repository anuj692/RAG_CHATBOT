import clsx from "clsx";
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
                "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                isSelected
                  ? "bg-indigo-50 dark:bg-indigo-950/50"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                className={clsx(
                  "flex-1 truncate text-left",
                  isSelected
                    ? "font-medium text-indigo-700 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                {session.title}
              </button>
              <button
                type="button"
                onClick={() => deleteSession.mutate(session.id)}
                disabled={deleteSession.isPending}
                aria-label={`Delete ${session.title}`}
                className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 disabled:opacity-40 dark:text-slate-500 dark:hover:text-red-400"
              >
                🗑
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
