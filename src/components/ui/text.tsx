import { createElement, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

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

type TextOwnProps = {
  variant?: TextVariant;
  children: ReactNode;
};

export type TextProps<T extends ElementType = "p"> = TextOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps | "as" | "color"> & {
    as?: T;
  };

export function Text<T extends ElementType = "p">({
  variant = "body",
  as,
  className,
  children,
  ...rest
}: TextProps<T>) {
  const Component = as ?? defaultElement[variant];

  return createElement(
    Component,
    { className: cn(variantClass[variant], className), ...rest },
    children,
  );
}
