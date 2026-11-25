import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";
import { signInWithPasswordAction, signUpWithPasswordAction } from "@/features/auth/actions";
import { GoogleAuthButton, getAuthSession, getReaderPreferences } from "@/features/auth";
import { NewsAppShell } from "@/features/news";
import type { Locale } from "@/i18n/routing";

type EntrarPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

export async function generateMetadata({ params }: EntrarPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle"), robots: { index: false, follow: false } };
}

export default async function EntrarPage({ params, searchParams }: EntrarPageProps) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  const query = await searchParams;
  const t = await getTranslations("auth");
  const session = await getAuthSession();

  if (session) {
    const preferences = await getReaderPreferences(session.userId);
    redirect(preferences?.onboardingCompletedAt ? `/${resolvedLocale}/noticias` : `/${resolvedLocale}/preferencias`);
  }

  const errorCopy: Record<string, string> = {
    email: t("emailError"),
    password: t("passwordError"),
    credentials: t("credentialsError"),
    exists: t("existsError"),
    unavailable: t("unavailable"),
  };

  return (
    <NewsAppShell>
      <Section padding="md" containerSize="md">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
          <div>
            <h1 className="text-h1">{t("signInTitle")}</h1>
            <p className="mt-2 text-small text-ink-muted">{t("signInLead")}</p>
          </div>

          <form className="flex flex-col gap-4">
            <Input label={t("email")} name="email" type="email" autoComplete="email" required />
            <Input
              label={t("password")}
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
            <input type="hidden" name="locale" value={resolvedLocale} />
            {query.status === "confirm" ? <p className="text-small text-ink-muted">{t("confirmEmail")}</p> : null}
            {query.error && errorCopy[query.error] ? (
              <p className="text-small text-danger">{errorCopy[query.error]}</p>
            ) : null}
            <button
              type="submit"
              formAction={signInWithPasswordAction}
              className="veraz-focus-ring h-10 rounded-md bg-accent px-4 text-small text-accent-foreground"
            >
              {t("signIn")}
            </button>
            <button
              type="submit"
              formAction={signUpWithPasswordAction}
              className="veraz-focus-ring h-10 rounded-md border border-border bg-surface px-4 text-small text-ink"
            >
              {t("createAccount")}
            </button>
          </form>

          <p className="text-center text-caption text-ink-muted">{t("or")}</p>
          <GoogleAuthButton />
        </div>
      </Section>
    </NewsAppShell>
  );
}
