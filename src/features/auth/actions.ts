"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { SupabaseClient } from "@supabase/supabase-js";

import { registerWithEmail } from "@/features/auth/services/register-with-email";
import { getReaderPreferences, saveReaderPreferences } from "@/features/auth/services/reader-preferences";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import type { Database } from "@/lib/supabase/database.types";
import { isLocale, type Locale } from "@/i18n/routing";

function localeFrom(formData: FormData): Locale {
  const localeValue = String(formData.get("locale") ?? "es");
  return isLocale(localeValue) ? localeValue : "es";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function siteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "http://localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function redirectAfterSession(
  userId: string,
  locale: Locale,
  client: SupabaseClient<Database>,
): Promise<void> {
  const preferences = await getReaderPreferences(userId, client);
  redirect(preferences?.onboardingCompletedAt ? `/${locale}/noticias` : `/${locale}/preferencias`);
}

export async function savePreferencesAction(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const result = await saveReaderPreferences({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    sex: String(formData.get("sex") ?? ""),
    age: String(formData.get("age") ?? ""),
    emailUpdates: formData.get("emailUpdates") === "yes",
    termsAccepted: formData.get("terms") === "yes",
    countryCodes: formData.getAll("country").map(String),
    topicSlugs: formData.getAll("topic").map(String),
  });

  if (!result.ok) {
    redirect(`/${locale}/preferencias?error=${result.error}`);
  }

  redirect(`/${locale}/noticias`);
}

export async function signInWithPasswordAction(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isEmail(email)) redirect(`/${locale}/entrar?error=email`);
  if (password.length < 8) redirect(`/${locale}/entrar?error=password`);

  const supabase = await createAuthServerClient();
  if (!supabase) redirect(`/${locale}/entrar?error=unavailable`);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect(`/${locale}/entrar?error=credentials`);

  await redirectAfterSession(data.user.id, locale, supabase);
}

export async function signUpWithPasswordAction(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isEmail(email)) redirect(`/${locale}/entrar?error=email`);
  if (password.length < 8) redirect(`/${locale}/entrar?error=password`);

  const origin = await siteOrigin();
  const result = await registerWithEmail({ email, password, origin, locale });
  if (!result.ok) redirect(`/${locale}/entrar?error=${result.error}`);
  redirect(`/${locale}/entrar?status=confirm`);
}

/**
 * Builds the Google URL and stores the PKCE verifier in the response cookies.
 * The browser must navigate only after this returns, so the verifier is saved
 * before Google sends the reader back.
 */
export async function beginGoogleSignIn(
  localeValue: string,
): Promise<{ ok: true; url: string } | { ok: false }> {
  const locale = isLocale(localeValue) ? localeValue : "es";
  const supabase = await createAuthServerClient();
  if (!supabase) return { ok: false };

  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?locale=${locale}`,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) return { ok: false };
  return { ok: true, url: data.url };
}

export async function signOutAction(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const supabase = await createAuthServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect(`/${locale}/noticias`);
}
