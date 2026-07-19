import { createElement, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

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

type ContainerOwnProps = {
  size?: ContainerSize;
  children: ReactNode;
};

export type ContainerProps<T extends ElementType = "div"> = ContainerOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ContainerOwnProps | "as"> & {
    as?: T;
  };

export function Container<T extends ElementType = "div">({
  as,
  size = "lg",
  className,
  children,
  ...props
}: ContainerProps<T>) {
  return createElement(
    as ?? "div",
    {
      className: cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeStyles[size],
        className,
      ),
      ...props,
    },
    children,
  );
}
