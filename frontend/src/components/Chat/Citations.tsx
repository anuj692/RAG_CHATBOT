import { useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import clsx from "clsx";
import type { Citation } from "../../lib/types";

interface CitationsProps {
  citations: Citation[];
}

export function Citations({ citations }: CitationsProps) {
  const [expanded, setExpanded] = useState(false);

  if (citations.length === 0) return null;

  return (
    <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
        aria-expanded={expanded}
      >
        <ChevronRight
          className={clsx("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")}
        />
        {citations.length === 1 ? "1 source" : `${citations.length} sources`}
      </button>

      {expanded ? (
        <ul className="mt-2 space-y-1.5">
          {citations.map((citation) => (
            <li
              key={citation.chunk_id}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-300" />
              <span className="min-w-0 flex-1 truncate" title={citation.file_name}>
                {citation.file_name} · page {citation.page_number}
              </span>
              <span className="shrink-0 rounded bg-violet-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                {(citation.score * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
