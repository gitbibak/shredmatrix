-- Profiles are projections of Auth accounts. Keep their registration date aligned
-- with the authoritative Auth timestamp so backfills never appear as new signups.
update public.profiles as profiles
set created_at = users.created_at
from auth.users as users
where profiles.id = users.id
  and profiles.created_at is distinct from users.created_at;
