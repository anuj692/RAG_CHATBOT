import { useState } from "react";
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
        className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-expanded={expanded}
      >
        <span
          className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        {citations.length === 1
          ? "1 source"
          : `${citations.length} sources`}
      </button>

      {expanded ? (
        <ul className="mt-2 space-y-1.5">
          {citations.map((citation) => (
            <li
              key={citation.chunk_id}
              className="flex items-center justify-between gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <span className="truncate" title={citation.file_name}>
                {citation.file_name} · page {citation.page_number}
              </span>
              <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {(citation.score * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
