import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { MainContainer } from "@/components/layout/main-container";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { FEED_ROUTE } from "@/features/news/constants";

export default function NotFoundPage() {
  return (
    <div className="landing-page flex min-h-dvh flex-col bg-bg text-ink">
      <MainContainer className="flex flex-1 items-center">
        <Container className="py-16 text-center" size="md">
          <Text as="p" variant="label" className="text-ink-muted">
            Error 404
          </Text>
          <Text as="h1" variant="display" className="mt-4">
            Página no encontrada
          </Text>
          <Text as="p" variant="body-lg" className="mx-auto mt-4 max-w-md text-ink-secondary">
            La ruta que buscas no existe o fue movida. Puedes volver al inicio o
            explorar el feed de noticias.
          </Text>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/" variant="primary" size="lg">
              Inicio
            </Button>
            <Button href={FEED_ROUTE} variant="secondary" size="lg">
              Noticias
            </Button>
          </div>
          <p className="mt-8 text-small text-ink-muted">
            ¿Crees que es un error?{" "}
            <Link
              href="/contacto"
              className="text-ink-secondary underline underline-offset-2 hover:text-ink"
            >
              Contáctanos
            </Link>
          </p>
        </Container>
      </MainContainer>
      <SiteFooter />
    </div>
  );
}
