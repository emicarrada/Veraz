import { getAppConfig } from "@/config";
import { articleDetailPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowNotifyInput = {
  urls: ReadonlyArray<string>;
  host?: string;
  key?: string;
  keyLocation?: string;
};

export function buildArticleIndexNowUrls(
  siteUrl: string,
  slug: string,
  locales: ReadonlyArray<Locale> = ["es", "en"],
): string[] {
  const base = siteUrl.replace(/\/$/, "");
  return locales.map((locale) => `${base}${articleDetailPath(locale, slug)}`);
}

export async function notifyIndexNow(input: IndexNowNotifyInput): Promise<boolean> {
  const key = input.key ?? process.env.INDEXNOW_KEY?.trim();
  if (!key) return false;

  const { siteUrl } = getAppConfig();
  const host = input.host ?? new URL(siteUrl).host;
  const keyLocation =
    input.keyLocation ?? `${siteUrl.replace(/\/$/, "")}/indexnow-key.txt`;

  if (input.urls.length === 0) return false;

  const unique = [...new Set(input.urls)];
  let ok = true;

  try {
    for (let offset = 0; offset < unique.length; offset += 1000) {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host,
          key,
          keyLocation,
          urlList: unique.slice(offset, offset + 1000),
        }),
      });
      ok = ok && response.ok;
    }
    return ok;
  } catch {
    return false;
  }
}

export function buildDiscoveryIndexNowUrls(siteUrl: string): string[] {
  const base = siteUrl.replace(/\/$/, "");
  return [
    `${base}/es/noticias`,
    `${base}/es`,
    `${base}/llms.txt`,
    `${base}/sitemap-news.xml`,
  ];
}

export async function notifyArticleIndexNow(
  slug: string,
  locales: ReadonlyArray<Locale> = ["es"],
): Promise<boolean> {
  const { siteUrl } = getAppConfig();
  const urls = buildArticleIndexNowUrls(siteUrl, slug, locales);
  return notifyIndexNow({ urls });
}
