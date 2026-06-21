-- Create profiles table (matches UserProfile interface in auth.interface.ts)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  training_years integer default 0,
  primary_goal text,
  experience_level text default 'beginner',
  preferred_units text default 'metric',
  timezone text default 'UTC',
  notification_preferences jsonb default '{"email": true, "push": true, "workout_reminder": true}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: service role bypasses RLS, but these are here for client-side usage
create policy "Service role can manage profiles"
  on public.profiles for all
  using (true)
  with check (true);

-- Index for faster lookups
create index if not exists profiles_username_idx on public.profiles (username);

-- Create refresh_tokens table (used by token.service.ts)
create table if not exists public.refresh_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Index for faster lookups by user_id
create index if not exists refresh_tokens_user_id_idx on public.refresh_tokens (user_id);
create index if not exists refresh_tokens_expires_at_idx on public.refresh_tokens (expires_at);
