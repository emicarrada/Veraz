import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { SpecularButton } from "@/components/ui/specular-button";
import { Text } from "@/components/ui/text";
import { cn } from "@/utils/cn";

function HeroVisualPlaceholder() {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-square",
        "rounded-none bg-surface-muted",
      )}
      role="img"
      aria-label="[PLACEHOLDER: visual hero — ilustración o composición de producto]"
    >
      <div className="absolute inset-0 landing-grid-mask opacity-70" aria-hidden />
      <div
        className="absolute inset-[12%] border border-border-strong/40 bg-surface/50 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        className="absolute bottom-[18%] left-[14%] right-[14%] h-px bg-accent/40"
        aria-hidden
      />
      <div
        className="absolute left-[14%] top-[22%] text-label text-ink-muted"
        aria-hidden
      >
        [PLACEHOLDER: media]
      </div>
      <div
        className="absolute inset-x-[14%] bottom-[22%] text-small text-ink-secondary"
        aria-hidden
      >
        [PLACEHOLDER: escena / producto / atmósfera]
      </div>
    </div>
  );
}

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

      <Container className="relative grid min-h-[min(100dvh,56rem)] items-center gap-10 py-10 pt-4 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="flex flex-col lg:col-span-6">
          <div className="landing-reveal flex items-center gap-3">
            <Logo size="md" priority />
            <Text
              id="landing-hero-brand"
              as="p"
              variant="display"
              className="text-[clamp(2.75rem,6vw,4.25rem)]"
            >
              Veraz
            </Text>
          </div>

          <Text
            as="h1"
            variant="h2"
            className="landing-reveal landing-reveal-delay-1 mt-8 max-w-xl"
          >
            [PLACEHOLDER: headline — nueva forma de informarse]
          </Text>

          <Text
            as="p"
            variant="body-lg"
            className="landing-reveal landing-reveal-delay-2 mt-4 max-w-lg"
          >
            [PLACEHOLDER: subheadline — confianza, claridad y contexto sin
            influenciar]
          </Text>

          <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SpecularButton
              href="#cta-final"
              size="lg"
              radius={18}
              tint="#ffffff"
              tintOpacity={0}
              blur={0}
              textColor="#f5f5f5"
              lineColor="#ffffff"
              baseColor="#525252"
              intensity={1}
              shineSize={10}
              shineFade={40}
              thickness={1}
              speed={0.35}
              proximity={250}
              followMouse
              autoAnimate
            >
              [PLACEHOLDER: CTA primario]
            </SpecularButton>
            <Button href="#que-es-veraz" variant="secondary" size="lg">
              [PLACEHOLDER: CTA secundario]
            </Button>
          </div>
        </div>

        <div className="landing-fade lg:col-span-6">
          <HeroVisualPlaceholder />
        </div>
      </Container>
    </section>
  );
}
