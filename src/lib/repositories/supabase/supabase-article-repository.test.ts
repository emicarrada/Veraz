import { describe, expect, it } from "vitest";

import { resolveLanguageCode } from "@/lib/repositories/supabase/supabase-article-repository";

describe("resolveLanguageCode", () => {
  it("returns joined language code when present", () => {
    expect(resolveLanguageCode({ languages: { code: "en" } })).toBe("en");
    expect(resolveLanguageCode({ languages: { code: "en-US" } })).toBe("en");
  });

  it("falls back to es when languages join is missing (fail-open)", () => {
    expect(resolveLanguageCode({ languages: null })).toBe("es");
    expect(resolveLanguageCode({})).toBe("es");
  });
});
