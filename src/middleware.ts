import createIntlMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseConfig } from "@/config/accessors";
import { dedupeLocalePrefix } from "@/i18n/dedupe-locale-prefix";
import { routing } from "@/i18n/routing";

const CRON_PREFIX = "/api/cron/";
const ALLOWED_CRON_METHODS = new Set(["GET", "POST"]);
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(CRON_PREFIX)) {
    if (!ALLOWED_CRON_METHODS.has(request.method)) {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const userAgent = request.headers.get("user-agent")?.trim();
    if (!userAgent) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/hero-image")) {
    return NextResponse.next();
  }

  const dedupedPath = dedupeLocalePrefix(pathname);
  if (dedupedPath) {
    const url = request.nextUrl.clone();
    url.pathname = dedupedPath;
    return NextResponse.redirect(url, 308);
  }

  const intlResponse = intlMiddleware(request);
  const { url, anonKey } = getSupabaseConfig();
  if (!url.trim() || !anonKey.trim()) {
    return intlResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          intlResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch {
    return intlResponse;
  }
  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
