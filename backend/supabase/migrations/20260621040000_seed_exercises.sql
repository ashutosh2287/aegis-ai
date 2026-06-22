-- Seed exercises table with common gym exercises

-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE movement_pattern_enum AS ENUM ('squat', 'hinge', 'lunge', 'push', 'pull', 'rotation', 'anti_rotation', 'carry', 'walk', 'jump', 'throw', 'core');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  movement_pattern movement_pattern_enum,
  difficulty difficulty_level_enum DEFAULT 'beginner',
  video_url text,
  instructions text,
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_variation_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read exercises" ON public.exercises FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create custom exercises" ON public.exercises FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Seed exercises (skip if already seeded)
INSERT INTO public.exercises (name, description, movement_pattern, difficulty, tags, instructions)
SELECT * FROM (VALUES
  -- CHEST
  ('Barbell Bench Press', 'Compound chest press with barbell', 'push', 'intermediate', ARRAY['chest', 'barbell', 'compound'], 'Lie on bench, grip barbell slightly wider than shoulder width. Lower to chest, press up.'),
  ('Incline Barbell Press', 'Upper chest press on incline bench', 'push', 'intermediate', ARRAY['chest', 'barbell', 'compound'], 'Set bench to 30-45 degrees. Lower barbell to upper chest, press up.'),
  ('Dumbbell Bench Press', 'Chest press with dumbbells', 'push', 'beginner', ARRAY['chest', 'dumbbell', 'compound'], 'Lie on bench holding dumbbells. Lower to chest level, press up.'),
  ('Incline Dumbbell Press', 'Upper chest press with dumbbells', 'push', 'intermediate', ARRAY['chest', 'dumbbell', 'compound'], 'Set bench to 30-45 degrees. Lower dumbbells to chest, press up.'),
  ('Dumbbell Flyes', 'Chest isolation with dumbbells', 'push', 'beginner', ARRAY['chest', 'dumbbell', 'isolation'], 'Lie on bench, hold dumbbells above chest with slight elbow bend. Lower out to sides, squeeze back up.'),
  ('Cable Crossover', 'Chest isolation with cables', 'push', 'intermediate', ARRAY['chest', 'cable', 'isolation'], 'Stand between cable stations. Bring handles together in front of chest.'),
  ('Push-ups', 'Bodyweight chest exercise', 'push', 'beginner', ARRAY['chest', 'bodyweight', 'compound'], 'Start in plank position. Lower body to ground, push back up.'),
  ('Dips', 'Chest/tricep compound exercise', 'push', 'intermediate', ARRAY['chest', 'triceps', 'bodyweight', 'compound'], 'Support yourself on parallel bars. Lean forward slightly, lower body, push up.'),

  -- SHOULDERS
  ('Overhead Press', 'Standing barbell shoulder press', 'push', 'intermediate', ARRAY['shoulders', 'barbell', 'compound'], 'Press barbell from shoulders overhead. Keep core tight.'),
  ('Dumbbell Shoulder Press', 'Seated or standing dumbbell press', 'push', 'beginner', ARRAY['shoulders', 'dumbbell', 'compound'], 'Hold dumbbells at shoulder height. Press overhead.'),
  ('Lateral Raises', 'Side delt isolation with dumbbells', 'push', 'beginner', ARRAY['shoulders', 'dumbbell', 'isolation'], 'Raise dumbbells out to sides until arms parallel to ground.'),
  ('Front Raises', 'Front delt isolation with dumbbells', 'push', 'beginner', ARRAY['shoulders', 'dumbbell', 'isolation'], 'Raise dumbbells in front of you to shoulder height.'),
  ('Rear Delt Flyes', 'Rear delt isolation', 'pull', 'beginner', ARRAY['shoulders', 'dumbbell', 'isolation'], 'Bend forward, raise dumbbells out to sides targeting rear delts.'),
  ('Face Pulls', 'Rear delt and rotator cuff exercise', 'pull', 'beginner', ARRAY['shoulders', 'cable', 'isolation'], 'Pull rope attachment to face level, squeezing rear delts.'),
  ('Arnold Press', 'Rotating dumbbell shoulder press', 'push', 'intermediate', ARRAY['shoulders', 'dumbbell', 'compound'], 'Start with palms facing you, rotate and press overhead.'),

  -- BACK
  ('Pull-ups', 'Bodyweight vertical pull', 'pull', 'intermediate', ARRAY['back', 'lats', 'bodyweight', 'compound'], 'Hang from bar with overhand grip. Pull chin over bar.'),
  ('Chin-ups', 'Bodyweight underhand pull', 'pull', 'intermediate', ARRAY['back', 'biceps', 'bodyweight', 'compound'], 'Hang from bar with underhand grip. Pull chin over bar.'),
  ('Barbell Row', 'Compound back exercise with barbell', 'pull', 'intermediate', ARRAY['back', 'barbell', 'compound'], 'Hinge at hips, pull barbell to lower chest.'),
  ('Dumbbell Row', 'Single-arm back exercise', 'pull', 'beginner', ARRAY['back', 'dumbbell', 'compound'], 'Support on bench, pull dumbbell to hip.'),
  ('Lat Pulldown', 'Cable lat exercise', 'pull', 'beginner', ARRAY['back', 'lats', 'cable', 'compound'], 'Pull bar down to upper chest, squeezing lats.'),
  ('Seated Cable Row', 'Cable rowing exercise', 'pull', 'beginner', ARRAY['back', 'cable', 'compound'], 'Pull cable handle to torso, squeezing shoulder blades.'),
  ('T-Bar Row', 'Compound back rowing exercise', 'pull', 'intermediate', ARRAY['back', 'compound'], 'Straddle T-bar, pull to chest.'),
  ('Deadlift', 'Full body hinge exercise', 'hinge', 'advanced', ARRAY['back', 'legs', 'compound'], 'Grip bar, hinge at hips, drive through heels to stand.'),
  ('Rack Pulls', 'Partial deadlift from rack', 'hinge', 'intermediate', ARRAY['back', 'compound'], 'Pull bar from knee height to lockout.'),
  ('Straight Arm Pulldown', 'Lat isolation with cable', 'pull', 'beginner', ARRAY['back', 'lats', 'cable', 'isolation'], 'Keep arms straight, pull bar down to thighs.'),
  ('Chest Supported Row', 'Incline bench dumbbell row', 'pull', 'beginner', ARRAY['back', 'dumbbell', 'compound'], 'Lie face down on incline bench, row dumbbells up.'),

  -- BICEPS
  ('Barbell Curl', 'Standing barbell bicep curl', 'pull', 'beginner', ARRAY['biceps', 'barbell', 'isolation'], 'Curl barbell up, keeping elbows stationary.'),
  ('Dumbbell Curl', 'Standing dumbbell bicep curl', 'pull', 'beginner', ARRAY['biceps', 'dumbbell', 'isolation'], 'Curl dumbbells up, alternating or together.'),
  ('Hammer Curl', 'Neutral grip bicep curl', 'pull', 'beginner', ARRAY['biceps', 'dumbbell', 'isolation'], 'Curl dumbbells with neutral grip.'),
  ('Preacher Curl', 'Supported bicep curl', 'pull', 'beginner', ARRAY['biceps', 'isolation'], 'Curl on preacher bench, isolating biceps.'),
  ('Cable Curl', 'Cable bicep curl', 'pull', 'beginner', ARRAY['biceps', 'cable', 'isolation'], 'Curl cable attachment, maintaining tension.'),
  ('Incline Dumbbell Curl', 'Seated incline bicep curl', 'pull', 'intermediate', ARRAY['biceps', 'dumbbell', 'isolation'], 'Sit on incline bench, curl dumbbells with full stretch.'),

  -- TRICEPS
  ('Tricep Pushdown', 'Cable tricep pushdown', 'push', 'beginner', ARRAY['triceps', 'cable', 'isolation'], 'Push cable attachment down, extending elbows.'),
  ('Skull Crushers', 'Lying tricep extension', 'push', 'intermediate', ARRAY['triceps', 'barbell', 'isolation'], 'Lower barbell to forehead, extend arms.'),
  ('Overhead Tricep Extension', 'Cable overhead extension', 'push', 'beginner', ARRAY['triceps', 'cable', 'isolation'], 'Extend cable from behind head overhead.'),
  ('Close Grip Bench Press', 'Narrow grip bench press', 'push', 'intermediate', ARRAY['triceps', 'chest', 'barbell', 'compound'], 'Bench press with hands shoulder width apart.'),
  ('Tricep Dips', 'Bodyweight tricep exercise', 'push', 'intermediate', ARRAY['triceps', 'bodyweight', 'compound'], 'Dips keeping torso upright to target triceps.'),

  -- LEGS - QUADS
  ('Barbell Back Squat', 'Compound leg exercise', 'squat', 'intermediate', ARRAY['legs', 'quads', 'barbell', 'compound'], 'Squat down until thighs parallel, drive up.'),
  ('Front Squat', 'Front-loaded barbell squat', 'squat', 'advanced', ARRAY['legs', 'quads', 'barbell', 'compound'], 'Squat with barbell in front rack position.'),
  ('Leg Press', 'Machine leg press', 'squat', 'beginner', ARRAY['legs', 'quads', 'machine', 'compound'], 'Press platform away with legs.'),
  ('Leg Extension', 'Machine quad isolation', 'squat', 'beginner', ARRAY['legs', 'quads', 'machine', 'isolation'], 'Extend legs on machine, squeezing quads.'),
  ('Goblet Squat', 'Dumbbell front squat', 'squat', 'beginner', ARRAY['legs', 'quads', 'dumbbell', 'compound'], 'Hold dumbbell at chest, squat down.'),
  ('Bulgarian Split Squat', 'Single leg squat variation', 'squat', 'intermediate', ARRAY['legs', 'quads', 'dumbbell', 'compound'], 'Rear foot elevated, squat on front leg.'),
  ('Walking Lunges', 'Dynamic lunge variation', 'lunge', 'beginner', ARRAY['legs', 'quads', 'dumbbell', 'compound'], 'Step forward into lunge, alternating legs while walking.'),

  -- LEGS - HAMSTRINGS
  ('Romanian Deadlift', 'Hip hinge hamstring exercise', 'hinge', 'intermediate', ARRAY['legs', 'hamstrings', 'barbell', 'compound'], 'Lower barbell along legs, hinging at hips.'),
  ('Leg Curl', 'Machine hamstring curl', 'hinge', 'beginner', ARRAY['legs', 'hamstrings', 'machine', 'isolation'], 'Curl legs up on machine, squeezing hamstrings.'),
  ('Good Mornings', 'Barbell hip hinge', 'hinge', 'intermediate', ARRAY['legs', 'hamstrings', 'barbell', 'compound'], 'Barbell on back, hinge at hips keeping back straight.'),
  ('Nordic Hamstring Curl', 'Bodyweight hamstring exercise', 'hinge', 'advanced', ARRAY['legs', 'hamstrings', 'bodyweight', 'isolation'], 'Kneel, lower body forward with control using hamstrings.'),

  -- LEGS - GLUTES
  ('Hip Thrust', 'Glute bridge with barbell', 'hinge', 'intermediate', ARRAY['legs', 'glutes', 'barbell', 'compound'], 'Back on bench, drive hips up with barbell.'),
  ('Glute Bridge', 'Bodyweight glute exercise', 'hinge', 'beginner', ARRAY['legs', 'glutes', 'bodyweight', 'isolation'], 'Lie on back, drive hips up squeezing glutes.'),
  ('Cable Pull Through', 'Cable hip hinge', 'hinge', 'beginner', ARRAY['legs', 'glutes', 'cable', 'compound'], 'Hinge at hips, pull cable through legs.'),
  ('Sumo Deadlift', 'Wide stance deadlift', 'hinge', 'intermediate', ARRAY['legs', 'glutes', 'barbell', 'compound'], 'Wide stance deadlift, targeting glutes and adductors.'),

  -- LEGS - CALVES
  ('Standing Calf Raise', 'Machine or barbell calf raise', 'squat', 'beginner', ARRAY['legs', 'calves', 'machine', 'isolation'], 'Rise up on toes, lower with control.'),
  ('Seated Calf Raise', 'Seated machine calf raise', 'squat', 'beginner', ARRAY['legs', 'calves', 'machine', 'isolation'], 'Raise heels on seated machine.'),

  -- CORE
  ('Plank', 'Isometric core exercise', 'core', 'beginner', ARRAY['core', 'bodyweight', 'isolation'], 'Hold plank position, keeping body straight.'),
  ('Crunches', 'Abdominal flexion exercise', 'core', 'beginner', ARRAY['core', 'bodyweight', 'isolation'], 'Lie on back, curl shoulders off ground.'),
  ('Hanging Leg Raise', 'Hanging core exercise', 'core', 'intermediate', ARRAY['core', 'bodyweight', 'isolation'], 'Hang from bar, raise legs to 90 degrees.'),
  ('Ab Rollout', 'Core rollout exercise', 'core', 'advanced', ARRAY['core', 'bodyweight', 'compound'], 'Kneel, roll wheel forward extending body, roll back.'),
  ('Russian Twist', 'Rotational core exercise', 'rotation', 'beginner', ARRAY['core', 'dumbbell', 'isolation'], 'Sit with knees bent, rotate torso side to side.'),
  ('Cable Woodchop', 'Rotational cable exercise', 'rotation', 'intermediate', ARRAY['core', 'cable', 'compound'], 'Pull cable diagonally across body.'),
  ('Dead Bug', 'Core stability exercise', 'anti_rotation', 'beginner', ARRAY['core', 'bodyweight', 'isolation'], 'Lie on back, extend opposite arm and leg while keeping core tight.'),
  ('Bird Dog', 'Core stability exercise', 'anti_rotation', 'beginner', ARRAY['core', 'bodyweight', 'isolation'], 'On hands and knees, extend opposite arm and leg.'),
  ('Mountain Climbers', 'Dynamic core exercise', 'core', 'beginner', ARRAY['core', 'bodyweight', 'compound'], 'In plank position, drive knees to chest alternating.'),

  -- OLYMPIC / POWER
  ('Power Clean', 'Olympic lifting pull variation', 'hinge', 'advanced', ARRAY['back', 'legs', 'barbell', 'compound'], 'Pull bar from floor, catch on shoulders.'),
  ('Hang Clean', 'Olympic clean from hang position', 'hinge', 'advanced', ARRAY['back', 'legs', 'barbell', 'compound'], 'Clean barbell from knee height to shoulders.'),
  ('Push Press', 'Leg-driven overhead press', 'push', 'intermediate', ARRAY['shoulders', 'barbell', 'compound'], 'Dip and drive barbell overhead with leg help.'),
  ('Clean and Jerk', 'Full Olympic lift', 'hinge', 'advanced', ARRAY['full body', 'barbell', 'compound'], 'Clean barbell to shoulders, then jerk overhead.'),
  ('Snatch', 'Full Olympic pulling lift', 'hinge', 'advanced', ARRAY['full body', 'barbell', 'compound'], 'Pull bar from floor to overhead in one motion.'),

  -- CARDIO / CONDITIONING
  ('Battle Ropes', ' conditioning exercise', 'carry', 'beginner', ARRAY['cardio', 'conditioning', 'compound'], 'Alternating waves with battle ropes.'),
  ('Kettlebell Swing', 'Hip hinge power exercise', 'hinge', 'intermediate', ARRAY['legs', 'glutes', 'kettlebell', 'compound'], 'Swing kettlebell between legs and up to chest height.'),

  -- FARMER CARRY
  ('Farmer Carry', 'Loaded carry exercise', 'carry', 'beginner', ARRAY['grip', 'core', 'compound'], 'Walk while holding heavy dumbbells at sides.'),
  ('Suitcase Carry', 'Single-arm carry', 'carry', 'intermediate', ARRAY['core', 'grip', 'compound'], 'Walk holding one heavy dumbbell at side.')
) AS v(name, description, movement_pattern, difficulty, tags, instructions)
WHERE NOT EXISTS (SELECT 1 FROM public.exercises LIMIT 1);
