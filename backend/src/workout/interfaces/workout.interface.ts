export interface Workout {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string; // Reference to exercise table
  createdAt: string;
}

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  reps: number;
  weight: number | null;
  rpe: number | null;
  notes: string | null;
  createdAt: string;
}