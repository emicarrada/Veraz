-- Expand article topic slugs for specific tags (sports, figures, tech brands)

ALTER TABLE articles
  DROP CONSTRAINT IF EXISTS articles_category_slug_check;

ALTER TABLE articles
  ADD CONSTRAINT articles_category_slug_check
  CHECK (category_slug IN (
    'politica',
    'sheinbaum',
    'economia',
    'internacional',
    'trump',
    'deportes',
    'futbol',
    'nba',
    'rugby',
    'messi',
    'ronaldo',
    'sociedad',
    'unam',
    'cultura',
    'tecnologia',
    'openai',
    'google',
    'inteligencia-artificial',
    'general'
  ));
