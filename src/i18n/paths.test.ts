import { describe, expect, it } from "vitest";

import {
  articleDetailPath,
  articleDetailPathname,
  feedPath,
  feedPathname,
  feedPathnameWithQuery,
  feedReturnPathname,
  homePath,
  homePathname,
  stripLocalePrefix,
} from "@/i18n/paths";

describe("i18n paths", () => {
  it("builds locale-prefixed routes for metadata and native anchors", () => {
    expect(homePath("es")).toBe("/es");
    expect(feedPath("en")).toBe("/en/noticias");
    expect(articleDetailPath("es", "foo-bar")).toBe("/es/noticias/foo-bar");
  });

  it("builds internal pathnames without locale prefix", () => {
    expect(homePathname()).toBe("/");
    expect(feedPathname()).toBe("/noticias");
    expect(articleDetailPathname("foo-bar")).toBe("/noticias/foo-bar");
    expect(feedPathnameWithQuery({ categoria: "economia", q: "fed" })).toBe(
      "/noticias?categoria=economia&q=fed",
    );
    expect(feedReturnPathname("tecnologia")).toBe("/noticias?categoria=tecnologia");
  });

  it("strips locale prefix for nav matching", () => {
    expect(stripLocalePrefix("/es/noticias")).toBe("/noticias");
    expect(stripLocalePrefix("/en/noticias/slug")).toBe("/noticias/slug");
    expect(stripLocalePrefix("/es")).toBe("/");
  });

  it("strips only the first locale prefix when duplicated", () => {
    expect(stripLocalePrefix("/en/en/noticias")).toBe("/en/noticias");
  });
});
