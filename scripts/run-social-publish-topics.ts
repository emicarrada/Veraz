#!/usr/bin/env npx tsx
/**
 * Publish latest feed item per topic group (e.g. deportes + cultura) to configured platforms.
 * Usage: npm run social:publish:topics -- deportes cultura
 */
import path from "node:path";

import type { NewsTopicGroup } from "@/features/news/classification/categories";
import { buildSocialCaptions, loadSocialPublishConfig } from "@/features/social-publishing";
import { resolveSocialImageUrl } from "@/features/social-publishing/resolve-image-url";
import { selectLatestSocialCandidateForCategory } from "@/features/social-publishing/select-candidates";
import { downloadSocialImage } from "@/lib/social-publishing/download-social-image";
import { assertSocialPublishReady } from "@/lib/social-publishing/publish/assert-ready";
import { publishToSocialNetwork, profileDirForPlatform } from "@/lib/social-publishing/publish";
import { renderSocialCard } from "@/lib/social-publishing/render-social-card";
import {
  loadPublicationIndex,
  pendingPlatformsForArticle,
  upsertSocialPublication,
} from "@/lib/social-publishing/social-publication-store";
import { writePlatformCaptionFiles } from "@/lib/social-publishing/write-caption-files";
import { createContentRepositories } from "@/lib/repositories/factory";
import { isSupabasePersistenceConfigured } from "@/lib/supabase";

const VALID_GROUPS: NewsTopicGroup[] = [
  "politica",
  "economia",
  "deportes",
  "internacional",
  "sociedad",
  "cultura",
  "tecnologia",
  "general",
];

function parseTopicGroups(argv: string[]): NewsTopicGroup[] {
  const groups = argv
    .map((a) => a.trim().toLowerCase())
    .filter((a): a is NewsTopicGroup => VALID_GROUPS.includes(a as NewsTopicGroup));
  return groups.length > 0 ? groups : ["deportes", "cultura"];
}

async function main(): Promise<void> {
  const topicGroups = parseTopicGroups(process.argv.slice(2));
  const config = loadSocialPublishConfig();

  if (!config.enabled) {
    console.error("SOCIAL_PUBLISHING_ENABLED is not true.");
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

  if (config.publishNetworks && !config.dryRun) {
    const readyError = await assertSocialPublishReady(config.platforms);
    if (readyError) {
      console.error(readyError);
      process.exit(1);
    }
  }

  const publicationIndex = await loadPublicationIndex();
  const captionBase = {
    locale: config.locale,
    globalHashtags: config.globalHashtags,
    includeExcerpt: config.includeExcerptInCaption,
  };

  for (const group of topicGroups) {
    const candidate = await selectLatestSocialCandidateForCategory(
      repos.articleRepository,
      config,
      group,
    );

    if (!candidate) {
      console.log(`\n[${group}] No hay candidato (feed vacío o ya publicado en todas las redes).`);
      continue;
    }

    const pendingPlatforms = pendingPlatformsForArticle(
      candidate.articleId,
      config.platforms,
      publicationIndex,
    );
    const platformsToUse = pendingPlatforms.length > 0 ? pendingPlatforms : config.platforms;
    const captions = buildSocialCaptions(candidate, {
      ...captionBase,
      platforms: platformsToUse,
    });

    console.log("\n" + "—".repeat(60));
    console.log(`[${group}] ${candidate.title}`);
    console.log(`Slug: ${candidate.slug}`);

    if (config.dryRun) {
      console.log("(dry-run — skip)\n");
      continue;
    }

    const imageUrl = resolveSocialImageUrl(candidate);
    const assetPath = await downloadSocialImage(imageUrl, config.assetsDir, candidate.slug);
    const exportPath = path.join(config.exportsDir, `${candidate.slug}.png`);

    await renderSocialCard({
      title: candidate.title,
      sourceLabel: candidate.sourceAttribution,
      photoPath: assetPath,
      outputPath: exportPath,
      variant: config.cardVariant,
      projectRoot: path.resolve(import.meta.dirname, ".."),
    });
    console.log(`PNG: ${exportPath}`);

    if (config.writeCaptionFiles) {
      await writePlatformCaptionFiles(config.exportsDir, candidate.slug, captions);
    }

    for (const platform of platformsToUse) {
      const caption = captions[platform];
      if (!caption) continue;

      await upsertSocialPublication({
        articleId: candidate.articleId,
        platform,
        locale: config.locale,
        status: "exported",
        exportPath,
        caption,
      });

      if (!config.publishNetworks) {
        console.log(`(${platform}: export only)`);
        continue;
      }

      const result = await publishToSocialNetwork({
        platform,
        caption,
        imagePath: exportPath,
        profileDir: profileDirForPlatform(platform, process.env),
        headed: config.headed,
        pauseOnErrorMs: config.headed ? 60_000 : 0,
      });

      if (result.ok) {
        await upsertSocialPublication({
          articleId: candidate.articleId,
          platform,
          locale: config.locale,
          status: "posted",
          exportPath,
          caption,
          markPosted: true,
        });
        console.log(`✓ ${platform}`);
      } else {
        await upsertSocialPublication({
          articleId: candidate.articleId,
          platform,
          locale: config.locale,
          status: "failed",
          exportPath,
          caption,
          errorMessage: result.error,
        });
        console.error(`✗ ${platform}: ${result.error}`);
      }
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
