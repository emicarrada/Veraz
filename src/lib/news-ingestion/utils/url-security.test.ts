import { describe, expect, it } from "vitest";

import {
  countHtmlTags,
  isPublicHttpUrl,
} from "@/lib/news-ingestion/utils/url-security";

describe("isPublicHttpUrl", () => {
  it("allows public https URLs", () => {
    expect(isPublicHttpUrl("https://example.com/path")).toBe(true);
  });

  it("blocks localhost", () => {
    expect(isPublicHttpUrl("http://localhost/admin")).toBe(false);
  });

  it("blocks private IPv4 ranges", () => {
    expect(isPublicHttpUrl("http://192.168.1.1/file")).toBe(false);
    expect(isPublicHttpUrl("http://10.0.0.5/file")).toBe(false);
  });

  it("blocks non-http schemes", () => {
    expect(isPublicHttpUrl("ftp://example.com/file")).toBe(false);
  });
});

describe("countHtmlTags", () => {
  it("counts tags in text", () => {
    expect(countHtmlTags("<p>a</p><span>b</span>")).toBe(4);
  });
});
