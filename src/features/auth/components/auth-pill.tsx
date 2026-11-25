"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";

import { signOutAction } from "@/features/auth/actions";
import { usePillHover } from "@/components/ui/pill-nav/use-pill-hover";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export type AuthPillProps = {
  accountLabel: string | null;
};

function initialFromLabel(label: string): string {
  const trimmed = label.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "?";
}

export function AuthPill({ accountLabel }: AuthPillProps) {
  if (!accountLabel) return <SignedOutPill />;
  return <SignedInPill accountLabel={accountLabel} />;
}

function SignedOutPill() {
  const t = useTranslations("auth");
  const hover = usePillHover<HTMLAnchorElement>();

  return (
    <Link
      href="/entrar"
      ref={hover.pillRef}
      className="pill account-pill veraz-focus-ring"
      aria-label={t("accountEntryAria")}
      onPointerEnter={hover.onPointerEnter}
      onPointerLeave={hover.onPointerLeave}
    >
      <PillFace circleRef={hover.circleRef}>
        <UserIcon />
      </PillFace>
    </Link>
  );
}

function SignedInPill({ accountLabel }: { accountLabel: string }) {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const hover = usePillHover<HTMLButtonElement>();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function closeIfOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative h-full" onPointerLeave={() => setOpen(false)}>
      <button
        type="button"
        ref={hover.pillRef}
        className="pill account-pill veraz-focus-ring"
        aria-label={t("accountAria", { name: accountLabel })}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        onPointerEnter={hover.onPointerEnter}
        onPointerLeave={hover.onPointerLeave}
      >
        <PillFace circleRef={hover.circleRef}>{initialFromLabel(accountLabel)}</PillFace>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="w-44 rounded-xl border border-border bg-surface p-1 shadow-md" role="menu">
            <Link
              href="/preferencias"
              role="menuitem"
              className="veraz-focus-ring block rounded-lg px-3 py-2 text-small text-ink hover:bg-surface-muted"
              onClick={() => setOpen(false)}
            >
              {t("preferences")}
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                role="menuitem"
                className="veraz-focus-ring w-full rounded-lg px-3 py-2 text-left text-small text-ink hover:bg-surface-muted"
              >
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PillFace({
  circleRef,
  children,
}: {
  circleRef: RefObject<HTMLSpanElement | null>;
  children: ReactNode;
}) {
  return (
    <>
      <span className="hover-circle" aria-hidden ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">{children}</span>
        <span className="pill-label-hover" aria-hidden>
          {children}
        </span>
      </span>
    </>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
      <circle cx="10" cy="6.75" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.6 16.2c.7-2.35 2.55-3.45 5.4-3.45s4.7 1.1 5.4 3.45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
