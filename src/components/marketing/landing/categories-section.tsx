import { getLocale, getTranslations } from "next-intl/server";

import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import { buildFeedCategoryHref } from "@/features/news/utils/feed-vertical-presets";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/utils/cn";

const GENERAL_CATEGORY_SLUGS = ["politica", "internacional", "deportes", "sociedad"] as const;

export async function LandingCategoriesSection() {
  const t = await getTranslations("landing.categories");
  const tFeed = await getTranslations("feed.categories");
  const locale = (await getLocale()) as Locale;

  const verticals = [
    {
      key: "finanzas" as const,
      categorySlug: "economia" as const,
    },
    {
      key: "tecnologia" as const,
      categorySlug: "tecnologia" as const,
    },
  ] as const;

  return (
    <Section
      id="categorias"
      padding="lg"
      aria-labelledby="categorias-heading"
      className="landing-section landing-section--muted border-t border-border"
    >
      <LandingSectionHeader
        id="categorias-heading"
        title={t("title")}
        description={t("description")}
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {verticals.map((vertical) => (
          <article
            key={vertical.key}
            className={cn(
              "flex flex-col rounded-xl border border-border bg-surface p-6",
              "veraz-transition hover:border-border-strong hover:bg-surface-elevated",
            )}
          >
            <Text variant="h3">{t(`${vertical.key}.title`)}</Text>
            <Text variant="body" className="mt-3 flex-1 text-ink-secondary">
              {t(`${vertical.key}.description`)}
            </Text>
            <Button
              href={buildFeedCategoryHref(locale, vertical.categorySlug)}
              variant="secondary"
              size="md"
              className="mt-6 w-fit"
            >
              {t(`${vertical.key}.cta`)}
            </Button>
          </article>
        ))}
      </div>

      <Text variant="small" className="mt-10 text-ink-secondary">
        {t("alsoCover")}
      </Text>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GENERAL_CATEGORY_SLUGS.map((slug) => (
          <li key={slug}>
            <a
              href={buildFeedCategoryHref(locale, slug)}
              className={cn(
                "flex min-h-[3.5rem] items-center justify-center rounded-lg border border-border",
                "bg-surface px-3 py-3 text-center",
                "veraz-transition veraz-focus-ring",
                "hover:border-border-strong hover:bg-surface-elevated",
              )}
            >
              <Text as="span" variant="small" className="text-ink-secondary hover:text-ink">
                {tFeed(slug)}
              </Text>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
