import api from './api';
import type { Exercise } from './exercise.types';
import type { StrengthTrend } from './exercise.types';

/**
 * Service for exercise-related API calls
 */
export const exerciseService = {
  /**
   * Search exercises by name or description
   * @param query - Search term
   */
  async searchExercises(query: string): Promise<Exercise[]> {
    const response = await api.get('/exercises', {
      params: { search: query }
    });
    return response.data;
  },

  /**
   * Get all exercises (with optional pagination)
   * @param limit - Optional limit
   * @param offset - Optional offset
   */
  async getExercises(limit?: number, offset?: number): Promise<Exercise[]> {
    const params: Record<string, string> = {};
    if (limit !== undefined) params.limit = limit.toString();
    if (offset !== undefined) params.offset = offset.toString();
    const response = await api.get('/exercises', { params });
    return response.data;
  },

  /**
   * Get strength trend for a specific exercise
   * @param exerciseId - The exercise ID
   * @param limit - Optional limit for number of data points (e.g., last 10 sessions)
   */
  async getStrengthTrend(exerciseId: string, limit?: number): Promise<StrengthTrend> {
    const params: Record<string, string> = {};
    if (limit !== undefined) params.limit = limit.toString();
    const response = await api.get(`/exercises/${exerciseId}/trend`, { params });
    return response.data;
  }
};

export default exerciseService;