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
    title: "[PLACEHOLDER: feature 1 — título]",
    body: "[PLACEHOLDER: feature 1 — beneficio en una frase]",
  },
  {
    title: "[PLACEHOLDER: feature 2 — título]",
    body: "[PLACEHOLDER: feature 2 — beneficio en una frase]",
  },
  {
    title: "[PLACEHOLDER: feature 3 — título]",
    body: "[PLACEHOLDER: feature 3 — beneficio en una frase]",
  },
  {
    title: "[PLACEHOLDER: feature 4 — título]",
    body: "[PLACEHOLDER: feature 4 — beneficio en una frase]",
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
        description="[PLACEHOLDER: intro — qué hace distinta a la plataforma]"
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
