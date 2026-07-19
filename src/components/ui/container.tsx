import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: "max-w-container-sm",
  md: "max-w-container-md",
  lg: "max-w-container-lg",
  xl: "max-w-container-xl",
  "2xl": "max-w-container-2xl",
  full: "max-w-none",
} as const;

export type ContainerSize = keyof typeof sizeStyles;

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  size?: ContainerSize;
  children: ReactNode;
};

export function Container({
  as,
  size = "lg",
  className,
  children,
  ...props
}: ContainerProps) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
