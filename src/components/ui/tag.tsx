import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const variantStyles = {
  neutral: "bg-surface-muted text-ink-secondary",
  accent: "bg-accent-subtle text-accent",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
} as const;

export type TagVariant = keyof typeof variantStyles;

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
  children: ReactNode;
};

/**
 * Static label (non-interactive). Use Chip for selectable filters.
 */
export function Tag({
  variant = "neutral",
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-caption font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
