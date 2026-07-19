import { LandingSectionHeader } from "@/components/marketing/landing/landing-section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Section } from "@/components/ui/section";

const FEATURES = [
  {
    title: "Fuentes de referencia",
    body: "Finanzas y tecnología con medios reconocidos; cobertura general en otras pestañas.",
  },
  {
    title: "Actualización frecuente",
    body: "El feed se alimenta de forma automática para que veas lo publicado hace horas, no días.",
  },
  {
    title: "Trazabilidad total",
    body: "Sabes quién publicó cada noticia y cuándo. Un clic te lleva al artículo original.",
  },
  {
    title: "Sin ruido editorial",
    body: "No reescribimos titulares para generar clics. Mostramos lo que la fuente publicó.",
  },
] as const;

export function LandingFeaturesSection() {
  return (
    <Section
      id="caracteristicas"
      padding="lg"
      aria-labelledby="caracteristicas-heading"
      className="landing-section border-t border-border"
    >
      <LandingSectionHeader
        id="caracteristicas-heading"
        title="Características principales"
        description="Diseñado para quien quiere contexto, no solo titulares."
      />

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((feature, index) => (
          <li key={feature.title} className="flex flex-col">
            {index > 0 && index % 2 === 0 ? (
              <Divider className="mb-6 sm:hidden" />
            ) : null}
            <Card padding="lg" interactive className="h-full">
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-ink-secondary">
                  {feature.body}
                </CardDescription>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
