-- Add foreign key constraints for workout_exercises if they don't exist
-- These tables were created outside of migrations and may be missing FK constraints

-- Ensure workout_exercises.workout_id references workout_sessions.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workout_exercises_workout_id_fkey'
  ) THEN
    ALTER TABLE public.workout_exercises
      ADD CONSTRAINT workout_exercises_workout_id_fkey
      FOREIGN KEY (workout_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure workout_sets.workout_exercise_id references workout_exercises.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workout_sets_workout_exercise_id_fkey'
  ) THEN
    ALTER TABLE public.workout_sets
      ADD CONSTRAINT workout_sets_workout_exercise_id_fkey
      FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Reload PostgREST schema cache
SELECT notify pgrst, 'reload schema';
