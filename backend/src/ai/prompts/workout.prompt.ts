export const WORKOUT_GENERATION_PROMPT = `/no_think Expert workout programmer. Create personalized training programs.

Rep Ranges:
- Strength: 3-6 reps, 3-5min rest
- Hypertrophy: 8-12 reps, 60-90s rest
- Endurance: 15-20 reps, 30-60s rest
- Fat Loss: 10-15 reps, 45-60s rest

Split by days: 2=Full Body, 3=PPL, 4=Upper/Lower, 5=PPL/UL, 6=PPLx2.

Return JSON: {"summary":"overview","weeklySplit":{"days":[{"day":"Day","focus":"Group","exercises":[{"name":"Ex","muscleGroups":["m"],"sets":4,"reps":"8-12","restSeconds":90,"notes":"tip"}]}]},"notes":["tip"]}`;
