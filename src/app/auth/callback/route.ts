import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { authCallbackDestination, getReaderPreferences } from "@/features/auth";
import { isLocale } from "@/i18n/routing";
import { getSupabaseConfig } from "@/config/accessors";
import type { Database } from "@/lib/supabase/database.types";

type PendingCookie = { name: string; value: string; options: CookieOptions };

/** Google and the confirmation link return here. The route stays outside the locale prefix. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const locale = isLocale(url.searchParams.get("locale") ?? "") ? url.searchParams.get("locale")! : "es";
  const code = url.searchParams.get("code");
  const home = new URL(`/${locale}/noticias`, url.origin);

  if (!code) {
    return NextResponse.redirect(home);
  }

  const { url: supabaseUrl, anonKey } = getSupabaseConfig();
  if (!supabaseUrl.trim() || !anonKey.trim()) {
    return NextResponse.redirect(home);
  }

  const pending: PendingCookie[] = [];
  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: PendingCookie[]) {
        pending.push(...cookiesToSet);
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(home);
  }

  const { data } = await supabase.auth.getUser();
  const preferences = data.user ? await getReaderPreferences(data.user.id, supabase) : null;
  const destination = authCallbackDestination(
    url.origin,
    locale,
    preferences?.onboardingCompletedAt,
  );
  const response = NextResponse.redirect(destination);
  for (const cookie of pending) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
