import type { Exercise } from './exercise.types';
import type { WorkoutSet } from './session.types';

export interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Relationship: array of workout exercises
  workoutExercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  // Order in the workout
  order: number;
  // Optional: default sets, reps, weight for this exercise in the workout template
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  // Relationships
  exercise?: Exercise;
  sets?: WorkoutSet[];
}