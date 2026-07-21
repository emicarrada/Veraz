"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { useLocale } from "next-intl";

import { homePath, feedPath, staticPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

const linkClassName =
  "text-small text-ink-secondary veraz-transition hover:text-ink veraz-focus-ring rounded-sm";

const legalLinkClassName =
  "text-ink-muted veraz-transition hover:text-ink-secondary veraz-focus-ring rounded-sm";

export function SiteFooter() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;

  const navLinks = [
    { href: homePath(locale), label: t("home") },
    { href: feedPath(locale), label: t("news") },
    { href: staticPath(locale, "/metodologia"), label: t("methodology") },
    { href: staticPath(locale, "/acerca-de"), label: t("about") },
    { href: staticPath(locale, "/contacto"), label: t("contact") },
  ] as const;

  const legalLinks = [
    { href: staticPath(locale, "/privacidad"), label: t("privacy") },
    { href: staticPath(locale, "/terminos"), label: t("terms") },
  ] as const;

  return (
    <Footer
      logoVariant="icon"
      nav={
        <>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ))}
        </>
      }
      legal={
        <>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className={legalLinkClassName}>
              {link.label}
            </Link>
          ))}
        </>
      }
    />
  );
}
