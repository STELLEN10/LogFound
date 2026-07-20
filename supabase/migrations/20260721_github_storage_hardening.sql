-- Idempotent GitHub storage bootstrap for demo sessions and Vercel deployments.
-- Run this after 20260718_github_connections.sql and 20260720_demo_auth_users.sql.

create table if not exists public.logfound_users (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.github_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  github_user_id bigint not null,
  github_login text not null,
  avatar_url text,
  encrypted_access_token text not null,
  scopes text[] not null default '{}',
  reauth_required boolean not null default false,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.github_project_repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  connection_id uuid not null references public.github_connections(id) on delete cascade,
  project_key text not null check (char_length(project_key) between 1 and 120),
  repository_id bigint not null,
  repository_full_name text not null,
  repository_name text not null,
  repository_owner text not null,
  description text,
  is_private boolean not null,
  visibility text not null check (visibility in ('public', 'private', 'internal')),
  primary_language text,
  default_branch text not null,
  updated_at_github timestamptz not null,
  pushed_at_github timestamptz,
  html_url text not null,
  stars_count integer not null default 0,
  avatar_url text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_key, repository_id)
);

alter table public.github_connections drop constraint if exists github_connections_user_id_fkey;
alter table public.github_project_repositories drop constraint if exists github_project_repositories_user_id_fkey;
alter table public.github_project_repositories drop constraint if exists github_project_repositories_connection_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'github_connections_user_id_fkey'
  ) then
    alter table public.github_connections
      add constraint github_connections_user_id_fkey
      foreign key (user_id) references public.logfound_users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'github_project_repositories_user_id_fkey'
  ) then
    alter table public.github_project_repositories
      add constraint github_project_repositories_user_id_fkey
      foreign key (user_id) references public.logfound_users(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'github_project_repositories_connection_id_fkey'
  ) then
    alter table public.github_project_repositories
      add constraint github_project_repositories_connection_id_fkey
      foreign key (connection_id) references public.github_connections(id) on delete cascade;
  end if;
end $$;

create index if not exists github_project_repositories_user_project_idx
  on public.github_project_repositories (user_id, project_key);

alter table public.logfound_users enable row level security;
alter table public.github_connections enable row level security;
alter table public.github_project_repositories enable row level security;

revoke all on table public.logfound_users from anon, authenticated;
revoke all on table public.github_connections from anon, authenticated;
revoke all on table public.github_project_repositories from anon, authenticated;
grant all on table public.logfound_users to service_role;
grant all on table public.github_connections to service_role;
grant all on table public.github_project_repositories to service_role;
