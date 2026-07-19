"use client";

import type {
  ElementType,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from "react";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/utils/cn";

import "./scroll-reveal.css";

gsap.registerPlugin(ScrollTrigger);

export type ScrollRevealProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  /** Semantic wrapper — default `div` (use `h2`/`p` as needed). */
  as?: ElementType;
  /** Inner text element — default `p`. */
  textAs?: ElementType;
};

/**
 * Scroll-scrubbed word reveal (React Bits / GSAP ScrollTrigger).
 * Pass a string as children to animate word-by-word.
 */
export function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
  as,
  textAs,
  className,
  ...rest
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const Container = (as ?? "div") as ElementType;
  const TextEl = (textAs ?? "p") as ElementType;

  const splitText = useMemo(() => {
    if (typeof children !== "string") {
      return children;
    }

    return children.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) {
        return <span key={`space-${index}`}>{word}</span>;
      }
      return (
        <span className="word" key={`word-${index}`}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (typeof children !== "string") {
      return;
    }

    const scroller =
      scrollContainerRef?.current != null
        ? scrollContainerRef.current
        : window;

    const triggers: ScrollTrigger[] = [];

    const rotationTween = gsap.fromTo(
      el,
      { transformOrigin: "0% 50%", rotate: baseRotation },
      {
        ease: "none",
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top bottom",
          end: rotationEnd,
          scrub: true,
        },
      },
    );
    if (rotationTween.scrollTrigger) {
      triggers.push(rotationTween.scrollTrigger);
    }

    const wordElements = el.querySelectorAll(".word");
    if (wordElements.length === 0) {
      return () => {
        triggers.forEach((t) => t.kill());
        rotationTween.kill();
      };
    }

    const opacityTween = gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: "opacity" },
      {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top bottom-=20%",
          end: wordAnimationEnd,
          scrub: true,
        },
      },
    );
    if (opacityTween.scrollTrigger) {
      triggers.push(opacityTween.scrollTrigger);
    }

    let blurTween: gsap.core.Tween | null = null;
    if (enableBlur) {
      blurTween = gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: "none",
          filter: "blur(0px)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom-=20%",
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      );
      if (blurTween.scrollTrigger) {
        triggers.push(blurTween.scrollTrigger);
      }
    }

    return () => {
      triggers.forEach((t) => t.kill());
      rotationTween.kill();
      opacityTween.kill();
      blurTween?.kill();
    };
  }, [
    children,
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);

  return (
    <Container
      ref={containerRef}
      className={cn("scroll-reveal", containerClassName, className)}
      {...rest}
    >
      <TextEl className={cn("scroll-reveal-text", textClassName)}>
        {splitText}
      </TextEl>
    </Container>
  );
}
