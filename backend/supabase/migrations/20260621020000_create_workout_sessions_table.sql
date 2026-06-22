create table if not exists public.workout_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workout_id uuid not null,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

alter table public.workout_sessions enable row level security;

create policy "Service role can manage workout_sessions"
  on public.workout_sessions for all
  using (true)
  with check (true);

create index if not exists workout_sessions_user_id_idx on public.workout_sessions (user_id);
create index if not exists workout_sessions_workout_id_idx on public.workout_sessions (workout_id);
create index if not exists workout_sessions_status_idx on public.workout_sessions (status);
create index if not exists workout_sessions_started_at_idx on public.workout_sessions (started_at);

notify pgrst, 'reload schema';
