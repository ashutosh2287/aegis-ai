import { Exercise } from "@/exercise/interfaces/exercise.interface";

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface WorkoutExerciseWithExercise extends WorkoutExercise {
  exercise: Exercise;
}
