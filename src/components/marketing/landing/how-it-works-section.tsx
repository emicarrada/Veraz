import { getTranslations } from "next-intl/server";

import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

const STEP_KEYS = ["1", "2", "3"] as const;

export async function LandingHowItWorksSection() {
  const t = await getTranslations("landing.howItWorks");

  return (
    <Section
      id="como-funciona"
      padding="lg"
      aria-labelledby="como-funciona-heading"
      className="landing-section landing-section--muted border-t border-border"
    >
      <LandingSectionHeader
        id="como-funciona-heading"
        title={t("title")}
        description={t("description")}
      />

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {STEP_KEYS.map((key, index) => (
          <li key={key}>
            <Card padding="lg" className="h-full bg-surface-muted/60">
              <CardHeader>
                <Text as="p" variant="label" className="text-accent">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <CardTitle>{t(`steps.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-ink-muted">
                  {t(`steps.${key}.body`)}
                </CardDescription>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
