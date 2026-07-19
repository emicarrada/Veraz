import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header, type HeaderProps } from "@/components/layout/header";
import { MainContainer } from "@/components/layout/main-container";
import { Sidebar, type SidebarProps } from "@/components/layout/sidebar";
import { cn } from "@/utils/cn";

export type AppShellProps = {
  children: ReactNode;
  header?: HeaderProps;
  showHeader?: boolean;
  sidebar?: SidebarProps;
  showFooter?: boolean;
  footerNav?: ReactNode;
  footerLegal?: ReactNode;
  className?: string;
};

/**
 * Optional composition helper for future app layouts.
 * Does not define product pages.
 */
export function AppShell({
  children,
  header,
  showHeader = true,
  sidebar,
  showFooter = true,
  footerNav,
  footerLegal,
  className,
}: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-bg", className)}>
      {showHeader ? <Header {...header} /> : null}
      <div className="flex min-h-0 flex-1">
        {sidebar ? <Sidebar {...sidebar} /> : null}
        <MainContainer withSidebar={Boolean(sidebar)}>{children}</MainContainer>
      </div>
      {showFooter ? <Footer nav={footerNav} legal={footerLegal} /> : null}
    </div>
  );
}
