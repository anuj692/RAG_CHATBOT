import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1 break-words">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 rounded text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
