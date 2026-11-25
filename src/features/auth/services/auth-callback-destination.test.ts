import { describe, expect, it } from "vitest";

import {
  authCallbackDestination,
  authCodeRecoveryPath,
} from "@/features/auth/services/auth-callback-destination";

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

describe("authCodeRecoveryPath", () => {
  it("sends a code left on the site root to the callback", () => {
    expect(authCodeRecoveryPath("/es", "abc")).toBe("/auth/callback");
  });

  it("leaves the callback itself alone", () => {
    expect(authCodeRecoveryPath("/auth/callback", "abc")).toBeNull();
    expect(authCodeRecoveryPath("/es", null)).toBeNull();
  });
});
