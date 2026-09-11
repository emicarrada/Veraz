import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { SUPPORT_EMAIL } from "@/config/site-navigation";
import { buildStaticPageMetadata } from "@/features/seo/build-page-metadata";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "static.contact" });

  return buildStaticPageMetadata({
    locale: locale as Locale,
    segment: "contacto",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function ContactoPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "static.contact" });

  return (
    <StaticPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <p>{t("p1")}</p>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>{t("p2")}</p>
    </StaticPageShell>
  );
}
