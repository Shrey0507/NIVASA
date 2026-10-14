-- Additive only. Review live user_profiles columns before applying.
alter table public.user_profiles add column if not exists username text;
create unique index if not exists user_profiles_username_lower_unique
  on public.user_profiles (lower(username))
  where username is not null;
alter table public.user_profiles add constraint user_profiles_username_format
  check (username is null or username ~ '^[a-z0-9._-]{4,30}$');
