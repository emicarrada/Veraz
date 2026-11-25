import { readFileSync } from "node:fs";
import { join } from "node:path";

const PLACEHOLDER = "{{ .ConfirmationURL }}";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Fills emails/confirm-signup.html with the reader's confirmation link. */
export function renderConfirmationEmail(confirmationUrl: string, template?: string): string {
  const source =
    template ??
    readFileSync(join(process.cwd(), "emails/confirm-signup.html"), "utf8");
  return source.replaceAll(PLACEHOLDER, escapeHtml(confirmationUrl));
}
