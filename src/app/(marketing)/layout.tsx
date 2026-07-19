import type { ReactNode } from "react";

type MarketingLayoutProps = {
  children: ReactNode;
};

/**
 * Marketing route group layout.
 * Landing composes its own Header/Footer; keep this shell minimal.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return children;
}
