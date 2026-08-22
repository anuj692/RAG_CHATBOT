import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { Bot, User } from "lucide-react";
import type { MessageResponse } from "../../lib/types";
import { Citations } from "./Citations";

interface MessageBubbleProps {
  message: MessageResponse;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={clsx(
        "flex animate-fade-in-up items-end gap-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {isUser ? null : (
        <span className="brand-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <Bot className="h-4 w-4 text-white" />
        </span>
      )}

      <div
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[75%]",
          isUser
            ? "brand-gradient rounded-br-sm text-white shadow-violet-500/25"
            : "rounded-bl-sm border border-slate-200/70 bg-white text-slate-800 dark:border-slate-700/70 dark:bg-slate-800 dark:text-slate-100",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="markdown-body break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && message.citations && message.citations.length > 0 ? (
          <Citations citations={message.citations} />
        ) : null}
      </div>

      {isUser ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
          <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </span>
      ) : null}
    </div>
  );
}
