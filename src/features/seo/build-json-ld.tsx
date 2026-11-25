export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(
  siteUrl: string,
  items: ReadonlyArray<BreadcrumbItem>,
): Record<string, unknown> {
  const base = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}

export type FaqEntry = {
  question: string;
  answer: string;
};

export function buildFaqPageJsonLd(entries: ReadonlyArray<FaqEntry>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export type CollectionPageJsonLdInput = {
  siteUrl: string;
  path: string;
  name: string;
  description: string;
};

export type ItemListEntry = {
  name: string;
  path: string;
};

export function buildItemListJsonLd(input: {
  siteUrl: string;
  path: string;
  name: string;
  items: ReadonlyArray<ItemListEntry>;
}): Record<string, unknown> {
  const base = input.siteUrl.replace(/\/$/, "");
  const url = `${base}${input.path}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${base}${item.path}`,
    })),
  };
}

export function buildWebSiteJsonLd(input: {
  siteUrl: string;
  name: string;
  description: string;
  locale: string;
  searchPath: string;
}): Record<string, unknown> {
  const base = input.siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: base,
    description: input.description,
    inLanguage: input.locale === "en" ? "en" : "es-MX",
    publisher: {
      "@type": "Organization",
      name: input.name,
      url: base,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}${input.searchPath}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildCollectionPageJsonLd(
  input: CollectionPageJsonLdInput,
): Record<string, unknown> {
  const url = `${input.siteUrl.replace(/\/$/, "")}${input.path}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Veraz",
      url: input.siteUrl,
    },
  };
}

export type OrganizationJsonLdInput = {
  siteUrl: string;
  name: string;
  tagline: string;
  description: string;
  locale: string;
};

export function buildOrganizationJsonLd(input: OrganizationJsonLdInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    slogan: input.tagline,
    description: input.description,
    url: input.siteUrl,
    logo: `${input.siteUrl.replace(/\/$/, "")}/veraznegrologo.png`,
    areaServed: {
      "@type": "Country",
      name: "Mexico",
    },
    knowsAbout: ["news", "journalism", "fact-checking", "media aggregation"],
    inLanguage: input.locale === "en" ? "en" : "es-MX",
  };
}

export function JsonLdScript({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
