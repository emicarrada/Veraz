import type { HTMLAttributes } from "react";
import Image from "next/image";

import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: { width: 88, height: 28, className: "h-7 w-auto" },
  md: { width: 120, height: 38, className: "h-9 w-auto" },
  lg: { width: 160, height: 50, className: "h-12 w-auto" },
} as const;

export type LogoProps = HTMLAttributes<HTMLSpanElement> & {
  size?: keyof typeof sizeStyles;
  /** Prefer transparent mark on dark/colored surfaces. */
  variant?: "default" | "transparent";
  priority?: boolean;
};

export function Logo({
  size = "md",
  variant = "default",
  priority = false,
  className,
  ...props
}: LogoProps) {
  const dimensions = sizeStyles[size];
  const src =
    variant === "transparent"
      ? "/veraztrans.png"
      : "/veraznegrologo.png";

  return (
    <span
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <Image
        src={src}
        alt="Veraz"
        width={dimensions.width}
        height={dimensions.height}
        className={cn(
          dimensions.className,
          /* Black mark → light mark on the dark-first UI */
          variant === "default" && "brightness-0 invert",
        )}
        priority={priority}
      />
    </span>
  );
}
