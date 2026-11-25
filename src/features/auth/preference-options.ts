import { RSS_FEED_CATALOG } from "@/config/domains/rss-feed-catalog";

/** Sections the reader can put on their home. Specific tags stay inside the section. */
export const PREFERENCE_TOPIC_SLUGS = [
  "politica",
  "economia",
  "deportes",
  "internacional",
  "sociedad",
  "cultura",
  "tecnologia",
] as const;

export type PreferenceTopicSlug = (typeof PREFERENCE_TOPIC_SLUGS)[number];

const COUNTRY_ORDER = ["MX", "ES", "AR", "US", "GB"] as const;

export const SEX_OPTIONS = ["female", "male", "other", "undisclosed"] as const;

export type SexOption = (typeof SEX_OPTIONS)[number];

export const MIN_ACCOUNT_AGE = 16;
export const MAX_ACCOUNT_AGE = 120;

export type ReaderPreferences = {
  countryCodes: string[];
  topicSlugs: PreferenceTopicSlug[];
  onboardingCompletedAt: string | null;
  firstName: string;
  lastName: string;
  sex: SexOption | null;
  age: number | null;
  emailUpdates: boolean;
  termsAcceptedAt: string | null;
};

export type ReaderOnboardingInput = {
  firstName: string;
  lastName: string;
  sex: string;
  age: string;
  emailUpdates: boolean;
  termsAccepted: boolean;
  countryCodes: readonly string[];
  topicSlugs: readonly string[];
};

export type ReaderOnboardingError = "name" | "sex" | "age" | "topic" | "country" | "terms";

export function preferenceCountryCodes(): string[] {
  const present = new Set(
    RSS_FEED_CATALOG.map((entry) => entry.countryCode).filter((code): code is string => Boolean(code)),
  );
  return COUNTRY_ORDER.filter((code) => present.has(code));
}

export function parseReaderPreferences(input: {
  countryCodes: readonly string[];
  topicSlugs: readonly string[];
}): { ok: true; value: Pick<ReaderPreferences, "countryCodes" | "topicSlugs"> } | { ok: false; error: "topic" | "country" } {
  const allowedCountries = new Set(preferenceCountryCodes());
  const allowedTopics = new Set<string>(PREFERENCE_TOPIC_SLUGS);
  const countryCodes = [...new Set(input.countryCodes.map((code) => code.trim().toUpperCase()))].filter((code) =>
    allowedCountries.has(code),
  );
  const topicSlugs = [...new Set(input.topicSlugs.map((slug) => slug.trim().toLowerCase()))].filter(
    (slug): slug is PreferenceTopicSlug => allowedTopics.has(slug),
  );

  if (topicSlugs.length === 0) return { ok: false, error: "topic" };
  if (countryCodes.length === 0) return { ok: false, error: "country" };
  return { ok: true, value: { countryCodes, topicSlugs } };
}

export function isSexOption(value: string): value is SexOption {
  return (SEX_OPTIONS as readonly string[]).includes(value);
}

function cleanName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 80) return null;
  if (/[\u0000-\u001F]/.test(name)) return null;
  return name;
}

/** Profile plus the topics and countries that filter the personal home. Sex and age do not. */
export function parseReaderOnboarding(
  input: ReaderOnboardingInput,
): { ok: true; value: Omit<ReaderPreferences, "onboardingCompletedAt" | "termsAcceptedAt"> } | { ok: false; error: ReaderOnboardingError } {
  const firstName = cleanName(input.firstName);
  const lastName = cleanName(input.lastName);
  if (!firstName || !lastName) return { ok: false, error: "name" };
  if (!isSexOption(input.sex)) return { ok: false, error: "sex" };

  const age = Number(input.age);
  if (!Number.isInteger(age) || age < MIN_ACCOUNT_AGE || age > MAX_ACCOUNT_AGE) {
    return { ok: false, error: "age" };
  }
  if (!input.termsAccepted) return { ok: false, error: "terms" };

  const topics = parseReaderPreferences({
    countryCodes: input.countryCodes,
    topicSlugs: input.topicSlugs,
  });
  if (!topics.ok) return topics;

  return {
    ok: true,
    value: {
      firstName,
      lastName,
      sex: input.sex,
      age,
      emailUpdates: input.emailUpdates,
      ...topics.value,
    },
  };
}
