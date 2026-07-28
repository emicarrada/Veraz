#!/usr/bin/env npx tsx
/**
 * Genera MP4 + caption y los envía por Telegram (TikTok / Reels manual).
 * No usa Playwright ni publica en TikTok.
 *
 * Usage: npm run social:deliver:video
 */
import path from "node:path";

import { buildSocialCaptions } from "@/features/social-publishing";
import { buildTikTokSoundSearchKeyword } from "@/features/social-publishing/build-tiktok-sound-search";
import { loadSocialVideoDeliveryConfig } from "@/features/social-publishing/load-video-delivery-config";
import { selectSocialCandidates } from "@/features/social-publishing/select-candidates";
import { sendTelegramVideoPackage } from "@/lib/social-publishing/deliver/send-telegram-video";
import { renderSocialReelForCandidate } from "@/lib/social-publishing/render-social-reel-for-candidate";
import {
  countDeliveredToday,
  pendingPlatformsForArticle,
  loadPublicationIndex,
  upsertSocialPublication,
} from "@/lib/social-publishing/social-publication-store";
import { writePlatformCaptionFiles } from "@/lib/social-publishing/write-caption-files";
import { createContentRepositories } from "@/lib/repositories/factory";
import { isSupabasePersistenceConfigured } from "@/lib/supabase";

function buildDeliveryMessage(input: {
  slug: string;
  tiktokCaption: string;
  reelsCaption?: string;
  soundKeyword?: string;
}): { copyCaption: string; notes: string } {
  const noteLines: string[] = [];
  if (input.soundKeyword) {
    noteLines.push(`🎵 TikTok → Sonidos → busca: ${input.soundKeyword}`);
  }
  if (input.reelsCaption && input.reelsCaption !== input.tiktokCaption) {
    noteLines.push("", "—— Reels (copiar) ——", input.reelsCaption);
  }
  noteLines.push("", `slug: ${input.slug}`);

  return {
    copyCaption: input.tiktokCaption.trim(),
    notes: noteLines.join("\n").trim(),
  };
}

async function main(): Promise<void> {
  console.log("[social:deliver:video] starting…");
  const delivery = loadSocialVideoDeliveryConfig();
  const config = delivery.base;

  if (!config.enabled) {
    console.log("SOCIAL_PUBLISHING_ENABLED is not true — exit.");
    process.exit(0);
  }

  if (delivery.channel !== "telegram") {
    console.log("SOCIAL_VIDEO_DELIVERY=none — exit.");
    process.exit(0);
  }

  if (!delivery.telegramBotToken || !delivery.telegramChatId) {
    console.error("Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env.local");
    process.exit(1);
  }

  if (!isSupabasePersistenceConfigured()) {
    console.error("Supabase not configured.");
    process.exit(1);
  }

  const deliveredToday = await countDeliveredToday("tiktok", config.publishTimeZone);
  if (deliveredToday >= delivery.maxDeliveriesPerDay) {
    console.log(
      `Cuota diaria de entregas TikTok alcanzada (${deliveredToday}/${delivery.maxDeliveriesPerDay}).`,
    );
    process.exit(0);
  }

  const repos = createContentRepositories();
  if (!repos?.articleRepository) {
    console.error("Article repository unavailable.");
    process.exit(1);
  }

  const publicationIndex = await loadPublicationIndex();
  const candidates = await selectSocialCandidates(repos.articleRepository, config);
  if (candidates.length === 0) {
    console.log("No hay candidatos de video pendientes.");
    process.exit(0);
  }

  const candidate = candidates[0]!;
  const pending = pendingPlatformsForArticle(candidate.articleId, ["tiktok"], publicationIndex);
  if (!pending.includes("tiktok")) {
    console.log("El candidato ya fue entregado o publicado en TikTok.");
    process.exit(0);
  }

  const captionPlatforms = delivery.includeInstagramReelsCaption
    ? (["tiktok", "instagram_reels"] as const)
    : (["tiktok"] as const);

  const captions = buildSocialCaptions(candidate, {
    locale: config.locale,
    platforms: [...captionPlatforms],
    globalHashtags: config.globalHashtags,
    includeExcerpt: config.includeExcerptInCaption,
  });

  const tiktokCaption = captions.tiktok;
  const reelsCaption = captions.instagram_reels;
  const soundKeyword = buildTikTokSoundSearchKeyword(candidate);

  console.log("—".repeat(60));
  console.log(`Slug: ${candidate.slug}`);
  console.log(`Sonido sugerido TikTok: "${soundKeyword}"`);
  console.log("\n[tiktok] caption:\n", tiktokCaption, "\n");

  console.log("Generando MP4…");
  const reel = await renderSocialReelForCandidate({
    candidate,
    assetsDir: config.assetsDir,
    exportsDir: config.exportsDir,
    projectRoot: path.resolve(import.meta.dirname, ".."),
    env: process.env,
  });
  console.log(`MP4: ${reel.mp4Path}`);

  if (config.writeCaptionFiles) {
    const files = await writePlatformCaptionFiles(config.exportsDir, candidate.slug, captions);
    for (const file of files) console.log(`Caption file: ${file}`);
  }

  const { copyCaption, notes } = buildDeliveryMessage({
    slug: candidate.slug,
    tiktokCaption,
    reelsCaption: delivery.includeInstagramReelsCaption ? reelsCaption : undefined,
    soundKeyword,
  });

  console.log("Enviando a Telegram…");
  const sent = await sendTelegramVideoPackage({
    botToken: delivery.telegramBotToken,
    chatId: delivery.telegramChatId,
    videoPath: reel.mp4Path,
    copyCaption,
    notes,
  });

  if (!sent.ok) {
    console.error(`✗ Telegram: ${sent.error}`);
    await upsertSocialPublication({
      articleId: candidate.articleId,
      platform: "tiktok",
      locale: config.locale,
      status: "failed",
      exportPath: reel.mp4Path,
      caption: tiktokCaption,
      errorMessage: sent.error,
    });
    process.exit(1);
  }

  await upsertSocialPublication({
    articleId: candidate.articleId,
    platform: "tiktok",
    locale: config.locale,
    status: "delivered",
    exportPath: reel.mp4Path,
    caption: tiktokCaption,
    markPosted: true,
  });

  console.log("✓ Video + descripción enviados por Telegram.");
  console.log(
    "Cuando lo publiques en TikTok: npm run social:mark-posted -- tiktok",
    candidate.slug,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
