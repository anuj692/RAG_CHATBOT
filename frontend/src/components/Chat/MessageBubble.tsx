import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import type { MessageResponse } from "../../lib/types";
import { Citations } from "./Citations";

interface MessageBubbleProps {
  message: MessageResponse;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[75%]",
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100",
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
    </div>
  );
}
