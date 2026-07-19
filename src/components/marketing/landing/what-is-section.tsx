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
            eyebrow="Plataforma de noticias"
            title="¿Qué es Veraz?"
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-7 lg:pt-10">
          <Text as="p" variant="body-lg" className="text-ink-secondary">
            Veraz agrega titulares y resúmenes de medios de referencia en finanzas,
            tecnología y actualidad general. Cada ficha indica la fuente, la fecha
            y un enlace al artículo original para que verifiques por ti mismo.
          </Text>
          <Text as="p" variant="body" className="text-ink-muted">
            No somos un medio que redacta noticias propias. Nuestro trabajo es
            organizar, clasificar y presentar lo que ya publicaron fuentes
            verificables — informar sin influenciar.
          </Text>
        </div>
      </div>
    </Section>
  );
}
