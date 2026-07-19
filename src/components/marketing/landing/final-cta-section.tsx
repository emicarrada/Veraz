import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { HeroPrimaryButton } from "@/components/marketing/landing/hero-primary-button";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { FEED_ROUTE } from "@/features/news/constants";

export function LandingFinalCtaSection() {
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
          title="Empieza a leer con contexto"
          description="Entra al feed, elige tu rubro y abre la fuente cuando quieras profundizar."
          align="center"
          titleVariant="display"
        />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <HeroPrimaryButton href={FEED_ROUTE}>Explorar noticias</HeroPrimaryButton>
          <Button href="/metodologia" variant="secondary" size="lg">
            Ver metodología
          </Button>
        </div>
      </div>
    </Section>
  );
}
