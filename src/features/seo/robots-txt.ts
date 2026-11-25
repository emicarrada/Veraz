const ANSWER_ENGINE_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
] as const;

const PRIVATE_PATHS = [
  "/api/",
  "/es/entrar",
  "/en/entrar",
  "/es/preferencias",
  "/en/preferencias",
] as const;

/**
 * Search and answer engines may cite Veraz. Model training stays off:
 * the pages are excerpts of other outlets, not a corpus we can license.
 */
export function buildRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const signal = "Content-Signal: search=yes, ai-input=yes, ai-train=no";
  const lines = [
    `# llms: ${base}/llms.txt`,
    "",
    "User-agent: *",
    "Allow: /",
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    signal,
    "",
  ];

  for (const bot of ANSWER_ENGINE_BOTS) {
    lines.push(`User-agent: ${bot}`, "Allow: /", signal, "");
  }

  lines.push(`Host: ${base}`, `Sitemap: ${base}/sitemap.xml`, `Sitemap: ${base}/sitemap-news.xml`, "");
  return lines.join("\n");
}
