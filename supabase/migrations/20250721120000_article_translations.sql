-- Cached article translations for locale-specific display (read layer; original ingestion unchanged).
CREATE TABLE IF NOT EXISTS article_translations (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es', 'en')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body_excerpt TEXT,
  source_locale TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'ai' CHECK (provider IN ('ai', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, locale)
);

CREATE INDEX IF NOT EXISTS article_translations_locale_idx ON article_translations (locale);

ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;

-- Public read when parent article is visible in feed statuses.
CREATE POLICY article_translations_public_read ON article_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles a
      WHERE a.id = article_translations.article_id
        AND a.status IN ('ingested', 'published')
    )
  );

-- Writes only via service_role (no policy for anon/authenticated insert/update).
