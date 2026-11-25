const GEO_HEADER_NAMES = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
] as const;

/** Product default when the network and the browser give no country. */
export const DEFAULT_VISITOR_COUNTRY = "MX";

export type HeaderLookup = {
  get(name: string): string | null;
};

export function resolveVisitorCountry(headerList: HeaderLookup): string {
  for (const name of GEO_HEADER_NAMES) {
    const code = normalizeCountry(headerList.get(name));
    if (code) return code;
  }

  return countryFromAcceptLanguage(headerList.get("accept-language")) ?? DEFAULT_VISITOR_COUNTRY;
}

function normalizeCountry(value: string | null): string | null {
  const code = value?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{2}$/.test(code)) return null;
  if (code === "XX" || code === "T1") return null;
  return code;
}

function countryFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null;

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim() ?? "";
    const match = tag.match(/^[a-z]{2}-([a-z]{2})$/i);
    if (match?.[1]) return match[1].toUpperCase();
  }

  return null;
}
