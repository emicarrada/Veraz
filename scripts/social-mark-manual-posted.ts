#!/usr/bin/env npx tsx
/**
 * Marca un artículo como publicado manualmente en una red (p. ej. TikTok).
 *
 * Usage:
 *   npm run social:mark-posted -- tiktok femicidio-de-natalia-cruz-...
 *   npm run social:mark-posted -- tiktok   # último slug entregado
 */
import type { SocialPlatform } from "@/features/social-publishing/types";
import { loadSocialPublishConfig } from "@/features/social-publishing/load-config";
import { upsertSocialPublication } from "@/lib/social-publishing/social-publication-store";
import { createContentRepositories } from "@/lib/repositories/factory";
import { isSupabasePersistenceConfigured } from "@/lib/supabase";

const VALID: SocialPlatform[] = ["x", "instagram", "tiktok", "instagram_reels", "youtube"];

async function main(): Promise<void> {
  const platform = process.argv[2]?.trim().toLowerCase() as SocialPlatform | undefined;
  let slug = process.argv[3]?.trim();

  if (!platform || !VALID.includes(platform)) {
    console.error("Uso: npm run social:mark-posted -- <platform> [slug]");
    process.exit(1);
  }

  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured.");
    process.exit(1);
  }

  const repos = createContentRepositories();
  if (!repos?.articleRepository) {
    console.error("Article repository unavailable.");
    process.exit(1);
  }

  const config = loadSocialPublishConfig();

  if (!slug) {
    console.error("Indica el slug del artículo.");
    process.exit(1);
  }

  const article = await repos.articleRepository.findBySlug(slug);
  if (!article) {
    console.error(`Artículo no encontrado: ${slug}`);
    process.exit(1);
  }

  await upsertSocialPublication({
    articleId: article.article.id,
    platform,
    locale: config.locale,
    status: "posted",
    markPosted: true,
  });

  console.log(`✓ ${platform} marcado como posted para ${slug}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
