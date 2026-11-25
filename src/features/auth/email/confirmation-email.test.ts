import { describe, expect, it } from "vitest";

import { renderConfirmationEmail } from "@/features/auth/email/confirmation-email";

describe("renderConfirmationEmail", () => {
  it("puts the confirmation link in the template and escapes it", () => {
    const html = renderConfirmationEmail(
      "https://www.veraz.app/auth/callback?locale=es&token_hash=abc&type=signup",
      '<a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a>',
    );

    expect(html).toBe(
      '<a href="https://www.veraz.app/auth/callback?locale=es&amp;token_hash=abc&amp;type=signup">https://www.veraz.app/auth/callback?locale=es&amp;token_hash=abc&amp;type=signup</a>',
    );
  });
});
