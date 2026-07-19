import type { Metadata } from "next";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { SUPPORT_EMAIL } from "@/config/site-navigation";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos a soporte@veraz.app",
};

export default function ContactoPage() {
  return (
    <StaticPageShell
      title="Contacto"
      description="Un solo canal para soporte, sugerencias y reportes sobre el contenido."
    >
      <p>
        Para consultas sobre el funcionamiento de Veraz, reportar un problema con
        una fuente o proponer mejoras, contáctanos por correo:
      </p>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>
        Respondemos en días hábiles. Si reportas un error en una noticia, incluye
        el enlace de la ficha en Veraz y, si puedes, el enlace a la fuente original.
      </p>
    </StaticPageShell>
  );
}
