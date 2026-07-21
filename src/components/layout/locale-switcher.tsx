"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";

import { usePathname, useRouter } from "@/i18n/navigation";
import { computePillHoverGeometry } from "@/components/ui/pill-nav/pill-hover-geometry";
import { cn } from "@/utils/cn";
import type { Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, "localeEs" | "localeEn"> = {
  es: "localeEs",
  en: "localeEn",
};

const PILL_EASE = "power2.easeOut";

function otherLocale(current: Locale): Locale {
  return current === "es" ? "en" : "es";
}

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const circleRef = useRef<HTMLSpanElement | null>(null);
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);
  const layoutRafRef = useRef<number | null>(null);

  const currentLabel = locale.toUpperCase();
  const nextLabel = otherLocale(locale).toUpperCase();

  const buildTimeline = useCallback(() => {
    const circle = circleRef.current;
    const pill = pillRef.current;
    if (!circle || !pill) return;

    const rect = pill.getBoundingClientRect();
    const { width: w, height: h } = rect;
    if (w === 0 || h === 0) return;

    const { diameter, delta, originY, targetScale } = computePillHoverGeometry(w, h);

    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.bottom = `-${delta}px`;

    gsap.set(circle, {
      xPercent: -50,
      scale: 0,
      transformOrigin: `50% ${originY}px`,
    });

    const label = pill.querySelector<HTMLElement>(".pill-label");
    const hover = pill.querySelector<HTMLElement>(".pill-label-hover");

    if (label) gsap.set(label, { y: 0 });
    if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

    activeTweenRef.current?.kill();
    activeTweenRef.current = null;
    tlRef.current?.kill();

    const tl = gsap.timeline({ paused: true });

    tl.to(
      circle,
      { scale: targetScale, xPercent: -50, duration: 2, ease: PILL_EASE, overwrite: "auto" },
      0,
    );

    if (label) {
      tl.to(label, { y: -(h + 8), duration: 2, ease: PILL_EASE, overwrite: "auto" }, 0);
    }

    if (hover) {
      gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
      tl.to(hover, { y: 0, opacity: 1, duration: 2, ease: PILL_EASE, overwrite: "auto" }, 0);
    }

    tlRef.current = tl;
  }, []);

  const scheduleLayout = useCallback(() => {
    if (layoutRafRef.current !== null) {
      cancelAnimationFrame(layoutRafRef.current);
    }

    layoutRafRef.current = requestAnimationFrame(() => {
      layoutRafRef.current = requestAnimationFrame(() => {
        layoutRafRef.current = null;
        buildTimeline();
      });
    });
  }, [buildTimeline]);

  useEffect(() => {
    scheduleLayout();

    const onResize = () => scheduleLayout();
    window.addEventListener("resize", onResize);

    const pill = pillRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined" && pill) {
      resizeObserver = new ResizeObserver(() => scheduleLayout());
      resizeObserver.observe(pill);
    }

    if (document.fonts?.ready) {
      void document.fonts.ready.then(scheduleLayout).catch(() => undefined);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      if (layoutRafRef.current !== null) {
        cancelAnimationFrame(layoutRafRef.current);
      }
    };
  }, [scheduleLayout]);

  useEffect(() => {
    scheduleLayout();
  }, [locale, scheduleLayout]);

  const resetHover = useCallback((immediate = true) => {
    activeTweenRef.current?.kill();
    activeTweenRef.current = null;

    const tl = tlRef.current;
    if (!tl) return;

    if (immediate) {
      tl.pause(0);
      return;
    }

    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease: PILL_EASE,
      overwrite: "auto",
    });
  }, []);

  const handleEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!tlRef.current) {
      buildTimeline();
    }

    const tl = tlRef.current;
    if (!tl) return;

    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: PILL_EASE,
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    resetHover(false);
  };

  const handleToggle = () => {
    const next = otherLocale(locale);
    if (next === locale) return;

    router.replace(pathname, { locale: next });

    if (typeof window !== "undefined" && "posthog" in window) {
      const posthog = (window as Window & { posthog?: { capture: (e: string, p?: object) => void } })
        .posthog;
      posthog?.capture("locale_changed", { from: locale, to: next });
    }
  };

  return (
    <button
      ref={pillRef}
      type="button"
      className={cn("pill locale-toggle-pill veraz-focus-ring")}
      role="group"
      aria-label={t("localeSwitchAria", { locale: t(LOCALE_LABELS[locale]) })}
      aria-live="polite"
      onClick={handleToggle}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <span className="hover-circle" aria-hidden ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">{currentLabel}</span>
        <span className="pill-label-hover" aria-hidden>
          {nextLabel}
        </span>
      </span>
    </button>
  );
}
