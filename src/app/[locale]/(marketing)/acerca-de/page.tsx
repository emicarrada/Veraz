import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig } from "@/config";
import { SUPPORT_EMAIL } from "@/config/site-navigation";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "static.about" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      languages: { es: "/es/acerca-de", en: "/en/acerca-de" },
    },
  };
}

export default async function AcercaDePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "static.about" });
  const { name, tagline } = getAppConfig();

  return (
    <StaticPageShell
      title={t("pageTitle")}
      description={t("pageDescription", { name, tagline })}
    >
      <p>{t("intro", { name })}</p>

      <h2>{t("sections.premise.title")}</h2>
      <p>{t("sections.premise.body")}</p>

      <h2>{t("sections.whatYouFind.title")}</h2>
      <ul>
        {(t.raw("sections.whatYouFind.items") as string[]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t("sections.contact.title")}</h2>
      <p>
        {t("sections.contact.bodyPrefix", { name })}{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        {t("sections.contact.bodySuffix")}
      </p>
    </StaticPageShell>
  );
}
