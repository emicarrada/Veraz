import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SpecularButton } from "@/components/ui/specular-button";
import { Text } from "@/components/ui/text";

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
          title="[PLACEHOLDER: CTA final — título]"
          description="[PLACEHOLDER: CTA final — apoyo en una o dos frases]"
          align="center"
          titleVariant="display"
        />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SpecularButton
            href="#placeholder-start"
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
            [PLACEHOLDER: CTA primario final]
          </SpecularButton>
          <Button href="#placeholder-learn" variant="secondary" size="lg">
            [PLACEHOLDER: CTA secundario final]
          </Button>
        </div>
        <Text as="p" variant="caption" className="text-ink-muted">
          [PLACEHOLDER: nota — sin formularios conectados en esta fase]
        </Text>
      </div>
    </Section>
  );
}
