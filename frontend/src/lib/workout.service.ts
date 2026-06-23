import api from './api';
import type { Workout, WorkoutExercise } from './workout.types';

export type WorkoutExerciseWithExercise = WorkoutExercise;

/**
 * Service for workout-related API calls
 */
export const workoutService = {
  /**
   * Get all workouts for the current user
   */
  async getWorkouts(): Promise<Workout[]> {
    const response = await api.get('/workouts');
    return response.data;
  },

  /**
   * Create a new workout
   * @param workoutData - Omit id and timestamps
   */
  async createWorkout(workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    const response = await api.post('/workouts', workoutData);
    return response.data;
  },

  /**
   * Get exercises for a workout with exercise details
   * @param workoutId - The workout ID
   */
  async getWorkoutExercises(workoutId: string): Promise<WorkoutExerciseWithExercise[]> {
    const response = await api.get(`/workouts/${workoutId}/exercises`);
    return response.data;
  },

  /**
   * Add an exercise to a workout
   * @param workoutId - The workout to add to
   * @param exerciseData - Omit id and workoutId (will be set by server)
   */
  async addWorkoutExercise(workoutId: string, exerciseData: Omit<WorkoutExercise, 'id' | 'workoutId'>): Promise<WorkoutExercise> {
    const response = await api.post(`/workouts/${workoutId}/exercises`, exerciseData);
    return response.data;
  }
};

export default workoutService;