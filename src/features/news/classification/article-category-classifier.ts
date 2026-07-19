import {
  type NewsTopicSlug,
  parseCategorySlug,
} from "@/features/news/classification/categories";

export type ClassifyArticleInput = {
  title: string;
  excerpt?: string;
  bodyExcerpt?: string;
  rssCategories?: ReadonlyArray<string>;
};

type KeywordRule = {
  slug: NewsTopicSlug;
  keywords: readonly string[];
};

const RSS_LABEL_MAP: Record<string, NewsTopicSlug> = {
  politics: "politica",
  politica: "politica",
  "política": "politica",
  government: "politica",
  business: "economia",
  economia: "economia",
  "economía": "economia",
  economy: "economia",
  finance: "economia",
  markets: "mercados",
  stocks: "mercados",
  banking: "economia",
  cryptocurrency: "criptomonedas",
  crypto: "criptomonedas",
  bitcoin: "criptomonedas",
  sport: "deportes",
  sports: "deportes",
  deportes: "deportes",
  football: "futbol",
  futbol: "futbol",
  "fútbol": "futbol",
  soccer: "futbol",
  basketball: "nba",
  nba: "nba",
  rugby: "rugby",
  world: "internacional",
  internacional: "internacional",
  international: "internacional",
  society: "sociedad",
  sociedad: "sociedad",
  culture: "cultura",
  cultura: "cultura",
  entertainment: "cultura",
  technology: "tecnologia",
  tech: "tecnologia",
  tecnologia: "tecnologia",
  "tecnología": "tecnologia",
  science: "tecnologia",
  news: "general",
};

/** Most specific rules first — sports before international/politics to avoid wrong images. */
const SPECIFIC_RULES: readonly KeywordRule[] = [
  {
    slug: "criptomonedas",
    keywords: [
      "bitcoin",
      "ethereum",
      "criptomoneda",
      "criptomonedas",
      "crypto",
      "blockchain",
      "btc",
      "token",
      "defi",
      "stablecoin",
    ],
  },
  {
    slug: "mercados",
    keywords: [
      "bolsa",
      "s&p 500",
      "s&p500",
      "nasdaq",
      "dow jones",
      "wall street",
      "fed ",
      "federal reserve",
      "banxico",
      "banco central",
      "tipo de cambio",
      "índice",
      "indice burs",
      "acciones",
      "treasury",
      "bonos",
      "yield",
      "earnings",
    ],
  },
  {
    slug: "sheinbaum",
    keywords: ["sheinbaum", "claudia sheinbaum"],
  },
  {
    slug: "trump",
    keywords: ["donald trump", "trump", "maga"],
  },
  {
    slug: "unam",
    keywords: ["unam", "universidad nacional autonoma", "universidad nacional autónoma"],
  },
  {
    slug: "openai",
    keywords: ["openai", "chatgpt", "gpt-4", "gpt-5", "gpt-4o", "sam altman"],
  },
  {
    slug: "google",
    keywords: ["google", "alphabet", "gemini", "pixel"],
  },
  {
    slug: "inteligencia-artificial",
    keywords: [
      "inteligencia artificial",
      " machine learning",
      " deep learning",
      " ia generativa",
      " modelos de lenguaje",
    ],
  },
  {
    slug: "messi",
    keywords: ["lionel messi", "messi", "leo messi"],
  },
  {
    slug: "ronaldo",
    keywords: ["cristiano ronaldo", "ronaldo", "cr7"],
  },
  {
    slug: "nba",
    keywords: [
      "nba",
      "baloncesto",
      "básquetbol",
      "basquetbol",
      "basketball",
      "lebron",
      "lakers",
      "celtics",
      "warriors",
      "playoffs nba",
      "draft nba",
    ],
  },
  {
    slug: "rugby",
    keywords: ["rugby", "pumas", "six nations", "seis naciones", "mundial de rugby"],
  },
  {
    slug: "futbol",
    keywords: [
      "fútbol",
      "futbol",
      "gol",
      "liga mx",
      "champions league",
      "copa america",
      "copa américa",
      "copa del mundo",
      "mundial",
      "selección mexicana",
      "seleccion mexicana",
      "real madrid",
      "barcelona",
      "premier league",
      "boca juniors",
      "river plate",
      "america vs",
      "chivas",
      "estadio azteca",
      "penalti",
      "penalty",
      "del torneo",
    ],
  },
];

const BROAD_RULES: readonly KeywordRule[] = [
  {
    slug: "deportes",
    keywords: [
      "deportes",
      "deportivo",
      "atleta",
      "atletas",
      "campeonato",
      "medalla",
      "olimpi",
      "juegos olímpicos",
      "juegos olimpicos",
      "selección",
      "seleccion",
      "estadio",
      "partido",
    ],
  },
  {
    slug: "politica",
    keywords: [
      "presidente",
      "presidenta",
      "congreso",
      "senado",
      "diputad",
      "ministr",
      "gobierno",
      "eleccion",
      "elección",
      "votación",
      "partido político",
      "milei",
      "asamblea",
      "fiscalía",
      "fiscalia",
    ],
  },
  {
    slug: "internacional",
    keywords: [
      "ucrania",
      "rusia",
      "china",
      "eeuu",
      "estados unidos",
      "europa",
      "onu",
      "biden",
      "guerra",
      "conflicto",
      "gaza",
      "israel",
      "nato",
      "otan",
      "naciones unidas",
    ],
  },
  {
    slug: "economia",
    keywords: [
      "inflación",
      "inflacion",
      "dólar",
      "dolar",
      "bolsa",
      "mercado",
      "empresa",
      "banco",
      "impuesto",
      "pib",
      "recesión",
      "recesion",
    ],
  },
  {
    slug: "tecnologia",
    keywords: [
      "tecnolog",
      "software",
      "ciber",
      "iphone",
      "android",
      "startup",
      "nvidia",
      "microsoft",
      "apple",
      "meta",
      "redes sociales",
    ],
  },
  {
    slug: "cultura",
    keywords: [
      "cine",
      "película",
      "pelicula",
      "serie",
      "música",
      "musica",
      "festival",
      "teatro",
      "libro",
      "actor",
      "actriz",
      "premio",
    ],
  },
  {
    slug: "sociedad",
    keywords: [
      "universidad",
      "escuela",
      "salud",
      "hospital",
      "accidente",
      "crimen",
      "policía",
      "policia",
      "comunidad",
      "familia",
    ],
  },
];

function normalizeText(value: string): string {
  return ` ${value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, " ")} `;
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  return haystack.includes(normalizeText(keyword));
}

function mapRssLabel(label: string): NewsTopicSlug | undefined {
  const key = label.toLowerCase().trim();
  return RSS_LABEL_MAP[key] ?? parseCategorySlug(key);
}

function matchRules(haystack: string, rules: readonly KeywordRule[]): NewsTopicSlug | undefined {
  for (const rule of rules) {
    if (rule.keywords.some((keyword) => matchesKeyword(haystack, keyword))) {
      return rule.slug;
    }
  }
  return undefined;
}

export function classifyArticle(input: ClassifyArticleInput): NewsTopicSlug {
  const haystack = normalizeText(
    [input.title, input.excerpt ?? "", input.bodyExcerpt ?? ""].join(" "),
  );

  const specific = matchRules(haystack, SPECIFIC_RULES);
  if (specific) return specific;

  for (const label of input.rssCategories ?? []) {
    const mapped = mapRssLabel(label);
    if (mapped && mapped !== "general") return mapped;
  }

  const broad = matchRules(haystack, BROAD_RULES);
  if (broad) return broad;

  return "general";
}
