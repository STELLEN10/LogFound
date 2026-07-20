-- Demo username/password sessions use stable workspace identities rather than Supabase email identities.
create table if not exists public.logfound_users (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.logfound_users enable row level security;
revoke all on table public.logfound_users from anon, authenticated;
grant all on table public.logfound_users to service_role;

-- Preserve existing Supabase users when migrating an installation that used the original FK.
insert into public.logfound_users (id, username, display_name)
select id, coalesce(nullif(split_part(email, '@', 1), ''), id::text), coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), split_part(email, '@', 1), id::text)
from auth.users
on conflict (id) do nothing;

alter table public.github_connections drop constraint if exists github_connections_user_id_fkey;
alter table public.github_project_repositories drop constraint if exists github_project_repositories_user_id_fkey;
alter table public.github_connections add constraint github_connections_user_id_fkey foreign key (user_id) references public.logfound_users(id) on delete cascade;
alter table public.github_project_repositories add constraint github_project_repositories_user_id_fkey foreign key (user_id) references public.logfound_users(id) on delete cascade;
