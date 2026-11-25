import { NextResponse } from "next/server";

import { getReaderPreferences } from "@/features/auth";
import { isLocale } from "@/i18n/routing";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

/** Google returns here. The route stays outside the locale prefix. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = isLocale(url.searchParams.get("locale") ?? "") ? url.searchParams.get("locale")! : "es";
  const code = url.searchParams.get("code");
  const home = new URL(`/${locale}/noticias`, url.origin);

  if (!code) {
    return NextResponse.redirect(home);
  }

  const supabase = await createAuthServerClient();
  if (!supabase) {
    return NextResponse.redirect(home);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(home);
  }

  const { data } = await supabase.auth.getUser();
  const preferences = data.user ? await getReaderPreferences(data.user.id, supabase) : null;
  const destination = preferences?.onboardingCompletedAt
    ? home
    : new URL(`/${locale}/preferencias`, url.origin);

  return NextResponse.redirect(destination);
}
