import { describe, expect, it } from "vitest";

import { parseReaderOnboarding, parseReaderPreferences } from "@/features/auth/preference-options";

describe("parseReaderPreferences", () => {
  it("keeps known topics and countries", () => {
    const result = parseReaderPreferences({
      countryCodes: ["mx", "US", "ZZ"],
      topicSlugs: ["cultura", "futbol", "tecnologia"],
    });

    expect(result).toEqual({
      ok: true,
      value: { countryCodes: ["MX", "US"], topicSlugs: ["cultura", "tecnologia"] },
    });
  });

  it("asks for a topic and a country", () => {
    expect(parseReaderPreferences({ countryCodes: ["MX"], topicSlugs: [] })).toEqual({
      ok: false,
      error: "topic",
    });
    expect(parseReaderPreferences({ countryCodes: [], topicSlugs: ["cultura"] })).toEqual({
      ok: false,
      error: "country",
    });
  });
});

describe("parseReaderOnboarding", () => {
  const base = {
    firstName: "Ada",
    lastName: "Lovelace",
    sex: "female",
    age: "36",
    emailUpdates: true,
    termsAccepted: true,
    countryCodes: ["mx"],
    topicSlugs: ["cultura"],
  };

  it("keeps the profile and the feed filters", () => {
    expect(parseReaderOnboarding(base)).toEqual({
      ok: true,
      value: {
        firstName: "Ada",
        lastName: "Lovelace",
        sex: "female",
        age: 36,
        emailUpdates: true,
        countryCodes: ["MX"],
        topicSlugs: ["cultura"],
      },
    });
  });

  it("requires a name, an age of at least 16, and the terms", () => {
    expect(parseReaderOnboarding({ ...base, firstName: " " })).toEqual({ ok: false, error: "name" });
    expect(parseReaderOnboarding({ ...base, age: "15" })).toEqual({ ok: false, error: "age" });
    expect(parseReaderOnboarding({ ...base, termsAccepted: false })).toEqual({ ok: false, error: "terms" });
  });
});
