-- Veraz — initial content schema (Article, Source, Media, Reference)
-- Idempotency: unique url_fingerprint on articles

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Catalog: languages (seed)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  CONSTRAINT languages_code_unique UNIQUE (code)
);

INSERT INTO languages (code, name) VALUES
  ('es', 'Spanish'),
  ('en', 'English'),
  ('pt', 'Portuguese'),
  ('fr', 'French'),
  ('de', 'German')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Catalog: sources
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  homepage_url TEXT NOT NULL,
  feed_url TEXT,
  logo_media_id UUID,
  default_language_id UUID REFERENCES languages(id),
  country_id UUID,
  trust_tier TEXT NOT NULL DEFAULT 'unrated'
    CHECK (trust_tier IN ('high', 'medium', 'low', 'unrated')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'suspended', 'archived')),
  attribution_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sources_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS sources_status_idx ON sources (status);

-- ---------------------------------------------------------------------------
-- Content: articles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id),
  slug TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  url_fingerprint TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body_excerpt TEXT,
  content_format TEXT NOT NULL
    CHECK (content_format IN ('text', 'image', 'video', 'audio', 'mixed')),
  language_id UUID NOT NULL REFERENCES languages(id),
  primary_country_id UUID,
  published_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'ingested'
    CHECK (status IN ('ingested', 'published', 'unpublished', 'archived', 'withdrawn')),
  paywall_original BOOLEAN NOT NULL DEFAULT false,
  hero_media_id UUID,
  byline TEXT,
  CONSTRAINT articles_url_fingerprint_unique UNIQUE (url_fingerprint),
  CONSTRAINT articles_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS articles_source_published_idx
  ON articles (source_id, published_at DESC);

CREATE INDEX IF NOT EXISTS articles_status_published_idx
  ON articles (status, published_at DESC);

-- ---------------------------------------------------------------------------
-- Content: media
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  storage_key TEXT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  alt_text TEXT,
  credit TEXT,
  license TEXT,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS media_article_id_idx ON media (article_id);

-- Hero media FK (added after media table exists)
ALTER TABLE articles
  DROP CONSTRAINT IF EXISTS articles_hero_media_id_fkey;

ALTER TABLE articles
  ADD CONSTRAINT articles_hero_media_id_fkey
  FOREIGN KEY (hero_media_id) REFERENCES media(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Content: references (domain Reference)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS article_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  publisher_name TEXT,
  kind TEXT NOT NULL
    CHECK (kind IN ('original', 'primary_source', 'supporting', 'correction')),
  accessed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS article_references_article_id_idx
  ON article_references (article_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for sources
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sources_set_updated_at ON sources;
CREATE TRIGGER sources_set_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS articles_set_updated_at ON articles;
CREATE TRIGGER articles_set_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
