import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { SUPPORT_EMAIL } from "@/config/site-navigation";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "static.terms" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      languages: { es: "/es/terminos", en: "/en/terminos" },
    },
  };
}

export default async function TerminosPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "static.terms" });

  return (
    <StaticPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <h2>{t("sections.service.title")}</h2>
      <p>{t("sections.service.body")}</p>

      <h2>{t("sections.use.title")}</h2>
      <p>{t("sections.use.body")}</p>

      <h2>{t("sections.liability.title")}</h2>
      <p>{t("sections.liability.body")}</p>

      <h2>{t("sections.contact.title")}</h2>
      <p>
        {t("sections.contact.bodyPrefix")}{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        {t("sections.contact.bodySuffix")}
      </p>
    </StaticPageShell>
  );
}
