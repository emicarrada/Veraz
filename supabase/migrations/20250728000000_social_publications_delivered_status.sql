-- Manual handoff (e.g. Telegram): video exported and sent to operator, not auto-posted.
ALTER TABLE social_publications
  DROP CONSTRAINT IF EXISTS social_publications_status_check;

ALTER TABLE social_publications
  ADD CONSTRAINT social_publications_status_check
  CHECK (status IN ('pending', 'exported', 'posted', 'failed', 'delivered'));
