import type { Metadata } from "next";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig } from "@/config";

export const metadata: Metadata = {
  title: "Acerca de",
  description: "Qué es Veraz y por qué existe.",
};

export default function AcercaDePage() {
  const { name, tagline } = getAppConfig();

  return (
    <StaticPageShell
      title="Acerca de Veraz"
      description={`${tagline}. ${name} es una plataforma de noticias, no un medio tradicional.`}
    >
      <p>
        {name} nace para resolver un problema cotidiano: informarse sin perder de
        vista de dónde viene cada dato. En un entorno saturado de titulares,
        resumimos y organizamos lo publicado por fuentes de referencia — sin
        sustituirlas ni añadir opinión disfrazada de hecho.
      </p>

      <h2>Nuestra premisa</h2>
      <p>
        Informar sin influenciar. Eso significa presentar la información con
        contexto suficiente, enlazar siempre a la fuente y ser transparentes
        sobre cómo llega cada noticia al feed.
      </p>

      <h2>Qué encontrarás aquí</h2>
      <ul>
        <li>Feeds de finanzas y tecnología con fuentes prestigiosas.</li>
        <li>Cobertura general en política, internacional, deportes y sociedad.</li>
        <li>Actualizaciones varias veces al día desde medios configurados.</li>
        <li>Páginas de detalle con enlace al artículo original.</li>
      </ul>

      <h2>Equipo y contacto</h2>
      <p>
        {name} está en desarrollo activo. Para sugerencias, prensa o soporte:{" "}
        <a href="mailto:soporte@veraz.app">soporte@veraz.app</a>.
      </p>
    </StaticPageShell>
  );
}
