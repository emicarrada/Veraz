"use client";

import { Globe3D, type GlobeMarker } from "@/components/ui/3d-globe";
import { cn } from "@/utils/cn";

/** News hubs — avatars from /public/fotosGlobo (prestigious source logos). */
const NEWS_HUB_MARKERS: GlobeMarker[] = [
  {
    lat: 40.7128,
    lng: -74.006,
    src: "/fotosGlobo/cnbc.webp",
    label: "CNBC · Nueva York",
  },
  {
    lat: 37.7749,
    lng: -122.4194,
    src: "/fotosGlobo/techcrunch.jpg",
    label: "TechCrunch · San Francisco",
  },
  {
    lat: 40.758,
    lng: -73.9855,
    src: "/fotosGlobo/theverge.webp",
    label: "The Verge · Nueva York",
  },
  {
    lat: 40.4168,
    lng: -3.7038,
    src: "/fotosGlobo/elpais.png",
    label: "El País · Madrid",
  },
  {
    lat: 40.42,
    lng: -3.69,
    src: "/fotosGlobo/expansion.jpg",
    label: "Expansión · Madrid",
  },
  {
    lat: 19.4326,
    lng: -99.1332,
    src: "/fotosGlobo/bloomberg.jpg",
    label: "Bloomberg Línea · Ciudad de México",
  },
  {
    lat: 42.3601,
    lng: -71.0589,
    src: "/fotosGlobo/arstech.jpg",
    label: "Ars Technica · Boston",
  },
];

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
      aria-label="Globo con hubs de noticias globales"
    >
      <div className="pointer-events-none absolute inset-0 landing-grid-mask opacity-40" aria-hidden />
      <Globe3D
        markers={NEWS_HUB_MARKERS}
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
