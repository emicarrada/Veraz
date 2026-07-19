import type { Metadata } from "next";

import { StaticPageShell } from "@/components/marketing/static-page-shell";
import { getAppConfig } from "@/config";

export const metadata: Metadata = {
  title: "Metodología",
  description:
    "Cómo Veraz agrega, clasifica y presenta noticias con trazabilidad a la fuente original.",
};

export default function MetodologiaPage() {
  const { name } = getAppConfig();

  return (
    <StaticPageShell
      title="¿Cómo verificamos una noticia?"
      description={`${name} no es un medio que redacta titulares propios. Agregamos información de fuentes de referencia y te llevamos siempre a la publicación original.`}
    >
      <p>
        Nuestro objetivo es simple: que puedas informarte con claridad y comprobar
        cada hecho en la fuente. Esto es lo que hacemos — y lo que no hacemos.
      </p>

      <h2>1. Selección de fuentes</h2>
      <p>
        Trabajamos con medios y agencias de referencia en finanzas, tecnología y
        cobertura general. En las pestañas Finanzas y Tecnología solo aparecen
        fuentes prestigiosas curadas por el equipo (CNBC, TechCrunch, El País
        Economía, etc.). En Todas también incluimos portadas generales para una
        visión más amplia.
      </p>

      <h2>2. Agregación automática</h2>
      <p>
        Cada fuente se consulta de forma periódica mediante feeds RSS públicos.
        Extraemos titular, resumen, fecha, autor cuando existe e imagen cuando
        la fuente la publica. Si un feed falla, el resto sigue funcionando: la
        lectura del sitio no depende de una sola fuente.
      </p>

      <h2>3. Clasificación editorial</h2>
      <p>
        Asignamos cada artículo a un tema (política, economía, tecnología,
        deportes, etc.) con reglas de clasificación y, cuando aplica, un fallback
        según la sección de la fuente. La categoría ayuda a navegar; no implica
        juicio sobre el contenido.
      </p>

      <h2>4. Trazabilidad</h2>
      <p>
        Cada noticia en {name} muestra la fuente, la fecha de publicación y un
        enlace directo al artículo original. El resumen que ves proviene del feed
        o del extracto publicado por el medio; para el texto completo debes leer
        en la fuente.
      </p>

      <h2>5. Lo que no hacemos</h2>
      <ul>
        <li>No inventamos hechos ni reescribimos noticias como si fueran propias.</li>
        <li>No ocultamos la procedencia de la información.</li>
        <li>No bloqueamos la publicación del feed por fallos opcionales de enriquecimiento con IA (cuando esté activa, es complementaria).</li>
      </ul>

      <h2>6. Errores y correcciones</h2>
      <p>
        Si detectas un enlace roto, una clasificación incorrecta o una fuente que
        no debería estar en el catálogo, escríbenos a{" "}
        <a href="mailto:soporte@veraz.app">soporte@veraz.app</a>. Revisamos cada
        reporte y ajustamos feeds o reglas cuando corresponda.
      </p>
    </StaticPageShell>
  );
}
