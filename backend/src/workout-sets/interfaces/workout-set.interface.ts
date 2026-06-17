export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  reps: number;
  weight: number | null;
  rpe: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}