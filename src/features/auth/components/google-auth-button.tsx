import { getLocale, getTranslations } from "next-intl/server";

import { GoogleSignInControl } from "@/features/auth/components/google-sign-in-control";

/**
 * The anon key stays on the server. This button only receives the Google URL
 * after the server has stored the sign-in cookie.
 */
export async function GoogleAuthButton() {
  const t = await getTranslations("auth");
  const locale = await getLocale();

  return <GoogleSignInControl locale={locale} label={t("google")} />;
}
