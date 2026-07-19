import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const variantClass = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  "body-lg": "text-body-lg",
  body: "text-body",
  small: "text-small",
  caption: "text-caption",
  label: "text-label",
} as const;

export type TextVariant = keyof typeof variantClass;

const defaultElement: Record<TextVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  "body-lg": "p",
  body: "p",
  small: "p",
  caption: "span",
  label: "span",
};

export type TextProps = Omit<HTMLAttributes<HTMLElement>, "color"> & {
  variant?: TextVariant;
  as?: ElementType;
  children: ReactNode;
};

export function Text({
  variant = "body",
  as,
  className,
  children,
  ...rest
}: TextProps) {
  const Component = as ?? defaultElement[variant];

  return (
    <Component className={cn(variantClass[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
