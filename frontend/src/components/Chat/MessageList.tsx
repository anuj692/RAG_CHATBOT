import { useEffect, useRef } from "react";
import { Bot, MessagesSquare } from "lucide-react";
import type { MessageResponse } from "../../lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: MessageResponse[];
  isAnswering: boolean;
  suggestionsEnabled?: boolean;
  onSuggestionClick?: (question: string) => void;
}

const SUGGESTIONS = [
  "Summarize this document in a few sentences",
  "What are the key takeaways?",
  "List any important dates or numbers",
];

function TypingIndicator() {
  return (
    <div className="flex animate-fade-in-up items-end gap-2">
      <span className="brand-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
        <Bot className="h-4 w-4 text-white" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-800">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 dark:bg-violet-500"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isAnswering,
  suggestionsEnabled,
  onSuggestionClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAnswering]);

  if (messages.length === 0 && !isAnswering) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="brand-gradient flex h-14 w-14 items-center justify-center rounded-2xl opacity-90 shadow-lg shadow-violet-500/20">
          <MessagesSquare className="h-7 w-7 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No messages yet.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Ask a question about the selected document.
        </p>

        {suggestionsEnabled && onSuggestionClick ? (
          <div className="mt-2 flex max-w-md flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isAnswering ? <TypingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  );
}
