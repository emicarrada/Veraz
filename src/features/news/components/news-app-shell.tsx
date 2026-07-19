import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { MainContainer } from "@/components/layout/main-container";

export type NewsAppShellProps = {
  children: ReactNode;
};

export function NewsAppShell({ children }: NewsAppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <MainContainer className="flex-1">{children}</MainContainer>
      <SiteFooter />
    </div>
  );
}
