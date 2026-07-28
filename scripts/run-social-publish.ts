#!/usr/bin/env npx tsx
/**
 * Social publish: feed → PNG → captions → (optional) X / IG / TikTok.
 * Usage: npm run social:publish
 * See docs/social-publishing.md
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildSocialCaptions, loadSocialPublishConfig } from "@/features/social-publishing";
import { buildYoutubeTitle } from "@/features/social-publishing/build-caption";
import {
  candidateNeedsFeedPng,
  candidateNeedsReelMp4,
  isFeedImagePlatform,
  isVideoSocialPlatform,
} from "@/features/social-publishing/platform-media";
import { selectSocialCandidates } from "@/features/social-publishing/select-candidates";
import { resolveSocialImageUrl } from "@/features/social-publishing/resolve-image-url";
import { downloadSocialImage } from "@/lib/social-publishing/download-social-image";
import {
  countPostedToday,
  loadPublicationIndex,
  pendingPlatformsForArticle,
  upsertSocialPublication,
} from "@/lib/social-publishing/social-publication-store";
import type { SocialPlatform, SocialPublishConfig } from "@/features/social-publishing/types";
import { renderSocialCard } from "@/lib/social-publishing/render-social-card";
import { renderSocialReelForCandidate } from "@/lib/social-publishing/render-social-reel-for-candidate";
import { publishToSocialNetwork, profileDirForPlatform } from "@/lib/social-publishing/publish";
import { assertSocialPublishReady } from "@/lib/social-publishing/publish/assert-ready";
import { writePlatformCaptionFiles } from "@/lib/social-publishing/write-caption-files";
import { createContentRepositories } from "@/lib/repositories/factory";
import { isSupabasePersistenceConfigured } from "@/lib/supabase";

function maxPostsPerDayForPlatform(
  platform: SocialPlatform,
  config: SocialPublishConfig,
): number {
  switch (platform) {
    case "x":
      return config.maxPostsPerDayX;
    case "instagram":
      return config.maxPostsPerDayInstagram;
    case "tiktok":
      return config.maxPostsPerDayTiktok;
    case "instagram_reels":
      return config.maxPostsPerDayInstagramReels;
    case "youtube":
      return config.maxPostsPerDayYoutube;
    default:
      return 0;
  }
}

async function resolvePlatformsForRun(config: SocialPublishConfig): Promise<SocialPlatform[]> {
  const active: SocialPlatform[] = [];
  for (const platform of config.platforms) {
    const maxDay = maxPostsPerDayForPlatform(platform, config);
    const posted = await countPostedToday(platform, config.publishTimeZone);
    if (posted >= maxDay) {
      console.log(`${platform}: cuota diaria alcanzada (${posted}/${maxDay}).`);
      continue;
    }
    active.push(platform);
  }
  return active;
}

function isSocialPublishCliEntrypoint(): boolean {
  const thisFile = fileURLToPath(import.meta.url);
  return process.argv.some((arg) => {
    if (!arg.endsWith("run-social-publish.ts")) return false;
    try {
      return path.resolve(arg) === thisFile;
    } catch {
      return true;
    }
  });
}

export async function runSocialPublish(): Promise<void> {
  try {
    console.log("[social:publish] starting…");
    const config = loadSocialPublishConfig();
    console.log(
      `[social:publish] enabled=${config.enabled} platforms=${config.platforms.join(",")} dryRun=${config.dryRun}`,
    );

  if (!config.enabled) {
    console.log("SOCIAL_PUBLISHING_ENABLED is not true — exit.");
    console.log("Set SOCIAL_PUBLISHING_ENABLED=true and SOCIAL_DRY_RUN=true to test.");
    process.exit(0);
  }

  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
    process.exit(1);
  }

  const repos = createContentRepositories();
  if (!repos?.articleRepository) {
    console.error("Article repository unavailable.");
    process.exit(1);
  }

  const platformsForRun = await resolvePlatformsForRun(config);
  console.log(`[social:publish] platformsForRun=${platformsForRun.join(",") || "(none)"}`);
  if (platformsForRun.length === 0) {
    console.log("Cuota diaria completa para las redes configuradas — exit.");
    process.exit(0);
  }

  const runConfig: SocialPublishConfig = { ...config, platforms: platformsForRun };

  if (config.publishNetworks && !config.dryRun) {
    const readyError = await assertSocialPublishReady(platformsForRun);
    if (readyError) {
      console.error(readyError);
      console.error("");
      console.error("Sesiones (una vez): npm run social:login -- x|instagram|tiktok");
      console.error("YouTube: npm run social:youtube-auth");
      process.exit(1);
    }
  }

  const publicationIndex = await loadPublicationIndex();
  const candidates = await selectSocialCandidates(repos.articleRepository, runConfig);
  if (candidates.length === 0) {
    console.log("No social candidates (feed empty or all targets already posted).");
    process.exit(0);
  }

  const captionOptions = {
    locale: config.locale,
    platforms: config.platforms,
    globalHashtags: config.globalHashtags,
    includeExcerpt: config.includeExcerptInCaption,
  };

  console.log(
    `Processing ${candidates.length} candidate(s) — platforms=${platformsForRun.join(",")}, dryRun=${config.dryRun}, variant=${config.cardVariant}\n`,
  );

  for (const candidate of candidates) {
    const pendingPlatforms = pendingPlatformsForArticle(
      candidate.articleId,
      platformsForRun,
      publicationIndex,
    );
    const captions = buildSocialCaptions(candidate, {
      ...captionOptions,
      platforms: pendingPlatforms.length > 0 ? pendingPlatforms : platformsForRun,
    });

    const imageUrl = resolveSocialImageUrl(candidate);
    console.log("—".repeat(60));
    console.log(`Slug: ${candidate.slug}`);
    console.log(`Source: ${candidate.sourceAttribution}`);
    console.log(`Pending platforms: ${pendingPlatforms.join(", ") || platformsForRun.join(", ")}`);
    console.log(`Image URL: ${imageUrl}`);

    for (const [platform, caption] of Object.entries(captions)) {
      console.log(`\n[${platform}] caption:\n${caption}\n`);
    }

    if (config.dryRun) {
      console.log("(dry-run — no export, no DB writes, no networks)\n");
      continue;
    }

    const platformsToPublish =
      pendingPlatforms.length > 0 ? pendingPlatforms : platformsForRun;
    const needPng = candidateNeedsFeedPng(platformsToPublish);
    const needMp4 = candidateNeedsReelMp4(platformsToPublish);

    let exportPath = path.join(config.exportsDir, `${candidate.slug}.png`);
    let videoPath: string | undefined;

    if (needPng) {
      let assetPath: string;
      try {
        assetPath = await downloadSocialImage(imageUrl, config.assetsDir, candidate.slug);
        console.log(`Downloaded: ${assetPath}`);
      } catch (error) {
        console.error(`Download failed: ${error instanceof Error ? error.message : error}`);
        continue;
      }

      try {
        await renderSocialCard({
          title: candidate.title,
          sourceLabel: candidate.sourceAttribution,
          photoPath: assetPath,
          outputPath: exportPath,
          variant: config.cardVariant,
          projectRoot: path.resolve(import.meta.dirname, ".."),
        });
        console.log(`PNG: ${exportPath}`);
      } catch (error) {
        console.error(`Render failed: ${error instanceof Error ? error.message : error}`);
        continue;
      }
    }

    if (needMp4) {
      console.log("Generando MP4 (overlay + Pexels/ffmpeg, suele tardar 1–3 min)…");
      try {
        const reel = await renderSocialReelForCandidate({
          candidate,
          assetsDir: config.assetsDir,
          exportsDir: config.exportsDir,
          projectRoot: path.resolve(import.meta.dirname, ".."),
          env: process.env,
        });
        videoPath = reel.mp4Path;
        console.log(`MP4: ${videoPath}${reel.usedPexels ? " (Pexels)" : " (estático)"}`);
        if (reel.pexelsPageUrl) console.log(`  Pexels: ${reel.pexelsPageUrl}`);
      } catch (error) {
        console.error(`Reel render failed: ${error instanceof Error ? error.message : error}`);
        continue;
      }
    }

    if (config.writeCaptionFiles) {
      const files = await writePlatformCaptionFiles(config.exportsDir, candidate.slug, captions);
      for (const file of files) console.log(`Caption file: ${file}`);
    }

    for (const platform of platformsToPublish) {
      const caption = captions[platform];
      if (!caption) continue;

      const platformExportPath =
        isVideoSocialPlatform(platform) && videoPath ? videoPath : exportPath;

      await upsertSocialPublication({
        articleId: candidate.articleId,
        platform,
        locale: config.locale,
        status: "exported",
        exportPath: platformExportPath,
        caption,
      });

      if (!config.publishNetworks) {
        console.log(
          `(${platform}: solo exportado — activa SOCIAL_AUTO_PUBLISH=true o SOCIAL_PUBLISH_NETWORKS=true)`,
        );
        continue;
      }

      console.log(`Publicando en ${platform}…`);

      const result = await publishToSocialNetwork({
        platform,
        caption,
        ...(isFeedImagePlatform(platform) ? { imagePath: exportPath } : {}),
        ...(isVideoSocialPlatform(platform) ? { videoPath } : {}),
        ...(platform === "youtube" ? { youtubeTitle: buildYoutubeTitle(candidate) } : {}),
        profileDir: profileDirForPlatform(platform, process.env),
        headed: config.headed,
        pauseOnErrorMs:
          config.headed && process.env.SOCIAL_INSTAGRAM_DEBUG?.trim()
            ? 120_000
            : config.headed
              ? 60_000
              : 0,
      });

      if (result.ok) {
        await upsertSocialPublication({
          articleId: candidate.articleId,
          platform,
          locale: config.locale,
          status: "posted",
          exportPath: platformExportPath,
          caption,
          ...(result.externalPostId ? { externalPostId: result.externalPostId } : {}),
          markPosted: true,
        });
        console.log(`✓ Posted on ${platform}`);
      } else {
        await upsertSocialPublication({
          articleId: candidate.articleId,
          platform,
          locale: config.locale,
          status: "failed",
          exportPath: platformExportPath,
          caption,
          errorMessage: result.error,
        });
        console.error(`✗ ${platform}: ${result.error}`);
      }
    }

    console.log("");
  }

  console.log("Done.");
  } catch (error) {
    console.error("[social:publish] fatal:", error instanceof Error ? error.message : error);
    throw error;
  }
}

if (isSocialPublishCliEntrypoint()) {
  runSocialPublish()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
