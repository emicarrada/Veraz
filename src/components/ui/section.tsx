import { createElement, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

import { Container, type ContainerSize } from "@/components/ui/container";
import { cn } from "@/utils/cn";

const paddingStyles = {
  none: "",
  sm: "py-8 sm:py-10",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-24",
} as const;

type SectionOwnProps = {
  padding?: keyof typeof paddingStyles;
  containerSize?: ContainerSize;
  contained?: boolean;
  children: ReactNode;
};

export type SectionProps<T extends ElementType = "section"> = SectionOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof SectionOwnProps | "as"> & {
    as?: T;
  };

export function Section<T extends ElementType = "section">({
  as,
  padding = "md",
  containerSize = "lg",
  contained = true,
  className,
  children,
  ...props
}: SectionProps<T>) {
  const Component = as ?? "section";

  return createElement(
    Component,
    { className: cn(paddingStyles[padding], className), ...props },
    contained ? (
      <Container size={containerSize}>{children}</Container>
    ) : (
      children
    ),
  );
}
