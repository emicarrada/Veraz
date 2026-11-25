import { renderConfirmationEmail } from "@/features/auth/email/confirmation-email";
import { sendResendEmail } from "@/lib/email/send-resend";
import { createSupabaseAdminClient } from "@/lib/supabase/client";

export type RegisterWithEmailError = "exists" | "password" | "mail" | "unavailable";

export type RegisterWithEmailResult =
  | { ok: true }
  | { ok: false; error: RegisterWithEmailError };

type SignupLink = {
  userId: string;
  hashedToken: string;
  verificationType: string;
};

const CONFIRM_SUBJECT = "Confirma tu correo en Veraz";

function mapLinkError(message: string): RegisterWithEmailError {
  const normalized = message.toLowerCase();
  if (normalized.includes("already") || normalized.includes("registered")) return "exists";
  if (normalized.includes("password")) return "password";
  return "unavailable";
}

async function createSignupLink(
  email: string,
  password: string,
  redirectTo: string,
): Promise<{ ok: true; link: SignupLink } | { ok: false; error: RegisterWithEmailError }> {
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return { ok: false, error: "unavailable" };
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo },
  });

  const hashedToken = data?.properties?.hashed_token;
  const verificationType = data?.properties?.verification_type;
  const userId = data?.user?.id;
  if (error || !hashedToken || !verificationType || !userId) {
    return { ok: false, error: mapLinkError(error?.message ?? "") };
  }

  return {
    ok: true,
    link: { userId, hashedToken, verificationType },
  };
}

/**
 * Creates the account in Supabase and sends the confirmation with Resend.
 * Supabase's own mailer is not used.
 */
export async function registerWithEmail(input: {
  email: string;
  password: string;
  origin: string;
  locale: string;
}): Promise<RegisterWithEmailResult> {
  const redirectTo = `${input.origin}/auth/callback?locale=${input.locale}`;
  const created = await createSignupLink(input.email, input.password, redirectTo);
  if (!created.ok) return created;

  const confirmationUrl = new URL("/auth/callback", input.origin);
  confirmationUrl.searchParams.set("locale", input.locale);
  confirmationUrl.searchParams.set("token_hash", created.link.hashedToken);
  confirmationUrl.searchParams.set("type", created.link.verificationType);

  const sent = await sendResendEmail({
    to: input.email,
    subject: CONFIRM_SUBJECT,
    html: renderConfirmationEmail(confirmationUrl.toString()),
  });

  if (sent.ok) return { ok: true };

  try {
    await createSupabaseAdminClient().auth.admin.deleteUser(created.link.userId);
  } catch {
    // The confirmation did not go out. A later attempt reports that the email exists.
  }

  return { ok: false, error: "mail" };
}
