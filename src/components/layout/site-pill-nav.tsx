"use client";

import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PillNav, type PillNavItem } from "@/components/ui/pill-nav";
import { usePathname } from "@/i18n/navigation";
import { feedPathname, homePathname, stripLocalePrefix } from "@/i18n/paths";

function resolveActiveHref(pathname: string): string {
  const stripped = stripLocalePrefix(pathname);

  if (stripped === "/noticias" || stripped.startsWith("/noticias/")) {
    return feedPathname();
  }

  if (stripped === "/") {
    return homePathname();
  }

  return stripped;
}

/** Site-wide pill navigation — logo, nav items, locale switcher. */
export function SitePillNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const activeHref = resolveActiveHref(pathname);

  const items: PillNavItem[] = [
    { label: t("home"), href: homePathname() },
    { label: t("news"), href: feedPathname() },
  ];

  return (
    <PillNav
      logo="/verazicon.png"
      logoAlt={t("logoAlt")}
      logoHref={homePathname()}
      items={items}
      activeHref={activeHref}
      initialLoadAnimation={false}
      ease="power2.easeOut"
      baseColor="#111111"
      pillColor="#1a1a1a"
      pillTextColor="#f5f5f5"
      hoveredPillFillColor="#ffffff"
      hoveredPillTextColor="#111111"
      navAriaLabel={t("mainAria")}
      homeAriaLabel={t("homeAria")}
      trailing={<LocaleSwitcher />}
    />
  );
}
