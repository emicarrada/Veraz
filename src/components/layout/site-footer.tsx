import type { ReactNode } from "react";
import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { SITE_FOOTER_LEGAL, SITE_FOOTER_NAV } from "@/config/site-navigation";

const linkClassName =
  "text-small text-ink-secondary veraz-transition hover:text-ink veraz-focus-ring rounded-sm";

const legalLinkClassName =
  "text-ink-muted veraz-transition hover:text-ink-secondary veraz-focus-ring rounded-sm";

export function SiteFooter() {
  return (
    <Footer
      logoVariant="icon"
      nav={
        <>
          {SITE_FOOTER_NAV.map((link) => (
            <Link key={link.href} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ))}
        </>
      }
      legal={
        <>
          {SITE_FOOTER_LEGAL.map((link) => (
            <Link key={link.href} href={link.href} className={legalLinkClassName}>
              {link.label}
            </Link>
          ))}
        </>
      }
    />
  );
}
