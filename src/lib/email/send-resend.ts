import { ENV_KEYS, getEnv } from "@/config/env";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Veraz <noreply@veraz.app>";

export type SendResendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends one message through the Resend HTTP API.
 * This is the same call as `resend emails send`.
 */
export async function sendResendEmail(
  input: SendResendEmailInput,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true } | { ok: false }> {
  const apiKey = getEnv(ENV_KEYS.RESEND_API_KEY);
  if (!apiKey) return { ok: false };

  const from = getEnv(ENV_KEYS.RESEND_FROM) ?? DEFAULT_FROM;
  const response = await fetchImpl(RESEND_EMAILS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  return response.ok ? { ok: true } : { ok: false };
}
