-- Veraz — enable RLS with public read-only policies for content tables.
-- Writes remain service_role only (bypasses RLS).

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_references ENABLE ROW LEVEL SECURITY;

-- Catalog languages: public read (reference data).
DROP POLICY IF EXISTS languages_public_read ON languages;
CREATE POLICY languages_public_read ON languages
  FOR SELECT
  USING (true);

-- Active sources only.
DROP POLICY IF EXISTS sources_public_read ON sources;
CREATE POLICY sources_public_read ON sources
  FOR SELECT
  USING (status = 'active');

-- Published articles only.
DROP POLICY IF EXISTS articles_public_read ON articles;
CREATE POLICY articles_public_read ON articles
  FOR SELECT
  USING (status = 'published');

-- Media linked to published articles.
DROP POLICY IF EXISTS media_public_read ON media;
CREATE POLICY media_public_read ON media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM articles a
      WHERE a.status = 'published'
        AND (a.id = media.article_id OR a.hero_media_id = media.id)
    )
  );

-- References linked to published articles.
DROP POLICY IF EXISTS article_references_public_read ON article_references;
CREATE POLICY article_references_public_read ON article_references
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM articles a
      WHERE a.id = article_references.article_id
        AND a.status = 'published'
    )
  );
