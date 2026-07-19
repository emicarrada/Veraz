import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export type SpinnerSize = keyof typeof sizeStyles;

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: SpinnerSize;
  label?: string;
};

export function Spinner({
  size = "md",
  label = "Cargando",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-accent border-r-transparent",
          sizeStyles[size],
        )}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
