import { getTranslations } from "next-intl/server";

import { NewsRing } from "@/components/marketing/landing/news-ring";
import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Container } from "@/components/ui/container";
import type { LandingPhotoRingItem } from "@/features/news/services/get-landing-photo-ring";

export async function LandingNewsRingSection({ items }: { items: LandingPhotoRingItem[] }) {
  if (items.length < 3) return null;

  const t = await getTranslations("landing.ring");

  return (
    <section aria-labelledby="landing-ring-heading" className="landing-section border-t border-border py-16 sm:py-20">
      <Container>
        <LandingSectionHeader
          id="landing-ring-heading"
          align="center"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
      </Container>
      <div className="mt-8">
        <NewsRing items={items} />
      </div>
    </section>
  );
}
