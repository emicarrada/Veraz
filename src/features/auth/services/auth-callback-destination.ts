/**
 * Supabase falls back to the site root when the return URL is not on the allow
 * list, and leaves `code` there. Send that request to the callback.
 */
export function authCodeRecoveryPath(pathname: string, code: string | null): string | null {
  if (!code || pathname === "/auth/callback" || pathname.startsWith("/auth/callback/")) {
    return null;
  }
  return "/auth/callback";
}

/** Where Google (and a confirmed email) lands after the code becomes a session. */
export function authCallbackDestination(
  origin: string,
  locale: string,
  onboardingCompletedAt: string | null | undefined,
): string {
  const path = onboardingCompletedAt ? `/${locale}/noticias` : `/${locale}/preferencias`;
  return new URL(path, origin).toString();
}
