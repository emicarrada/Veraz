#!/usr/bin/env npx tsx
/**
 * Generate sample social cards (3 variants) for review.
 * Output: .social/examples/
 */
import path from "node:path";

import {
  SOCIAL_CARD_VARIANTS,
  type SocialCardVariant,
} from "@/features/social-publishing/templates/card-variants";
import { renderSocialCard } from "@/lib/social-publishing/render-social-card";

const ROOT = path.resolve(import.meta.dirname, "..");

const SAMPLES = [
  {
    id: "infobae-messi",
    title:
      "El emotivo mensaje de Leandro Paredes tras perder la final: fue un orgullo ser parte de esta Selección",
    source: "Infobae",
    photo: "public/fotosGlobo/expansion.jpg",
  },
  {
    id: "bbc-cpi",
    title:
      "Destituyen al fiscal jefe de la Corte Penal Internacional por supuesta conducta sexual inapropiada",
    source: "BBC Mundo",
    photo: "public/fotosGlobo/techcrunch.jpg",
  },
  {
    id: "finanzas",
    title: "El Ibex mantiene los 19.200 puntos, con la vista puesta en el petróleo y los resultados",
    source: "Expansión",
    photo: "public/fotosGlobo/expansion.jpg",
  },
] as const;

async function main(): Promise<void> {
  const outDir = path.join(ROOT, ".social/examples");
  console.log("Generando ejemplos en:", outDir);
  console.log("");

  for (const sample of SAMPLES) {
    const photoPath = path.join(ROOT, sample.photo);
    for (const variant of Object.keys(SOCIAL_CARD_VARIANTS) as SocialCardVariant[]) {
      const fileName = `${sample.id}-${variant}.png`;
      const outputPath = path.join(outDir, fileName);
      await renderSocialCard({
        title: sample.title,
        sourceLabel: sample.source,
        photoPath,
        outputPath,
        variant,
        projectRoot: ROOT,
      });
      console.log(`✓ ${fileName} — ${SOCIAL_CARD_VARIANTS[variant].label}`);
    }
    console.log("");
  }

  console.log("Abre la carpeta (Ctrl+H para ver .social):");
  console.log(outDir);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
