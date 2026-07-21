import { getLocale, getTranslations } from "next-intl/server";

import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { HeroPrimaryButton } from "@/components/marketing/landing/hero-primary-button";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { feedPath, staticPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

export async function LandingFinalCtaSection() {
  const t = await getTranslations("landing.finalCta");
  const locale = (await getLocale()) as Locale;

  return (
    <Section
      id="cta-final"
      padding="lg"
      aria-labelledby="cta-final-heading"
      className="landing-section landing-section--cta relative overflow-hidden border-t border-border"
    >
      <div
        className="pointer-events-none absolute inset-0 landing-hero-glow opacity-70"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <LandingSectionHeader
          id="cta-final-heading"
          title={t("title")}
          description={t("description")}
          align="center"
          titleVariant="display"
        />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <HeroPrimaryButton href={feedPath(locale)}>{t("ctaNews")}</HeroPrimaryButton>
          <Button href={staticPath(locale, "/metodologia")} variant="secondary" size="lg">
            {t("ctaMethodology")}
          </Button>
        </div>
      </div>
    </Section>
  );
}
