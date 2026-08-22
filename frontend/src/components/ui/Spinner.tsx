import clsx from "clsx";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        role="status"
        aria-label={label ?? "Loading"}
        className={clsx(
          "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-violet-400 dark:text-violet-400",
          className,
        )}
      />
      {label ? (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {label}
        </span>
      ) : null}
    </span>
  );
}
