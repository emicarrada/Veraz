import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: "h-8 w-8 rounded-md",
  md: "h-10 w-10 rounded-md",
  lg: "h-12 w-12 rounded-lg",
} as const;

const variantStyles = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary:
    "bg-surface text-ink border border-border hover:bg-surface-muted",
  ghost: "bg-transparent text-ink-secondary hover:bg-surface-muted hover:text-ink",
} as const;

export type IconButtonSize = keyof typeof sizeStyles;
export type IconButtonVariant = keyof typeof variantStyles;

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Accessible name — required because the control is icon-only. */
  "aria-label": string;
  icon: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
};

export function IconButton({
  icon,
  size = "md",
  variant = "ghost",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center veraz-transition veraz-focus-ring",
        "disabled:pointer-events-none disabled:opacity-[var(--veraz-opacity-disabled)]",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center [&>svg]:h-full [&>svg]:w-full" aria-hidden>
        {icon}
      </span>
    </button>
  );
}
