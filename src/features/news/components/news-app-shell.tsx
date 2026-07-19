import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export type NewsAppShellProps = {
  children: ReactNode;
};

export function NewsAppShell({ children }: NewsAppShellProps) {
  return (
    <AppShell
      showHeader={false}
      showFooter
      footerLegal={
        <span className="text-caption text-ink-muted">
          Veraz — informar sin influenciar.
        </span>
      }
    >
      {children}
    </AppShell>
  );
}
