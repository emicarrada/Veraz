import { describe, expect, it } from "vitest";

import { resolveVisitorCountry } from "@/features/news/utils/visitor-country";

function headers(values: Record<string, string>): { get(name: string): string | null } {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

describe("resolveVisitorCountry", () => {
  it("reads the hosting country header before the browser language", () => {
    expect(
      resolveVisitorCountry(
        headers({
          "x-vercel-ip-country": "es",
          "accept-language": "es-MX,es;q=0.9",
        }),
      ),
    ).toBe("ES");
  });

  it("ignores unknown geo codes and uses the language region", () => {
    expect(
      resolveVisitorCountry(
        headers({
          "cf-ipcountry": "XX",
          "accept-language": "es-MX,es;q=0.8,en;q=0.5",
        }),
      ),
    ).toBe("MX");
  });

  it("defaults to Mexico when nothing identifies a country", () => {
    expect(resolveVisitorCountry(headers({ "accept-language": "es,en;q=0.8" }))).toBe("MX");
  });
});
