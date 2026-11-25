import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Section } from "@/components/ui/section";
import {
  getAuthSession,
  getReaderPreferences,
  PreferenceForm,
  preferenceCountryCodes,
  PREFERENCE_TOPIC_SLUGS,
  type SexOption,
} from "@/features/auth";
import { NewsAppShell, resolveVisitorCountry } from "@/features/news";
import type { Locale } from "@/i18n/routing";

type PreferencesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: PreferencesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("preferencesTitle"), robots: { index: false, follow: false } };
}

export default async function PreferencesPage({ params, searchParams }: PreferencesPageProps) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  const query = await searchParams;
  const t = await getTranslations("auth");
  const tFeed = await getTranslations("feed.categories");
  const tCountries = await getTranslations("auth.countries");
  const session = await getAuthSession();

  if (!session) {
    redirect(`/${resolvedLocale}/entrar`);
  }

  const initial = await getReaderPreferences(session.userId);
  const headerList = await headers();
  const topicLabels = Object.fromEntries(PREFERENCE_TOPIC_SLUGS.map((slug) => [slug, tFeed(slug)]));
  const countryLabels = Object.fromEntries(
    preferenceCountryCodes().map((code) => [code, tCountries(code as "MX")]),
  );
  const sexLabels = {
    female: t("sexOptions.female"),
    male: t("sexOptions.male"),
    other: t("sexOptions.other"),
    undisclosed: t("sexOptions.undisclosed"),
  } satisfies Record<SexOption, string>;

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <PreferenceForm
          locale={resolvedLocale}
          initial={initial}
          suggestedCountry={resolveVisitorCountry(headerList)}
          topicLabels={topicLabels}
          countryLabels={countryLabels}
          sexLabels={sexLabels}
          error={query.error}
          copy={{
            title: t("preferencesTitle"),
            lead: t("preferencesLead"),
            firstName: t("firstName"),
            lastName: t("lastName"),
            sex: t("sex"),
            sexPlaceholder: t("sexPlaceholder"),
            age: t("age"),
            ageHint: t("ageHint"),
            topics: t("topicsLabel"),
            countries: t("countriesLabel"),
            emailUpdates: t("emailUpdates"),
            termsAccept: t("termsAccept"),
            termsLink: t("termsLink"),
            save: t("save"),
            nameError: t("needName"),
            sexError: t("needSex"),
            ageError: t("needAge"),
            topicError: t("needTopic"),
            countryError: t("needCountry"),
            termsError: t("needTerms"),
            saveError: t("saveFailed"),
          }}
        />
      </Section>
    </NewsAppShell>
  );
}
