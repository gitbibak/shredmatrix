-- Reviewers can choose to be shown by name ("Ayşe K.") instead of anonymously.
-- Null keeps the review anonymous; existing reviews were consented as
-- anonymous and stay null.
alter table public.testimonials
  add column if not exists display_name text
  check (display_name is null or char_length(btrim(display_name)) between 2 and 40);
