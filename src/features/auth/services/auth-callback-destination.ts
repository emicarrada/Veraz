/** Where Google (and a confirmed email) lands after the code becomes a session. */
export function authCallbackDestination(
  origin: string,
  locale: string,
  onboardingCompletedAt: string | null | undefined,
): string {
  const path = onboardingCompletedAt ? `/${locale}/noticias` : `/${locale}/preferencias`;
  return new URL(path, origin).toString();
}
