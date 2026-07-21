import { getTranslations } from "next-intl/server";

import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

const BENEFIT_KEYS = ["time", "trust", "neutrality"] as const;

export async function LandingBenefitsSection() {
  const t = await getTranslations("landing.benefits");

  return (
    <Section
      id="beneficios"
      padding="lg"
      aria-labelledby="beneficios-heading"
      className="landing-section border-t border-border"
    >
      <LandingSectionHeader
        id="beneficios-heading"
        title={t("title")}
        description={t("description")}
      />

      <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {BENEFIT_KEYS.map((key) => (
          <li key={key} className="flex flex-col gap-4">
            <span className="h-px w-10 bg-accent" aria-hidden />
            <Text as="h3" variant="h4">
              {t(`items.${key}.title`)}
            </Text>
            <Text as="p" variant="body" className="text-ink-muted">
              {t(`items.${key}.body`)}
            </Text>
          </li>
        ))}
      </ul>
    </Section>
  );
}
