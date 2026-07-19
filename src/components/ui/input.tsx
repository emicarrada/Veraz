import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

import { cn } from "@/utils/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  inputSize?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: "h-8 text-small px-2.5",
  md: "h-10 text-body px-3",
  lg: "h-12 text-body-lg px-4",
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      hint,
      error,
      leftAddon,
      rightAddon,
      inputSize = "md",
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label ? (
          <label htmlFor={inputId} className="text-label">
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border bg-surface veraz-transition",
            "focus-within:border-border-focus focus-within:shadow-focus",
            error ? "border-danger" : "border-border",
            disabled && "opacity-[var(--veraz-opacity-disabled)]",
          )}
        >
          {leftAddon ? (
            <span className="pl-3 text-ink-muted" aria-hidden>
              {leftAddon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "w-full min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-disabled",
              "outline-none",
              sizeStyles[inputSize],
              leftAddon ? "pl-0" : undefined,
              rightAddon ? "pr-0" : undefined,
            )}
            {...props}
          />
          {rightAddon ? (
            <span className="pr-3 text-ink-muted" aria-hidden>
              {rightAddon}
            </span>
          ) : null}
        </div>
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
