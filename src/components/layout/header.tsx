import type { HTMLAttributes, ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/utils/cn";

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  brandHref?: string;
  nav?: ReactNode;
  actions?: ReactNode;
  mobileTrigger?: ReactNode;
  sticky?: boolean;
};

/**
 * Application header shell. Slots only — no product routes hardcoded.
 */
export function Header({
  brandHref = "/",
  nav,
  actions,
  mobileTrigger,
  sticky = true,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "z-sticky border-b border-border bg-surface/90 backdrop-blur-md",
        sticky && "sticky top-0",
        className,
      )}
      {...props}
    >
      <Container className="flex h-header items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-8">
          <a
            href={brandHref}
            className="shrink-0 veraz-focus-ring rounded-md"
            aria-label="Veraz inicio"
          >
            <Logo size="md" priority />
          </a>
          {nav ? (
            <nav
              aria-label="Principal"
              className="hidden min-w-0 items-center gap-1 md:flex"
            >
              {nav}
            </nav>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {actions ? (
            <div className="hidden items-center gap-2 sm:flex">{actions}</div>
          ) : null}
          {mobileTrigger ? (
            <div className="md:hidden">{mobileTrigger}</div>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
