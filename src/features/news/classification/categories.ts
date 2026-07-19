export const NEWS_CATEGORY_IMAGE_BASE = "/ImagenesNoticias" as const;

export type NewsTopicGroup =
  | "politica"
  | "economia"
  | "deportes"
  | "internacional"
  | "sociedad"
  | "cultura"
  | "tecnologia"
  | "general";

/** Specific and broad topic slugs persisted on articles and used in filters. */
export type NewsTopicSlug =
  | NewsTopicGroup
  | "sheinbaum"
  | "trump"
  | "unam"
  | "openai"
  | "google"
  | "inteligencia-artificial"
  | "futbol"
  | "nba"
  | "rugby"
  | "messi"
  | "ronaldo"
  | "mercados"
  | "criptomonedas";

/** @deprecated Use NewsTopicSlug */
export type NewsCategorySlug = NewsTopicSlug;

export type NewsTopic = {
  slug: NewsTopicSlug;
  label: string;
  fallbackImage: string;
  group: NewsTopicGroup;
  /** Shown in the specific-tags filter row */
  showInSpecificFilters?: boolean;
};

export const NEWS_TOPICS: readonly NewsTopic[] = [
  { slug: "politica", label: "Política", fallbackImage: "politica.webp", group: "politica" },
  { slug: "sheinbaum", label: "Sheinbaum", fallbackImage: "sheinbaum.webp", group: "politica", showInSpecificFilters: true },
  { slug: "economia", label: "Finanzas", fallbackImage: "economia.webp", group: "economia" },
  {
    slug: "mercados",
    label: "Mercados",
    fallbackImage: "economia.webp",
    group: "economia",
    showInSpecificFilters: true,
  },
  {
    slug: "criptomonedas",
    label: "Criptomonedas",
    fallbackImage: "economia.webp",
    group: "economia",
    showInSpecificFilters: true,
  },
  {
    slug: "internacional",
    label: "Internacional",
    fallbackImage: "internacional.webp",
    group: "internacional",
  },
  { slug: "trump", label: "Trump", fallbackImage: "trump.webp", group: "internacional", showInSpecificFilters: true },
  { slug: "deportes", label: "Deportes", fallbackImage: "futbol.webp", group: "deportes" },
  { slug: "futbol", label: "Fútbol", fallbackImage: "futbol.webp", group: "deportes", showInSpecificFilters: true },
  { slug: "nba", label: "Baloncesto", fallbackImage: "nba.webp", group: "deportes", showInSpecificFilters: true },
  { slug: "rugby", label: "Rugby", fallbackImage: "rugby.webp", group: "deportes", showInSpecificFilters: true },
  { slug: "messi", label: "Messi", fallbackImage: "messi.webp", group: "deportes", showInSpecificFilters: true },
  { slug: "ronaldo", label: "Ronaldo", fallbackImage: "ronaldo.webp", group: "deportes", showInSpecificFilters: true },
  { slug: "sociedad", label: "Sociedad", fallbackImage: "sociedad.webp", group: "sociedad" },
  { slug: "unam", label: "UNAM", fallbackImage: "unam.webp", group: "sociedad", showInSpecificFilters: true },
  { slug: "cultura", label: "Cultura", fallbackImage: "cultura.webp", group: "cultura" },
  { slug: "tecnologia", label: "Tecnología", fallbackImage: "tecnologia.webp", group: "tecnologia" },
  { slug: "openai", label: "OpenAI", fallbackImage: "openAI.webp", group: "tecnologia", showInSpecificFilters: true },
  { slug: "google", label: "Google", fallbackImage: "google.webp", group: "tecnologia", showInSpecificFilters: true },
  {
    slug: "inteligencia-artificial",
    label: "Inteligencia artificial",
    fallbackImage: "AI.webp",
    group: "tecnologia",
    showInSpecificFilters: true,
  },
  { slug: "general", label: "General", fallbackImage: "general.webp", group: "general" },
] as const;

/** Broad groups shown as primary feed tabs (order matters). */
export const NEWS_FEED_TAB_ORDER: readonly NewsTopicGroup[] = [
  "economia",
  "tecnologia",
  "politica",
  "internacional",
  "deportes",
  "sociedad",
  "cultura",
];

/** Broad groups shown as primary filter chips. */
export const NEWS_FILTER_GROUPS = NEWS_FEED_TAB_ORDER.flatMap((slug) => {
  const topic = NEWS_TOPICS.find((entry) => entry.slug === slug && entry.slug === entry.group);
  return topic ? [topic] : [];
});

/** Specific topic tags for finer filtering and search. */
export const NEWS_SPECIFIC_FILTER_TOPICS = NEWS_TOPICS.filter(
  (topic) => topic.showInSpecificFilters,
);

/** @deprecated Use NEWS_TOPICS */
export const NEWS_CATEGORIES = NEWS_FILTER_GROUPS;

const TOPIC_BY_SLUG = new Map<string, NewsTopic>(
  NEWS_TOPICS.map((topic) => [topic.slug, topic]),
);

const TOPIC_SLUGS = new Set<string>(NEWS_TOPICS.map((topic) => topic.slug));

const GROUP_SLUGS = new Set<NewsTopicGroup>(
  NEWS_FILTER_GROUPS.map((topic) => topic.group),
);

export function isNewsTopicSlug(value: string): value is NewsTopicSlug {
  return TOPIC_SLUGS.has(value);
}

export function isNewsTopicGroup(value: string): value is NewsTopicGroup {
  return GROUP_SLUGS.has(value as NewsTopicGroup);
}

/** @deprecated Use isNewsTopicSlug */
export function isNewsCategorySlug(value: string): value is NewsTopicSlug {
  return isNewsTopicSlug(value);
}

export function getTopic(slug: NewsTopicSlug): NewsTopic | undefined {
  return TOPIC_BY_SLUG.get(slug);
}

export function getTopicGroup(slug: NewsTopicSlug): NewsTopicGroup {
  return getTopic(slug)?.group ?? "general";
}

export function getCategoryLabel(slug: NewsTopicSlug): string {
  return getTopic(slug)?.label ?? "General";
}

export function getCategoryFallbackImageUrl(slug: NewsTopicSlug): string {
  const file = getTopic(slug)?.fallbackImage ?? "general.webp";
  return `${NEWS_CATEGORY_IMAGE_BASE}/${file}`;
}

export function parseCategorySlug(value: string | undefined | null): NewsTopicSlug | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return isNewsTopicSlug(normalized) ? normalized : undefined;
}

/** Slugs stored in DB that match a filter chip (group expands to all topics in group). */
export function getTopicSlugsForFilter(filterSlug: NewsTopicSlug): NewsTopicSlug[] {
  if (!GROUP_SLUGS.has(filterSlug as NewsTopicGroup)) {
    return [filterSlug];
  }

  const group = filterSlug as NewsTopicGroup;
  return NEWS_TOPICS.filter((topic) => topic.group === group).map((topic) => topic.slug);
}

/** Re-run classifier when a stored slug is still too broad. */
export function isBroadStoredTopic(slug: NewsTopicSlug): boolean {
  return (
    slug === "general" ||
    slug === "deportes" ||
    slug === "internacional" ||
    slug === "politica" ||
    slug === "tecnologia" ||
    slug === "sociedad"
  );
}
