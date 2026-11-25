import { describe, expect, it } from "vitest";

import { authCallbackDestination } from "@/features/auth/services/auth-callback-destination";

describe("authCallbackDestination", () => {
  it("sends a first Google sign-in to onboarding", () => {
    expect(authCallbackDestination("https://www.veraz.app", "es", null)).toBe(
      "https://www.veraz.app/es/preferencias",
    );
  });

  it("sends a reader who already finished the form to the feed", () => {
    expect(
      authCallbackDestination("https://www.veraz.app", "es", "2026-11-25T00:00:00.000Z"),
    ).toBe("https://www.veraz.app/es/noticias");
  });
});
