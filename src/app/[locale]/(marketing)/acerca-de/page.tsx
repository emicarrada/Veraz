import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig } from "@/config";
import { buildStaticPageMetadata } from "@/features/seo/build-page-metadata";
import { buildOrganizationJsonLd, JsonLdScript } from "@/features/seo/build-json-ld";
import { SUPPORT_EMAIL } from "@/config/site-navigation";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "static.about" });

  return buildStaticPageMetadata({
    locale: locale as Locale,
    segment: "acerca-de",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function AcercaDePage({ params }: PageProps) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "static.about" });
  const { name, tagline, siteUrl } = getAppConfig();

  const organization = buildOrganizationJsonLd({
    siteUrl,
    name,
    tagline,
    description: t("metaDescription"),
    locale: resolvedLocale,
  });

  return (
    <>
      <JsonLdScript schema={organization} />
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
    </>
  );
}
