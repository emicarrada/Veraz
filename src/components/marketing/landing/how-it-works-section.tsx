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
    title: "[PLACEHOLDER: paso 1 — título]",
    body: "[PLACEHOLDER: paso 1 — descripción breve del flujo]",
  },
  {
    step: "02",
    title: "[PLACEHOLDER: paso 2 — título]",
    body: "[PLACEHOLDER: paso 2 — descripción breve del flujo]",
  },
  {
    step: "03",
    title: "[PLACEHOLDER: paso 3 — título]",
    body: "[PLACEHOLDER: paso 3 — descripción breve del flujo]",
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
        description="[PLACEHOLDER: intro — flujo simple de fuentes a comprensión]"
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
