import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { authCallbackDestination, getReaderPreferences } from "@/features/auth";
import { isLocale } from "@/i18n/routing";
import { getSupabaseConfig } from "@/config/accessors";
import type { Database } from "@/lib/supabase/database.types";

type PendingCookie = { name: string; value: string; options: CookieOptions };

const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value != null && EMAIL_OTP_TYPES.has(value as EmailOtpType);
}

/** Google and the confirmation link return here. The route stays outside the locale prefix. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const queryLocale = url.searchParams.get("locale") ?? "";
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value ?? "";
  const locale = isLocale(queryLocale) ? queryLocale : isLocale(cookieLocale) ? cookieLocale : "es";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const otpType = url.searchParams.get("type");
  const home = new URL(`/${locale}/noticias`, url.origin);

  if (!code && !(tokenHash && isEmailOtpType(otpType))) {
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

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash ?? "",
        type: otpType as EmailOtpType,
      });
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
