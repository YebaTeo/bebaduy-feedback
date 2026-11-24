-- BeBaduy Feedback schema for Supabase Postgres.
-- Applied as a migration to your Supabase project.

create table if not exists public.bebaduy_feedback (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  rating smallint not null check (rating between 1 and 5),
  category text not null check (category in ('bug', 'feature', 'culture', 'interaction', 'appreciation', 'other')),
  chapter text not null check (chapter in ('general', 'narawas', 'ngaseuk', 'ngored', 'mipit', 'ngalantai', 'ngaleuitkeun', 'koleksi')),
  message text not null check (char_length(message) between 5 and 2000),
  name text check (name is null or char_length(name) <= 80),
  email text check (email is null or char_length(email) <= 160),
  device_info text check (device_info is null or char_length(device_info) <= 120),
  app_version text check (app_version is null or char_length(app_version) <= 40),
  locale text not null default 'id' check (locale in ('id', 'en')),
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved', 'archived')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bebaduy_feedback_created_at
  on public.bebaduy_feedback (created_at desc);

create index if not exists idx_bebaduy_feedback_status_created_at
  on public.bebaduy_feedback (status, created_at desc);

create or replace function public.set_bebaduy_feedback_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bebaduy_feedback_updated_at on public.bebaduy_feedback;
create trigger trg_bebaduy_feedback_updated_at
  before update on public.bebaduy_feedback
  for each row
  execute function public.set_bebaduy_feedback_updated_at();

-- Enable Row Level Security and revoke direct public Data API privileges.
-- All public submissions and admin inbox reads/updates go through Next.js API
-- routes using the server-side SUPABASE_SECRET_KEY (never exposed to browsers),
-- preserving server-side rate limiting, honeypot spam checks, and inbox auth.
alter table public.bebaduy_feedback enable row level security;
revoke all on table public.bebaduy_feedback from anon, authenticated;
grant all on table public.bebaduy_feedback to service_role;
