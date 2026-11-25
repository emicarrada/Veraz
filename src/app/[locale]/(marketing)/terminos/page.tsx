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
  const t = await getTranslations({ locale, namespace: "static.terms" });

  return buildStaticPageMetadata({
    locale: locale as Locale,
    segment: "terminos",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function TerminosPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "static.terms" });

  return (
    <StaticPageShell title={t("pageTitle")} description={t("pageDescription")}>
      <p>{t("updated")}</p>
      {(
        [
          "who",
          "noAccount",
          "account",
          "data",
          "mail",
          "google",
          "acceptance",
          "content",
          "use",
          "closing",
          "liability",
          "law",
        ] as const
      ).map((key) => (
        <section key={key}>
          <h2>{t(`sections.${key}.title`)}</h2>
          <p>{t(`sections.${key}.body`)}</p>
        </section>
      ))}

      <h2>{t("sections.contact.title")}</h2>
      <p>
        {t("sections.contact.bodyPrefix")}{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        {t("sections.contact.bodySuffix")}
      </p>
    </StaticPageShell>
  );
}
