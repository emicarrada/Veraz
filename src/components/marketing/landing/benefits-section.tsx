import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

const BENEFITS = [
  {
    title: "[PLACEHOLDER: beneficio 1]",
    body: "[PLACEHOLDER: detalle — por qué importa al lector]",
  },
  {
    title: "[PLACEHOLDER: beneficio 2]",
    body: "[PLACEHOLDER: detalle — por qué importa al lector]",
  },
  {
    title: "[PLACEHOLDER: beneficio 3]",
    body: "[PLACEHOLDER: detalle — por qué importa al lector]",
  },
] as const;

export function LandingBenefitsSection() {
  return (
    <Section
      id="beneficios"
      padding="lg"
      aria-labelledby="beneficios-heading"
      className="landing-section border-t border-border"
    >
      <LandingSectionHeader
        id="beneficios-heading"
        title="Beneficios"
        description="[PLACEHOLDER: intro — valor concreto para quien se informa]"
      />

      <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="flex flex-col gap-4">
            <span className="h-px w-10 bg-accent" aria-hidden />
            <Text as="h3" variant="h4">
              {benefit.title}
            </Text>
            <Text as="p" variant="body" className="text-ink-muted">
              {benefit.body}
            </Text>
          </li>
        ))}
      </ul>
    </Section>
  );
}
