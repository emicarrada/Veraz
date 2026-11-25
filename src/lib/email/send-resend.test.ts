import { afterEach, describe, expect, it } from "vitest";

import { ENV_KEYS, resetEnvSnapshot } from "@/config/env";
import { sendResendEmail } from "@/lib/email/send-resend";

describe("sendResendEmail", () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.RESEND_FROM;
    else process.env.RESEND_FROM = originalFrom;
    resetEnvSnapshot();
  });

  it("does not call Resend when the API key is missing", async () => {
    delete process.env[ENV_KEYS.RESEND_API_KEY];
    resetEnvSnapshot();
    const fetchImpl = async () => {
      throw new Error("should not send");
    };

    const result = await sendResendEmail(
      { to: "reader@example.com", subject: "Hola", html: "<p>Hola</p>" },
      fetchImpl,
    );

    expect(result.ok).toBe(false);
  });

  it("posts the message the same way the Resend CLI does", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "Veraz <noreply@veraz.app>";
    resetEnvSnapshot();
    let body = "";
    let authorization = "";
    const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
      authorization = String(init?.headers && (init.headers as Record<string, string>).Authorization);
      body = String(init?.body);
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    };

    const result = await sendResendEmail(
      { to: "reader@example.com", subject: "Confirma tu correo en Veraz", html: "<p>enlace</p>" },
      fetchImpl,
    );

    expect(result.ok).toBe(true);
    expect(authorization).toBe("Bearer re_test_key");
    expect(JSON.parse(body)).toMatchObject({
      from: "Veraz <noreply@veraz.app>",
      to: ["reader@example.com"],
      subject: "Confirma tu correo en Veraz",
    });
  });
});
