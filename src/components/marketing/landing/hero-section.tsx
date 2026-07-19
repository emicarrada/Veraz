import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { HeroGlobeSlot } from "@/components/marketing/landing/hero-globe-slot";
import { HeroPrimaryButton } from "@/components/marketing/landing/hero-primary-button";
import { FEED_ROUTE } from "@/features/news/constants";

/**
 * Full-bleed hero — brand first, one headline, one subcopy, CTA pair, dominant visual.
 */
export function LandingHeroSection() {
  return (
    <section
      aria-labelledby="landing-hero-brand"
      className="relative isolate overflow-hidden landing-hero-glow"
    >
      <div className="pointer-events-none absolute inset-0 landing-grid-mask opacity-40" aria-hidden />

      <Container className="relative grid min-h-[min(100dvh,56rem)] items-center gap-6 py-10 pt-4 sm:gap-8 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="flex flex-col lg:col-span-6">
          <Text
            id="landing-hero-brand"
            as="p"
            variant="display"
            className="landing-reveal text-[clamp(2.75rem,6vw,4.25rem)]"
          >
            Veraz
          </Text>

          <Text
            as="h1"
            variant="h2"
            className="landing-reveal landing-reveal-delay-1 mt-8 max-w-xl"
          >
            Una forma clara de informarte cada día
          </Text>

          <Text
            as="p"
            variant="body-lg"
            className="landing-reveal landing-reveal-delay-2 mt-4 max-w-lg text-ink-secondary"
          >
            Agregamos noticias de fuentes de referencia, con trazabilidad a la
            publicación original. Sin inventar hechos ni empujar una agenda.
          </Text>

          <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <HeroPrimaryButton href={FEED_ROUTE}>Ver noticias</HeroPrimaryButton>
            <Button href="#que-es-veraz" variant="secondary" size="lg">
              Conocer Veraz
            </Button>
          </div>
        </div>

        <div className="landing-fade -mt-2 flex justify-center lg:col-span-6 lg:mt-0 lg:justify-stretch">
          <HeroGlobeSlot />
        </div>
      </Container>
    </section>
  );
}
