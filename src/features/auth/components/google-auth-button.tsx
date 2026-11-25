"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { createAuthBrowserClient } from "@/lib/supabase/auth-browser";
import type { Locale } from "@/i18n/routing";

/**
 * Next erases this key when a Server Component passes it as a prop, so the
 * button rendered nothing under the "o". These two reads are inlined into the
 * client bundle. The anon key is public. The service role never belongs here.
 */
const PUBLIC_SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const PUBLIC_SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export type GoogleAuthButtonProps = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export function GoogleAuthButton({
  supabaseUrl = "",
  supabaseAnonKey = "",
}: GoogleAuthButtonProps) {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = supabaseUrl.trim() || PUBLIC_SUPABASE_URL;
  const anonKey = supabaseAnonKey.trim() || PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  async function signIn() {
    setFailed(false);
    setPending(true);
    const supabase = createAuthBrowserClient(url, anonKey);
    const redirectTo = `${window.location.origin}/auth/callback?locale=${locale}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      className="veraz-focus-ring inline-flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 text-small text-ink hover:bg-surface-muted disabled:opacity-60"
      onClick={() => void signIn()}
      disabled={pending}
      aria-busy={pending}
    >
      <GoogleMark />
      <span>{failed ? t("googleFailed") : pending ? t("opening") : t("google")}</span>
    </button>
  );
}

function GoogleMark() {
  return (
    <svg
      className="h-[18px] w-[18px] max-w-none shrink-0"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
