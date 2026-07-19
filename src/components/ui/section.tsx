import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { Container, type ContainerSize } from "@/components/ui/container";
import { cn } from "@/utils/cn";

const paddingStyles = {
  none: "",
  sm: "py-8 sm:py-10",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-24",
} as const;

export type SectionProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  padding?: keyof typeof paddingStyles;
  containerSize?: ContainerSize;
  contained?: boolean;
  children: ReactNode;
};

export function Section({
  as,
  padding = "md",
  containerSize = "lg",
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  const Component = as ?? "section";

  return (
    <Component className={cn(paddingStyles[padding], className)} {...props}>
      {contained ? (
        <Container size={containerSize}>{children}</Container>
      ) : (
        children
      )}
    </Component>
  );
}
