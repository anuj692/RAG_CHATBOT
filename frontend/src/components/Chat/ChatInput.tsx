import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Loader2, Send } from "lucide-react";

interface ChatInputProps {
  disabled: boolean;
  isSending: boolean;
  placeholder: string;
  onSend: (question: string) => void;
}

export function ChatInput({
  disabled,
  isSending,
  placeholder,
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isSending) return;
    onSend(trimmed);
    setValue("");
    requestAnimationFrame(resize);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200/70 bg-white/80 p-3 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm transition-colors focus-within:border-violet-400 dark:border-slate-700 dark:bg-slate-800">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="max-h-40 min-h-[2.25rem] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={disabled || isSending || !value.trim()}
          aria-label="Send message"
          className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm shadow-violet-500/30 transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:grayscale"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}
