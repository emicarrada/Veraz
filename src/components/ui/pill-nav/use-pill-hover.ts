"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

import { computePillHoverGeometry } from "@/components/ui/pill-nav/pill-hover-geometry";

const PILL_EASE = "power2.easeOut";

/** Same rising-circle hover as the other pills. Looks for `.pill-label` and `.pill-label-hover` inside the pill. */
export function usePillHover<T extends HTMLElement>() {
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const pillRef = useRef<T | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);
  const layoutRafRef = useRef<number | null>(null);

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

    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      if (layoutRafRef.current !== null) {
        cancelAnimationFrame(layoutRafRef.current);
      }
    };
  }, [scheduleLayout]);

  const onPointerEnter = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!tlRef.current) buildTimeline();
    const tl = tlRef.current;
    if (!tl) return;

    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: PILL_EASE,
      overwrite: "auto",
    });
  };

  const onPointerLeave = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    activeTweenRef.current?.kill();
    activeTweenRef.current = null;

    const tl = tlRef.current;
    if (!tl) return;

    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease: PILL_EASE,
      overwrite: "auto",
    });
  };

  return { pillRef, circleRef, onPointerEnter, onPointerLeave };
}
