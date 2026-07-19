import type { HTMLAttributes, ReactNode } from "react";

import { ChiikoCredit } from "@/components/layout/chiiko-credit";
import { Container } from "@/components/ui/container";
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

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-border pt-6 sm:mt-10 sm:pt-8">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 sm:gap-y-1">
            <p className="text-caption text-ink-muted">© {year} Veraz</p>
            {legal ? (
              <>
                <span
                  className="hidden sm:block h-3 w-px shrink-0 bg-border"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-caption">
                  {legal}
                </div>
              </>
            ) : null}
          </div>

          <ChiikoCredit />
        </div>
      </Container>
    </footer>
  );
}
