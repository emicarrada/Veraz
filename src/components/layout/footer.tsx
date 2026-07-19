import type { HTMLAttributes, ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/utils/cn";

export type FooterProps = HTMLAttributes<HTMLElement> & {
  nav?: ReactNode;
  meta?: ReactNode;
  legal?: ReactNode;
  logoVariant?: "default" | "transparent" | "icon";
};

/**
 * Application footer shell. Composition slots only.
 */
export function Footer({
  nav,
  meta,
  legal,
  logoVariant = "icon",
  className,
  ...props
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn("mt-auto border-t border-border bg-surface", className)}
      {...props}
    >
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo variant={logoVariant} size="sm" />
            <p className="mt-3 text-small">Informar sin influenciar.</p>
          </div>
          {nav ? (
            <nav
              aria-label="Pie de página"
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {nav}
            </nav>
          ) : null}
          {meta ? <div className="text-small">{meta}</div> : null}
        </div>
        <Divider className="my-8" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption">© {year} Veraz</p>
          {legal ? (
            <div className="flex flex-wrap gap-4 text-caption">{legal}</div>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
