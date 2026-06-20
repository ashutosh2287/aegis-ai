import type { Workout } from './workout.types';

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // Relationship: the workout that was performed
  workout?: Workout;
  // Relationship: the exercises performed in this session (with their sets)
  sessionExercises?: SessionExercise[];
}

export interface SessionExercise {
  id: string;
  workoutSessionId: string;
  workoutExerciseId: string; // references the template from the workout
  // Order in the session
  order: number;
  // Actual performed sets
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  sessionExerciseId: string;
  // Set number within the exercise
  setNumber: number;
  weight: number; // in kg or lbs, depending on user preference
  reps: number;
  // Optional: RPE, rest time, etc.
  rpe?: number;
  restTime?: number; // in seconds
  createdAt: string;
}