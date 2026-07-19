import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

export function LandingWhatIsSection() {
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
            eyebrow="[PLACEHOLDER: eyebrow]"
            title="¿Qué es Veraz?"
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-7 lg:pt-10">
          <Text as="p" variant="body-lg" className="text-ink-secondary">
            [PLACEHOLDER: párrafo — Veraz agrega fuentes verificables y presenta
            información clara, trazable y neutral. No es un medio editorial que
            inventa noticias.]
          </Text>
          <Text as="p" variant="body" className="text-ink-muted">
            [PLACEHOLDER: párrafo de apoyo — informar sin influenciar]
          </Text>
        </div>
      </div>
    </Section>
  );
}
