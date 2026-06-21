-- Add onboarding fields to profiles table

-- Create enums for onboarding fields
create type experience_level_enum as enum ('new', 'few_months', 'one_year', 'years', 'competitor');
create type weight_unit_enum as enum ('metric', 'imperial');

-- Add new columns to profiles
alter table public.profiles
  add column if not exists goals text[] default '{}',
  add column if not exists equipment text[] default '{}',
  add column if not exists experience_level experience_level_enum default 'new',
  add column if not exists target_days_per_week integer,
  add column if not exists weight numeric,
  add column if not exists weight_unit weight_unit_enum default 'metric',
  add column if not exists referral_source text,
  add column if not exists onboarding_completed_at timestamptz;

-- Migrate existing experience_level text data to enum where possible
-- 'beginner' maps to 'new', everything else stays as-is if valid
update public.profiles
  set experience_level = 'new'::experience_level_enum
  where experience_level = 'beginner';

-- Migrate existing preferred_units text data to enum
update public.profiles
  set weight_unit = 'metric'::weight_unit_enum
  where preferred_units = 'metric';

update public.profiles
  set weight_unit = 'imperial'::weight_unit_enum
  where preferred_units = 'imperial';

-- Add an index for fast onboarding status checks
create index if not exists profiles_onboarding_completed_at_idx
  on public.profiles (onboarding_completed_at)
  where onboarding_completed_at is not null;
