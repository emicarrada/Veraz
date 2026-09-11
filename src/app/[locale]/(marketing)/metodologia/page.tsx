import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig } from "@/config";
import { SUPPORT_EMAIL } from "@/config/site-navigation";
import { buildFaqPageJsonLd, JsonLdScript } from "@/features/seo/build-json-ld";
import { buildStaticPageMetadata } from "@/features/seo/build-page-metadata";
import type { Locale } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "static.methodology" });

  return buildStaticPageMetadata({
    locale: locale as Locale,
    segment: "metodologia",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function MetodologiaPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "static.methodology" });
  const { name } = getAppConfig();

  const faq = buildFaqPageJsonLd([
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
  ]);

  return (
    <>
      <JsonLdScript schema={faq} />
      <StaticPageShell
        title={t("pageTitle")}
        description={t("pageDescription", { name })}
      >
        <p>{t("intro")}</p>

        <h2>{t("sections.sources.title")}</h2>
        <p>{t("sections.sources.body")}</p>

        <h2>{t("sections.aggregation.title")}</h2>
        <p>{t("sections.aggregation.body")}</p>

        <h2>{t("sections.classification.title")}</h2>
        <p>{t("sections.classification.body")}</p>

        <h2>{t("sections.traceability.title")}</h2>
        <p>{t("sections.traceability.body", { name })}</p>

        <h2>{t("sections.whatWeDont.title")}</h2>
        <ul>
          {(t.raw("sections.whatWeDont.items") as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2>{t("sections.corrections.title")}</h2>
        <p>
          {t("sections.corrections.bodyPrefix")}{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.{" "}
          {t("sections.corrections.bodySuffix")}
        </p>

        <h2>{t("faq.q1")}</h2>
        <p>{t("faq.a1")}</p>
        <h2>{t("faq.q2")}</h2>
        <p>{t("faq.a2")}</p>
        <h2>{t("faq.q3")}</h2>
        <p>{t("faq.a3")}</p>
      </StaticPageShell>
    </>
  );
}
