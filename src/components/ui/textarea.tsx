import type { TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

import { cn } from "@/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, className, id, disabled, rows = 4, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label ? (
          <label htmlFor={textareaId} className="text-label">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full resize-y rounded-md border bg-surface px-3 py-2.5 text-body text-ink",
            "placeholder:text-ink-disabled veraz-transition veraz-focus-ring",
            error ? "border-danger" : "border-border",
            disabled && "opacity-[var(--veraz-opacity-disabled)]",
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-caption text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-caption">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
