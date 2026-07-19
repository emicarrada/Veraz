import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

const BENEFITS = [
  {
    title: "Menos tiempo buscando",
    body: "Un solo lugar para finanzas, tech y actualidad, en lugar de saltar entre diez portadas.",
  },
  {
    title: "Más confianza",
    body: "Cada noticia lleva su fuente visible. Puedes contrastar antes de compartir o decidir.",
  },
  {
    title: "Neutralidad de presentación",
    body: "Clasificamos por tema, no por opinión. Veraz no empuja un relato único.",
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
        description="Para leer el día a día con criterio, no con prisa."
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
