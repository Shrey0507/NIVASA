-- Additive only. Never reset existing profiles or authentication users.
alter table public.user_profiles add column if not exists username text;
alter table public.user_profiles add column if not exists email text;
alter table public.user_profiles add column if not exists full_name text;
alter table public.user_profiles add column if not exists student_id uuid;
alter table public.user_profiles add column if not exists hostel text;
alter table public.user_profiles add column if not exists status text default 'active';
create unique index if not exists user_profiles_username_lower_unique
  on public.user_profiles (lower(username))
  where username is not null;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'user_profiles_username_format') then
    alter table public.user_profiles add constraint user_profiles_username_format
      check (username is null or username ~ '^[a-z0-9._-]{4,30}$');
  end if;
end $$;
create index if not exists user_profiles_student_id_idx on public.user_profiles(student_id);
create index if not exists user_profiles_hostel_idx on public.user_profiles(hostel);
