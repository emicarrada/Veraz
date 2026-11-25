import { afterEach, describe, expect, it, vi } from "vitest";

import { resetTranslateCooldown, translateArticleContent } from "@/lib/ai-engine/translate";

describe("translateArticleContent", () => {
  afterEach(() => {
    resetTranslateCooldown();
    vi.unstubAllGlobals();
  });

  it("returns the Spanish title and excerpt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const query = new URL(String(input)).searchParams.get("q");
        const translated = query === "Apple delays the launch" ? "Apple retrasa el lanzamiento" : "Texto";
        return new Response(JSON.stringify([[[translated, query]]]), { status: 200 });
      }),
    );

    const result = await translateArticleContent({
      locale: "es",
      sourceLocale: "en",
      title: "Apple delays the launch",
      excerpt: "The company confirmed the delay.",
    });

    expect(result?.title).toBe("Apple retrasa el lanzamiento");
    expect(result?.excerpt).toBe("Texto");
  });

  it("returns null when the service fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));

    const result = await translateArticleContent({
      locale: "es",
      sourceLocale: "en",
      title: "Headline",
      excerpt: "Excerpt",
    });

    expect(result).toBeNull();
  });

  it("uses the backup translator when the first service is busy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const href = String(input);
        if (href.includes("translate.googleapis.com")) {
          return new Response("busy", { status: 429 });
        }
        const query = new URL(href).searchParams.get("q");
        return new Response(
          JSON.stringify({
            responseData: { translatedText: query === "Headline" ? "Titular" : "Extracto" },
            quotaFinished: false,
          }),
          { status: 200 },
        );
      }),
    );

    const result = await translateArticleContent({
      locale: "es",
      sourceLocale: "en",
      title: "Headline",
      excerpt: "Excerpt",
    });

    expect(result).toEqual({ title: "Titular", excerpt: "Extracto" });
  });

  it("skips text that is already in the target language", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await translateArticleContent({
      locale: "es",
      sourceLocale: "es",
      title: "Titular",
      excerpt: "Extracto",
    });

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
