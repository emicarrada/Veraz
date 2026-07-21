import { getTranslations } from "next-intl/server";

import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

export async function LandingWhatIsSection() {
  const t = await getTranslations("landing.whatIs");

  return (
    <Section
      id="que-es-veraz"
      padding="lg"
      aria-labelledby="que-es-heading"
      className="landing-section border-t border-border"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <LandingSectionHeader
            id="que-es-heading"
            eyebrow={t("eyebrow")}
            title={t("title")}
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-7 lg:pt-10">
          <Text as="p" variant="body-lg" className="text-ink-secondary">
            {t("p1")}
          </Text>
          <Text as="p" variant="body" className="text-ink-muted">
            {t("p2")}
          </Text>
        </div>
      </div>
    </Section>
  );
}
