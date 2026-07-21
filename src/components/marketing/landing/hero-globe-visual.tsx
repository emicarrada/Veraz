"use client";

import { Globe3D } from "@/components/ui/3d-globe";
import { cn } from "@/utils/cn";

export type HeroGlobeVisualProps = {
  className?: string;
};

export function HeroGlobeVisual({ className }: HeroGlobeVisualProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-none",
        "h-[280px] max-w-[min(100%,320px)] aspect-square",
        "sm:h-[260px] sm:max-w-[320px] sm:aspect-[5/4]",
        "md:h-[320px] md:max-w-none",
        "lg:h-auto lg:min-h-[420px] lg:aspect-square",
        className,
      )}
      role="img"
      aria-label="Globo terráqueo"
    >
      <div className="pointer-events-none absolute inset-0 landing-grid-mask opacity-40" aria-hidden />
      <Globe3D
        className="h-full w-full"
        config={{
          showAtmosphere: true,
          atmosphereColor: "#94a3b8",
          atmosphereIntensity: 0.35,
          atmosphereBlur: 3,
          bumpScale: 5,
          autoRotateSpeed: 0.3,
        }}
      />
    </div>
  );
}
