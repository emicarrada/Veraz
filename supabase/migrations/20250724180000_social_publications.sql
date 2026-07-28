-- Tracks social posts per article/platform (idempotency for X/IG/TikTok workers).
CREATE TABLE IF NOT EXISTS social_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('x', 'instagram', 'tiktok')),
  locale TEXT NOT NULL CHECK (locale IN ('es', 'en')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'exported', 'posted', 'failed')),
  export_path TEXT,
  caption TEXT,
  external_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  posted_at TIMESTAMPTZ,
  UNIQUE (article_id, platform)
);

CREATE INDEX IF NOT EXISTS social_publications_status_idx ON social_publications (status);
CREATE INDEX IF NOT EXISTS social_publications_article_id_idx ON social_publications (article_id);

ALTER TABLE social_publications ENABLE ROW LEVEL SECURITY;

-- No public policies: service_role only (same pattern as writes elsewhere).
