"use client";

import { usePathname } from "next/navigation";

import { PillNav, type PillNavItem } from "@/components/ui/pill-nav";
import { FEED_ROUTE } from "@/features/news/constants";

const SITE_NAV_ITEMS: PillNavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Noticias", href: FEED_ROUTE },
];

function resolveActiveHref(pathname: string): string {
  if (pathname === FEED_ROUTE || pathname.startsWith(`${FEED_ROUTE}/`)) {
    return FEED_ROUTE;
  }
  if (pathname === "/") {
    return "/";
  }
  return pathname;
}

/** Site-wide pill navigation — logo, Inicio, Noticias. */
export function SitePillNav() {
  const pathname = usePathname();
  const activeHref = resolveActiveHref(pathname);

  return (
    <PillNav
      logo="/verazicon.png"
      logoAlt="Veraz"
      logoHref="/"
      items={SITE_NAV_ITEMS}
      activeHref={activeHref}
      initialLoadAnimation={false}
      ease="power2.easeOut"
      baseColor="#111111"
      pillColor="#1a1a1a"
      pillTextColor="#f5f5f5"
      hoveredPillFillColor="#ffffff"
      hoveredPillTextColor="#111111"
    />
  );
}
