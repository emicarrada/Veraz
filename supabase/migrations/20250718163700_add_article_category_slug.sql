-- Add article category slug for feed filters and fallback images

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS category_slug TEXT NOT NULL DEFAULT 'general';

ALTER TABLE articles
  DROP CONSTRAINT IF EXISTS articles_category_slug_check;

ALTER TABLE articles
  ADD CONSTRAINT articles_category_slug_check
  CHECK (category_slug IN (
    'politica',
    'economia',
    'deportes',
    'internacional',
    'sociedad',
    'cultura',
    'tecnologia',
    'general'
  ));

CREATE INDEX IF NOT EXISTS articles_category_published_idx
  ON articles (category_slug, published_at DESC);
