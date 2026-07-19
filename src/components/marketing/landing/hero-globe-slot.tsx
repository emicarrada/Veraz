"use client";

import dynamic from "next/dynamic";

import { cn } from "@/utils/cn";

const globePlaceholderClassName = cn(
  "relative mx-auto w-full rounded-none bg-surface-muted",
  "h-[280px] max-w-[min(100%,320px)] aspect-square",
  "sm:h-[260px] sm:max-w-[320px] sm:aspect-[5/4]",
  "md:h-[320px] md:max-w-none",
  "lg:h-auto lg:min-h-[420px] lg:aspect-square",
);

function HeroGlobePlaceholder() {
  return (
    <div
      className={cn(globePlaceholderClassName, "animate-pulse")}
      aria-hidden
    />
  );
}

const HeroGlobeVisual = dynamic(
  () =>
    import("@/components/marketing/landing/hero-globe-visual")
      .then((module) => module.HeroGlobeVisual)
      .catch(() => HeroGlobePlaceholder),
  {
    ssr: false,
    loading: () => <HeroGlobePlaceholder />,
  },
);

export function HeroGlobeSlot() {
  return <HeroGlobeVisual />;
}
