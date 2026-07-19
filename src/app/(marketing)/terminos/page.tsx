import type { Metadata } from "next";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig } from "@/config";
import { SUPPORT_EMAIL } from "@/config/site-navigation";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Condiciones de uso del sitio Veraz.",
};

export default function TerminosPage() {
  const { name, siteUrl } = getAppConfig();

  return (
    <StaticPageShell
      title="Términos de uso"
      description={`Al usar ${siteUrl} aceptas estas condiciones.`}
    >
      <p>
        {name} es una plataforma de agregación y lectura de noticias. Al acceder
        al sitio aceptas los términos siguientes.
      </p>

      <h2>Uso del servicio</h2>
      <p>
        Puedes usar {name} para consultar noticias agregadas de fuentes externas.
        Debes hacerlo de forma lícita y sin intentar alterar, sobrecargar o
        interferir con el funcionamiento del sitio.
      </p>

      <h2>Contenido y fuentes</h2>
      <p>
        Los titulares, resúmenes e imágenes pertenecen a sus respectivos medios.
        {name} no reclama autoría sobre ese material. Para el contenido completo
        debes visitar la fuente enlazada. No garantizamos que los feeds reflejen
        en todo momento la versión más reciente del medio original.
      </p>

      <h2>Exactitud</h2>
      <p>
        Trabajamos para mostrar información fiel a lo publicado por cada fuente,
        pero no podemos garantizar ausencia total de errores de clasificación,
        duplicados o enlaces rotos. Reporta incidencias a{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>Limitación de responsabilidad</h2>
      <p>
        {name} se ofrece «tal cual». No somos responsables de decisiones que tomes
        basándote en noticias de terceros ni de contenido alojado fuera de nuestro
        dominio.
      </p>

      <h2>Modificaciones</h2>
      <p>
        Podemos cambiar funcionalidades o estos términos. El uso continuado del
        sitio tras un cambio implica la aceptación de la versión publicada.
      </p>
    </StaticPageShell>
  );
}
