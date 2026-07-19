import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const options = { limit: 2, windowMs: 60_000 };
    expect(checkRateLimit("test-key", options).allowed).toBe(true);
    expect(checkRateLimit("test-key", options).allowed).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const options = { limit: 2, windowMs: 60_000 };
    checkRateLimit("block-key", options);
    checkRateLimit("block-key", options);
    expect(checkRateLimit("block-key", options).allowed).toBe(false);
  });
});
