import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const variantStyles = {
  neutral: "bg-surface-muted text-ink-secondary hover:bg-border",
  accent: "bg-accent-subtle text-accent hover:opacity-[var(--veraz-opacity-hover)]",
  outline:
    "bg-transparent text-ink-secondary border border-border hover:border-border-strong",
} as const;

export type ChipVariant = keyof typeof variantStyles;

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant;
  selected?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
};

export function Chip({
  variant = "neutral",
  selected = false,
  leftIcon,
  className,
  children,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-small font-medium veraz-transition veraz-focus-ring",
        variantStyles[variant],
        selected && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
