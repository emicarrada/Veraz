import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
};

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-surface-muted",
        variant === "text" && "h-4 rounded-md",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className,
      )}
      style={{
        width: width ?? (variant === "circular" ? "2.5rem" : "100%"),
        height:
          height ??
          (variant === "circular" ? "2.5rem" : variant === "text" ? "1rem" : "6rem"),
        ...style,
      }}
      {...props}
    />
  );
}
