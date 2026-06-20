import api from './api';
import type { WorkoutSession, WorkoutSet } from './session.types';
import type { SessionSummary } from './exercise.types';

/**
 * Service for session-related API calls
 */
export const sessionService = {
  /**
   * Create a new workout session
   * @param workoutId - The workout to base the session on
   */
  async createSession(workoutId: string): Promise<WorkoutSession> {
    const response = await api.post('/sessions', { workoutId });
    return response.data;
  },

  /**
   * Get a session by ID
   * @param sessionId - The session ID
   */
  async getSession(sessionId: string): Promise<WorkoutSession> {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Complete a session
   * @param sessionId - The session to complete
   */
  async completeSession(sessionId: string): Promise<WorkoutSession> {
    const response = await api.patch(`/sessions/${sessionId}/complete`);
    return response.data;
  },

  /**
   * Update a workout set within a session
   * @param sessionId - The session ID
   * @param sessionExerciseId - The session exercise ID
   * @param setId - The set ID to update
   * @param setData - Partial set data to update (weight, reps, etc.)
   */
  async updateWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    setId: string,
    setData: Partial<Omit<WorkoutSet, 'id' | 'sessionExerciseId'>>
  ): Promise<WorkoutSet> {
    const response = await api.put(
      `/sessions/${sessionId}/exercises/${sessionExerciseId}/sets/${setId}`,
      setData
    );
    return response.data;
  },

  /**
   * Get session history for the current user
   * @param limit - Optional limit for number of sessions to return
   * @param offset - Optional offset for pagination
   */
  async getSessionHistory(limit?: number, offset?: number): Promise<SessionSummary[]> {
    const params: Record<string, string> = {};
    if (limit !== undefined) params.limit = limit.toString();
    if (offset !== undefined) params.offset = offset.toString();
    const response = await api.get('/sessions/history', { params });
    return response.data;
  },

  /**
   * Get paginated workout sessions
   * @param limit - Number of sessions per page
   * @param offset - Offset for pagination
   */
  async getWorkoutSessions(limit: number, offset: number): Promise<SessionSummary[]> {
    const response = await api.get('/workout-sessions', {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
    return response.data;
  }
};

export default sessionService;