import { useEffect, useRef } from "react";
import type { MessageResponse } from "../../lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: MessageResponse[];
  isAnswering: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MessageList({ messages, isAnswering }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAnswering]);

  if (messages.length === 0 && !isAnswering) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-slate-400 dark:text-slate-500">
        <p className="text-sm">No messages yet.</p>
        <p className="text-xs">Ask a question about the selected document.</p>
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
