import { getTranslations } from "next-intl/server";

import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Section } from "@/components/ui/section";

const FEATURE_KEYS = ["sources", "freshness", "traceability", "noNoise"] as const;

export async function LandingFeaturesSection() {
  const t = await getTranslations("landing.features");

  return (
    <Section
      id="caracteristicas"
      padding="lg"
      aria-labelledby="caracteristicas-heading"
      className="landing-section border-t border-border"
    >
      <LandingSectionHeader
        id="caracteristicas-heading"
        title={t("title")}
        description={t("description")}
      />

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURE_KEYS.map((key, index) => (
          <li key={key} className="flex flex-col">
            {index > 0 && index % 2 === 0 ? (
              <Divider className="mb-6 sm:hidden" />
            ) : null}
            <Card padding="lg" interactive className="h-full">
              <CardHeader>
                <CardTitle>{t(`items.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-ink-secondary">
                  {t(`items.${key}.body`)}
                </CardDescription>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
