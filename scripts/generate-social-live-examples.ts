#!/usr/bin/env npx tsx
/**
 * Generate hero-gradient cards from real Veraz feed candidates (same as social:publish would pick).
 * Output: .social/examples/live/
 */
import path from "node:path";

import { loadSocialPublishConfig } from "@/features/social-publishing";
import { resolveSocialImageUrl } from "@/features/social-publishing/resolve-image-url";
import { selectSocialCandidates } from "@/features/social-publishing/select-candidates";
import { downloadSocialImage } from "@/lib/social-publishing/download-social-image";
import { renderSocialCard } from "@/lib/social-publishing/render-social-card";
import { createContentRepositories } from "@/lib/repositories/factory";
import { isSupabasePersistenceConfigured } from "@/lib/supabase";

const ROOT = path.resolve(import.meta.dirname, "..");

async function main(): Promise<void> {
  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured — need .env.local with service role.");
    process.exit(1);
  }

  const repos = createContentRepositories();
  if (!repos?.articleRepository) {
    console.error("Article repository unavailable.");
    process.exit(1);
  }

  const config = loadSocialPublishConfig({
    ...process.env,
    SOCIAL_PUBLISHING_ENABLED: "true",
    SOCIAL_MAX_POSTS_PER_RUN: process.env.SOCIAL_MAX_POSTS_PER_RUN ?? "3",
    SOCIAL_CARD_VARIANT: "hero-gradient",
  });

  const candidates = await selectSocialCandidates(repos.articleRepository, config);
  if (candidates.length === 0) {
    console.log("No feed candidates (empty feed or all already in social_publications).");
    process.exit(0);
  }

  const outDir = path.join(ROOT, ".social/examples/live");
  const assetsDir = path.join(ROOT, ".social/examples/live-assets");
  console.log(`Generando ${candidates.length} ejemplo(s) hero-gradient → ${outDir}\n`);

  for (const candidate of candidates) {
    const imageUrl = resolveSocialImageUrl(candidate);
    let photoPath: string;
    try {
      photoPath = await downloadSocialImage(imageUrl, assetsDir, candidate.slug);
    } catch (error) {
      console.error(`✗ ${candidate.slug}: download failed — ${error instanceof Error ? error.message : error}`);
      continue;
    }

    const outputPath = path.join(outDir, `${candidate.slug}.png`);
    await renderSocialCard({
      title: candidate.title,
      sourceLabel: candidate.sourceAttribution,
      photoPath,
      outputPath,
      variant: "hero-gradient",
      projectRoot: ROOT,
    });
    console.log(`✓ ${candidate.slug}.png`);
    console.log(`  ${candidate.sourceAttribution} — ${candidate.title.slice(0, 72)}…`);
    console.log(`  ${candidate.verazArticleUrl}\n`);
  }

  console.log("Abre:", outDir);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
