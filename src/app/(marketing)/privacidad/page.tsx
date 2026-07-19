import type { Metadata } from "next";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig, getCanonicalSiteUrl } from "@/config";
import { SUPPORT_EMAIL } from "@/config/site-navigation";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Veraz trata datos personales y navegación.",
};

export default function PrivacidadPage() {
  const { name } = getAppConfig();
  const siteUrl = getCanonicalSiteUrl();

  return (
    <StaticPageShell
      title="Política de privacidad"
      description={`Última actualización: julio 2026. Aplica al sitio ${siteUrl}.`}
    >
      <p>
        En {name} respetamos tu privacidad. Esta política describe qué datos
        podemos tratar cuando usas el sitio y con qué finalidad.
      </p>

      <h2>Datos que recopilamos</h2>
      <p>
        El sitio público de {name} no requiere registro para leer noticias. Podemos
        recibir datos técnicos habituales de navegación (dirección IP, tipo de
        navegador, páginas visitadas) a través del hosting y herramientas de
        analítica si las activamos en el futuro.
      </p>

      <h2>Uso de la información</h2>
      <ul>
        <li>Operar y mejorar el servicio.</li>
        <li>Proteger la seguridad de la plataforma.</li>
        <li>Responder solicitudes enviadas a {SUPPORT_EMAIL}.</li>
      </ul>

      <h2>Terceros</h2>
      <p>
        Las noticias enlazan a sitios externos (medios de comunicación). Esas
        páginas tienen sus propias políticas de privacidad; no controlamos cómo
        tratan tus datos allí.
      </p>
      <p>
        Usamos proveedores de infraestructura (hosting, base de datos) para
        mantener el servicio. Solo compartimos con ellos lo necesario para operar
        la plataforma.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar información sobre el tratamiento de datos o pedir la
        eliminación de comunicaciones que nos hayas enviado escribiendo a{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>Cambios</h2>
      <p>
        Podemos actualizar esta política. Publicaremos la versión vigente en esta
        misma URL.
      </p>
    </StaticPageShell>
  );
}
