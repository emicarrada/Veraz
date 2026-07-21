"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { Link as IntlLink } from "@/i18n/navigation";
import { gsap } from "gsap";

import { computePillHoverGeometry } from "@/components/ui/pill-nav/pill-hover-geometry";
import { cn } from "@/utils/cn";

import "./pill-nav.css";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export type PillNavProps = {
  logo: string;
  logoAlt?: string;
  /** App route for the logo link (defaults to first item href or `/`). */
  logoHref?: string;
  /** Invert logo mark for dark base circles (black logo → light). */
  invertLogo?: boolean;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  /** Fill color for the hover ripple animation on pills. */
  hoveredPillFillColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
  /** Optional slot rendered to the right of the pill group (e.g. locale switcher). */
  trailing?: ReactNode;
  navAriaLabel?: string;
  homeAriaLabel?: string;
};

function isExternalOrHashLink(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  );
}

function isAppRouterLink(href: string): boolean {
  return Boolean(href) && !isExternalOrHashLink(href);
}

/**
 * Pill navigation — same layout on mobile and desktop (logo + items, centered).
 */
export function PillNav({
  logo,
  logoAlt = "Logo",
  logoHref,
  invertLogo = false,
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#000000",
  pillColor = "#ffffff",
  hoveredPillTextColor = "#111111",
  hoveredPillFillColor = "#ffffff",
  pillTextColor,
  initialLoadAnimation = true,
  trailing,
  navAriaLabel = "Principal",
  homeAriaLabel = "Inicio",
}: PillNavProps) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const navCenterRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const layoutRafRef = useRef<number | null>(null);

  const buildPillTimeline = useCallback(
    (index: number) => {
      const circle = circleRefs.current[index];
      const pill = circle?.parentElement;
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
      const white = pill.querySelector<HTMLElement>(".pill-label-hover");

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });

      activeTweenRefs.current[index]?.kill();
      activeTweenRefs.current[index] = null;
      tlRefs.current[index]?.kill();

      const tl = gsap.timeline({ paused: true });

      tl.to(
        circle,
        { scale: targetScale, xPercent: -50, duration: 2, ease, overwrite: "auto" },
        0,
      );

      if (label) {
        tl.to(
          label,
          { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
          0,
        );
      }

      if (white) {
        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(
          white,
          { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
          0,
        );
      }

      tlRefs.current[index] = tl;
    },
    [ease],
  );

  const layoutAllPills = useCallback(() => {
    items.forEach((_, index) => {
      buildPillTimeline(index);
    });
  }, [buildPillTimeline, items]);

  const scheduleLayout = useCallback(() => {
    if (layoutRafRef.current !== null) {
      cancelAnimationFrame(layoutRafRef.current);
    }

    layoutRafRef.current = requestAnimationFrame(() => {
      layoutRafRef.current = requestAnimationFrame(() => {
        layoutRafRef.current = null;
        layoutAllPills();
      });
    });
  }, [layoutAllPills]);

  const resetPillHoverState = useCallback(
    (index: number, immediate = true) => {
      activeTweenRefs.current[index]?.kill();
      activeTweenRefs.current[index] = null;

      const tl = tlRefs.current[index];
      if (!tl) return;

      if (immediate) {
        tl.pause(0);
        return;
      }

      activeTweenRefs.current[index] = tl.tweenTo(0, {
        duration: 0.2,
        ease,
        overwrite: "auto",
      });
    },
    [ease],
  );

  const resetInactivePills = useCallback(() => {
    items.forEach((item, index) => {
      if (activeHref === item.href) return;
      resetPillHoverState(index);
    });
  }, [activeHref, items, resetPillHoverState]);

  useEffect(() => {
    scheduleLayout();

    const onResize = () => scheduleLayout();
    window.addEventListener("resize", onResize);

    const navItems = navItemsRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined" && navItems) {
      resizeObserver = new ResizeObserver(() => scheduleLayout());
      resizeObserver.observe(navItems);
    }

    if (document.fonts?.ready) {
      void document.fonts.ready.then(scheduleLayout).catch(() => undefined);
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navCenter = navCenterRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navCenter) {
        gsap.set(navCenter, { width: 0, overflow: "hidden" });
        gsap.to(navCenter, {
          width: "auto",
          duration: 0.6,
          ease,
          onComplete: () => {
            gsap.set(navCenter, { clearProps: "width,overflow" });
            scheduleLayout();
          },
        });
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      if (layoutRafRef.current !== null) {
        cancelAnimationFrame(layoutRafRef.current);
      }
    };
  }, [ease, initialLoadAnimation, scheduleLayout]);

  useEffect(() => {
    scheduleLayout();
    resetInactivePills();
  }, [activeHref, resetInactivePills, scheduleLayout]);

  const handleEnter = (i: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (activeHref === items[i]?.href) return;

    const tl = tlRefs.current[i];
    if (!tl) {
      buildPillTimeline(i);
    }

    const resolvedTimeline = tlRefs.current[i];
    if (!resolvedTimeline) return;

    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = resolvedTimeline.tweenTo(
      resolvedTimeline.duration(),
      {
        duration: 0.3,
        ease,
        overwrite: "auto",
      },
    );
  };

  const handleLeave = (i: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (activeHref === items[i]?.href) return;
    resetPillHoverState(i, false);
  };

  const handleLogoEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--hover-fill": hoveredPillFillColor,
    "--pill-text": resolvedPillTextColor,
  } as CSSProperties;

  const homeHref = logoHref ?? items[0]?.href ?? "/";

  const renderLogo = (): ReactNode => {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={logoAlt}
        ref={logoImgRef}
        className={invertLogo ? "pill-logo-invert" : undefined}
      />
    );

    if (isAppRouterLink(homeHref)) {
      return (
        <IntlLink
          className="pill-logo"
          href={homeHref}
          aria-label={homeAriaLabel}
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          {img}
        </IntlLink>
      );
    }

    return (
      <a
        className="pill-logo"
        href={homeHref}
        aria-label="Inicio"
        onMouseEnter={handleLogoEnter}
        ref={logoRef}
      >
        {img}
      </a>
    );
  };

  const renderItem = (item: PillNavItem, i: number) => {
    const isActive = activeHref === item.href;
    const classNamePill = cn("pill", isActive && "is-active");

    const content = (
      <>
        <span
          className="hover-circle"
          aria-hidden
          ref={(el) => {
            circleRefs.current[i] = el;
          }}
        />
        <span className="label-stack">
          <span className="pill-label">{item.label}</span>
          <span className="pill-label-hover" aria-hidden>
            {item.label}
          </span>
        </span>
      </>
    );

    const sharedProps = {
      className: classNamePill,
      "aria-label": item.ariaLabel || item.label,
      ...(isActive ? { "aria-current": "page" as const } : {}),
      onPointerEnter: () => handleEnter(i),
      onPointerLeave: () => handleLeave(i),
    };

    if (isAppRouterLink(item.href)) {
      return (
        <IntlLink role="menuitem" href={item.href} {...sharedProps}>
          {content}
        </IntlLink>
      );
    }

    return (
      <a role="menuitem" href={item.href} {...sharedProps}>
        {content}
      </a>
    );
  };

  return (
    <div className="pill-nav-container">
      <nav
        className={cn("pill-nav", className)}
        aria-label={navAriaLabel}
        style={cssVars}
      >
        <div className="pill-nav-center" ref={navCenterRef}>
          {renderLogo()}

          <div className="pill-nav-items" ref={navItemsRef}>
            <ul className="pill-list" role="menubar">
              {items.map((item, i) => (
                <li key={item.href || `item-${i}`} role="none">
                  {renderItem(item, i)}
                </li>
              ))}
            </ul>
            {trailing ? <div className="pill-nav-trailing">{trailing}</div> : null}
          </div>
        </div>
      </nav>
    </div>
  );
}
