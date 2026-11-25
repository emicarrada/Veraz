"use client";

import CircularCarousel from "@/components/marketing/landing/circular-carousel";
import { useRouter } from "@/i18n/navigation";
import { articleDetailPathname } from "@/i18n/paths";

type RingItem = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  slug: string;
};

export function NewsRing({ items }: { items: RingItem[] }) {
  const router = useRouter();

  return (
    <div className="relative h-[560px] w-full text-ink">
      <CircularCarousel
        items={items}
        preset="cylinder"
        intro="rise"
        cardWidth={220}
        aspectRatio={1}
        speed={14}
        captions
        fadeColor="#0a0a0a"
        onItemClick={(item) => {
          if (!item.slug) return;
          router.push(articleDetailPathname(item.slug));
        }}
      />
    </div>
  );
}
