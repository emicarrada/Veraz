import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

/** Product route group — pages compose AppShell individually. */
export default function AppLayout({ children }: AppLayoutProps) {
  return children;
}
