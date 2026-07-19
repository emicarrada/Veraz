import {
  getTopicGroup,
  type NewsTopicGroup,
  type NewsTopicSlug,
} from "@/features/news/classification/categories";

export type PrestigiousSource = {
  slug: string;
  label: string;
};

/** Global reference outlets for the Finanzas tab — no tabloids or general-news portadas. */
export const PRESTIGIOUS_FINANCE_SOURCES: readonly PrestigiousSource[] = [
  { slug: "cnbc-top", label: "CNBC" },
  { slug: "marketwatch", label: "MarketWatch" },
  { slug: "bloomberg-linea", label: "Bloomberg Línea" },
  { slug: "expansion", label: "Expansión" },
  { slug: "el-pais-economia", label: "El País Economía" },
];

/** Global reference outlets for the Tecnología tab. */
export const PRESTIGIOUS_TECH_SOURCES: readonly PrestigiousSource[] = [
  { slug: "techcrunch", label: "TechCrunch" },
  { slug: "the-verge", label: "The Verge" },
  { slug: "ars-technica", label: "Ars Technica" },
  { slug: "wired", label: "Wired" },
  { slug: "mit-tech-review", label: "MIT Technology Review" },
  { slug: "engadget", label: "Engadget" },
  { slug: "el-pais-tecnologia", label: "El País Tecnología" },
];

const PRESTIGIOUS_BY_GROUP: Record<
  "economia" | "tecnologia",
  readonly PrestigiousSource[]
> = {
  economia: PRESTIGIOUS_FINANCE_SOURCES,
  tecnologia: PRESTIGIOUS_TECH_SOURCES,
};

export function isPrestigiousFeedGroup(
  group: NewsTopicGroup | undefined,
): group is "economia" | "tecnologia" {
  return group === "economia" || group === "tecnologia";
}

export function getPrestigiousSourcesForGroup(
  group: "economia" | "tecnologia",
): readonly PrestigiousSource[] {
  return PRESTIGIOUS_BY_GROUP[group];
}

export function getPrestigiousSourcesForCategory(
  categorySlug?: NewsTopicSlug,
): readonly PrestigiousSource[] | undefined {
  if (!categorySlug) return undefined;
  const group = getTopicGroup(categorySlug);
  if (!isPrestigiousFeedGroup(group)) return undefined;
  return getPrestigiousSourcesForGroup(group);
}

export function getPrestigiousSourceSlugsForCategory(
  categorySlug?: NewsTopicSlug,
): readonly string[] | undefined {
  const sources = getPrestigiousSourcesForCategory(categorySlug);
  return sources?.map((source) => source.slug);
}

/**
 * Prestigious tabs curate by source. Broad tabs (Finanzas/Tecnología) show all items
 * from those outlets; sub-tags (mercados, openai, …) also apply category filter.
 */
export function resolvePrestigiousFeedQuery(categorySlug?: NewsTopicSlug): {
  categorySlug?: NewsTopicSlug;
  sourceSlugs?: readonly string[];
} {
  const sourceSlugs = getPrestigiousSourceSlugsForCategory(categorySlug);
  if (!sourceSlugs?.length || !categorySlug) {
    return { ...(categorySlug ? { categorySlug } : {}) };
  }

  const group = getTopicGroup(categorySlug);
  if (categorySlug === group) {
    return { sourceSlugs };
  }

  return { categorySlug, sourceSlugs };
}

export function formatPrestigiousSourceLabels(
  sources: readonly PrestigiousSource[],
): string {
  return sources.map((source) => source.label).join(" · ");
}

export function getPrestigiousFeedTrustIntro(
  group: "economia" | "tecnologia",
): string {
  const labels = formatPrestigiousSourceLabels(getPrestigiousSourcesForGroup(group));
  if (group === "economia") {
    return (
      `Solo noticias de medios de referencia en finanzas y mercados (${labels}). ` +
      `Cada titular enlaza a la fuente original; Veraz no altera ni inventa hechos.`
    );
  }

  return (
    `Solo noticias de medios tecnológicos de referencia global (${labels}). ` +
    `Cada titular enlaza a la fuente original; Veraz no altera ni inventa hechos.`
  );
}
