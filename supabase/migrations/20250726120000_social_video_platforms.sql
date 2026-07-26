-- TikTok, Instagram Reels, YouTube Shorts (separate rows from feed x/instagram).
ALTER TABLE social_publications
  DROP CONSTRAINT IF EXISTS social_publications_platform_check;

ALTER TABLE social_publications
  ADD CONSTRAINT social_publications_platform_check
  CHECK (platform IN ('x', 'instagram', 'tiktok', 'instagram_reels', 'youtube'));
