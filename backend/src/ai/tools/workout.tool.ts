import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { WorkoutHistoryContext, WorkoutSummary, VolumeMetrics } from '../interfaces/user-context.interface';

@Injectable()
export class WorkoutTool {
  private readonly logger = new Logger(WorkoutTool.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getWorkoutHistory(userId: string): Promise<WorkoutHistoryContext> {
    try {
      const recentWorkouts = await this.getRecentWorkouts(userId);
      const trainingFrequency = await this.getTrainingFrequency(userId);
      const volumeMetrics = await this.getVolumeMetrics(userId);

      return {
        recentWorkouts,
        trainingFrequency,
        volumeMetrics,
      };
    } catch (error) {
      this.logger.error(`Error in getWorkoutHistory: ${(error as Error).message}`);
      return {
        recentWorkouts: [],
        trainingFrequency: 0,
        volumeMetrics: {
          weeklyVolume: 0,
          monthlyVolume: 0,
          averageVolumePerWorkout: 0,
          totalWorkouts: 0,
        },
      };
    }
  }

  private async getRecentWorkouts(userId: string): Promise<WorkoutSummary[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions, error: sessionsError } = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id, workout_id, started_at, completed_at, duration_seconds')
      .eq('user_id', userId)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .is('deleted_at', null)
      .order('started_at', { ascending: false })
      .limit(10);

    if (sessionsError || !sessions) {
      this.logger.error(`Failed to fetch workout sessions: ${sessionsError?.message}`);
      return [];
    }

    const workouts: WorkoutSummary[] = [];

    for (const session of sessions) {
      const { data: exercises } = await this.supabaseService
        .getClient()
        .from('workout_exercises')
        .select('id, exercise_id, exercises(name)')
        .eq('workout_id', session.workout_id);

      if (!exercises) continue;

      const exerciseSummaries: WorkoutSummary['exercises'] = [];
      let sessionVolume = 0;
      let sessionSets = 0;
      let sessionReps = 0;

      for (const exercise of exercises) {
        const { data: sets } = await this.supabaseService
          .getClient()
          .from('workout_sets')
          .select('weight, reps')
          .eq('workout_exercise_id', exercise.id)
          .is('deleted_at', null);

        if (sets) {
          const exerciseSets = sets.map((s: any) => ({
            weight: s.weight,
            reps: s.reps,
          }));

          exerciseSets.forEach((s: { weight: number | null; reps: number }) => {
            if (s.weight) sessionVolume += s.weight * s.reps;
            sessionSets++;
            sessionReps += s.reps;
          });

          exerciseSummaries.push({
            exerciseName: exercise.exercises?.name || 'Unknown Exercise',
            sets: exerciseSets,
          });
        }
      }

      workouts.push({
        id: session.id,
        name: `Workout ${new Date(session.started_at).toLocaleDateString()}`,
        completedAt: session.completed_at || session.started_at,
        durationSeconds: session.duration_seconds,
        totalVolume: sessionVolume,
        totalSets: sessionSets,
        totalReps: sessionReps,
        exercises: exerciseSummaries,
      });
    }

    return workouts;
  }

  private async getTrainingFrequency(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count, error } = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .is('deleted_at', null);

    if (error) {
      return 0;
    }

    return count ? Math.round((count / 30) * 7 * 10) / 10 : 0;
  }

  private async getVolumeMetrics(userId: string): Promise<VolumeMetrics> {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    const [weeklyVolume, monthlyVolume, totalWorkouts] = await Promise.all([
      this.getVolumeInRange(userId, weekAgo, now),
      this.getVolumeInRange(userId, monthAgo, now),
      this.getTotalWorkoutCount(userId),
    ]);

    return {
      weeklyVolume,
      monthlyVolume,
      averageVolumePerWorkout: totalWorkouts > 0 ? Math.round(monthlyVolume / (totalWorkouts / 4)) : 0,
      totalWorkouts,
    };
  }

  private async getVolumeInRange(userId: string, start: Date, end: Date): Promise<number> {
    const { data: sessions } = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('workout_id')
      .eq('user_id', userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .is('deleted_at', null);

    if (!sessions || sessions.length === 0) return 0;

    const workoutIds = [...new Set(sessions.map((s: any) => s.workout_id))];

    const { data: exercises } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id')
      .in('workout_id', workoutIds);

    if (!exercises || exercises.length === 0) return 0;

    const exerciseIds = exercises.map((e: any) => e.id);

    const { data: sets } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps')
      .in('workout_exercise_id', exerciseIds)
      .is('deleted_at', null);

    if (!sets) return 0;

    return sets.reduce((total: number, set: any) => {
      return total + (set.weight ? set.weight * set.reps : 0);
    }, 0);
  }

  private async getTotalWorkoutCount(userId: string): Promise<number> {
    const { count } = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    return count || 0;
  }
}
