import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import {
  FEED_VERTICAL_COPY,
  buildFeedCategoryHref,
} from "@/features/news/utils/feed-vertical-presets";
import { cn } from "@/utils/cn";

const VERTICALS = [
  {
    key: "finanzas" as const,
    label: FEED_VERTICAL_COPY.finanzas.title,
    href: buildFeedCategoryHref(FEED_VERTICAL_COPY.finanzas.categorySlug),
    description: FEED_VERTICAL_COPY.finanzas.description,
  },
  {
    key: "tecnologia" as const,
    label: FEED_VERTICAL_COPY.tecnologia.title,
    href: buildFeedCategoryHref(FEED_VERTICAL_COPY.tecnologia.categorySlug),
    description: FEED_VERTICAL_COPY.tecnologia.description,
  },
] as const;

const GENERAL_CATEGORIES = [
  { label: "Política", href: buildFeedCategoryHref("politica") },
  { label: "Internacional", href: buildFeedCategoryHref("internacional") },
  { label: "Deportes", href: buildFeedCategoryHref("deportes") },
  { label: "Sociedad", href: buildFeedCategoryHref("sociedad") },
] as const;

export function LandingCategoriesSection() {
  return (
    <Section
      id="categorias"
      padding="lg"
      aria-labelledby="categorias-heading"
      className="landing-section landing-section--muted border-t border-border"
    >
      <LandingSectionHeader
        id="categorias-heading"
        title="Infórmate diariamente en tu rubro"
        description="Veraz agrega fuentes verificables y te muestra lo último varias veces al día. Cada titular enlaza a la fuente original."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {VERTICALS.map((vertical) => (
          <article
            key={vertical.key}
            className={cn(
              "flex flex-col rounded-xl border border-border bg-surface p-6",
              "veraz-transition hover:border-border-strong hover:bg-surface-elevated",
            )}
          >
            <Text variant="h3">{vertical.label}</Text>
            <Text variant="body" className="mt-3 flex-1 text-ink-secondary">
              {vertical.description}
            </Text>
            <Button href={vertical.href} variant="secondary" size="md" className="mt-6 w-fit">
              Ver {vertical.label.toLowerCase()}
            </Button>
          </article>
        ))}
      </div>

      <Text variant="small" className="mt-10 text-ink-secondary">
        También cubrimos otras áreas:
      </Text>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GENERAL_CATEGORIES.map((category) => (
          <li key={category.label}>
            <a
              href={category.href}
              className={cn(
                "flex min-h-[3.5rem] items-center justify-center rounded-lg border border-border",
                "bg-surface px-3 py-3 text-center",
                "veraz-transition veraz-focus-ring",
                "hover:border-border-strong hover:bg-surface-elevated",
              )}
            >
              <Text as="span" variant="small" className="text-ink-secondary hover:text-ink">
                {category.label}
              </Text>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
