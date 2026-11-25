"use client";

import FlexCarousel from "@/features/news/components/flex-carousel";
import type { YesterdayHighlight } from "@/features/news/services/get-yesterday-highlights";
import { useRouter } from "@/i18n/navigation";
import { articleDetailPathname } from "@/i18n/paths";

export function YesterdayCarousel({ items }: { items: YesterdayHighlight[] }) {
  const router = useRouter();

  return (
    <div className="relative h-[640px] w-full text-ink sm:h-[560px]">
      <FlexCarousel
        items={items}
        preset="arch"
        intro="rise"
        fit="natural"
        cardHeight={0.47}
        gap={12}
        radius={0}
        lensWidth={2}
        lensHeight={0.8}
        tilt={0}
        roundness={1}
        bend={0.3}
        reach={0.36}
        curl="rise"
        dispersion={0.4}
        liquid={0}
        followCursor={false}
        squeeze={0.2}
        focusOnClick
        autoplay={false}
        interval={4}
        captions
        captureWheel
        onSelect={(_index, item) => {
          if (!item.slug) return;
          router.push(articleDetailPathname(item.slug));
        }}
      />
    </div>
  );
}
