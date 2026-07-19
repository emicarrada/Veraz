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

const STEPS = [
  {
    step: "01",
    title: "Agregamos fuentes",
    body: "Consultamos feeds RSS de medios curados varias veces al día. Finanzas y tecnología usan solo fuentes prestigiosas.",
  },
  {
    step: "02",
    title: "Clasificamos y mostramos",
    body: "Cada artículo entra al feed con tema, fuente y resumen. Filtras por rubro o buscas por palabra clave.",
  },
  {
    step: "03",
    title: "Lees en la fuente",
    body: "Desde Veraz abres el artículo completo en el medio original. El contexto y la responsabilidad editorial siguen allí.",
  },
] as const;

export function LandingHowItWorksSection() {
  return (
    <Section
      id="como-funciona"
      padding="lg"
      aria-labelledby="como-funciona-heading"
      className="landing-section landing-section--muted border-t border-border"
    >
      <LandingSectionHeader
        id="como-funciona-heading"
        title="Cómo funciona"
        description="De la fuente a tu pantalla en tres pasos, sin cajas negras."
      />

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {STEPS.map((item) => (
          <li key={item.step}>
            <Card padding="lg" className="h-full bg-surface-muted/60">
              <CardHeader>
                <Text as="p" variant="label" className="text-accent">
                  {item.step}
                </Text>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-ink-muted">
                  {item.body}
                </CardDescription>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
