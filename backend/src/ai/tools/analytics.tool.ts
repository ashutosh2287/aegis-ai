import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AnalyticsContext, StrengthTrend, VolumeTrend, ConsistencyMetrics } from '../interfaces/user-context.interface';

@Injectable()
export class AnalyticsTool {
  private readonly logger = new Logger(AnalyticsTool.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAnalytics(userId: string): Promise<AnalyticsContext> {
    try {
      const [strengthTrends, volumeTrends, consistency] = await Promise.all([
        this.getStrengthTrends(userId),
        this.getVolumeTrends(userId),
        this.getConsistencyMetrics(userId),
      ]);

      return {
        strengthTrends,
        volumeTrends,
        consistency,
      };
    } catch (error) {
      this.logger.error(`Error in getAnalytics: ${(error as Error).message}`);
      return {
        strengthTrends: {
          currentOneRepMax: 0,
          bestOneRepMax: 0,
          improvementPercentage: 0,
          trend: 'STABLE',
        },
        volumeTrends: {
          weeklyVolume: 0,
          monthlyVolume: 0,
          averageSetsPerWorkout: 0,
        },
        consistency: {
          currentStreak: 0,
          longestStreak: 0,
          workoutsThisWeek: 0,
          workoutsThisMonth: 0,
          averageWorkoutsPerWeek: 0,
        },
      };
    }
  }

  private async getStrengthTrends(userId: string): Promise<StrengthTrend> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(now.getDate() - 60);

      const client = this.supabaseService.getClient();

      // Get user sessions
      const sessionsRes = await client
        .from('workout_sessions')
        .select('id, workout_id, completed_at')
        .eq('user_id', userId)
        .is('deleted_at', null);

      const sessions = sessionsRes.data || [];
      if (sessions.length === 0) {
        return { currentOneRepMax: 0, bestOneRepMax: 0, improvementPercentage: 0, trend: 'STABLE' };
      }

      const sessionIds = sessions.map((s: any) => s.id);

      // Get workout_exercises
      const exercisesRes = await client
        .from('workout_exercises')
        .select('id, workout_id')
        .in('workout_id', sessionIds)
        .is('deleted_at', null);

      const exercises = exercisesRes.data || [];
      if (exercises.length === 0) {
        return { currentOneRepMax: 0, bestOneRepMax: 0, improvementPercentage: 0, trend: 'STABLE' };
      }

      const exerciseIds = exercises.map((e: any) => e.id);

      // Get all sets
      const setsRes = await client
        .from('workout_sets')
        .select('id, weight, reps, created_at, workout_exercise_id')
        .in('workout_exercise_id', exerciseIds)
        .is('deleted_at', null)
        .not('weight', 'is', null);

      const allSets = (setsRes.data || []).map((set: any) => {
        const ex = exercises.find((e: any) => e.id === set.workout_exercise_id);
        const sessionId = ex?.workout_id || '';
        const session = sessions.find((s: any) => s.id === sessionId);
        return { ...set, completed_at: session?.completed_at || null };
      });

      const recentSets = allSets.filter((s: any) => s.completed_at && new Date(s.completed_at) >= thirtyDaysAgo);
      const olderSets = allSets.filter((s: any) => s.completed_at && new Date(s.completed_at) >= sixtyDaysAgo && new Date(s.completed_at) < thirtyDaysAgo);

      const recentMax = this.calculateMaxOneRepMax(recentSets);
      const olderMax = this.calculateMaxOneRepMax(olderSets);

      let trend: 'UPWARD' | 'DOWNWARD' | 'STABLE' = 'STABLE';
      let improvementPercentage = 0;

      if (olderMax > 0 && recentMax > 0) {
        improvementPercentage = ((recentMax - olderMax) / olderMax) * 100;
        if (improvementPercentage > 5) trend = 'UPWARD';
        else if (improvementPercentage < -5) trend = 'DOWNWARD';
      }

      return {
        currentOneRepMax: recentMax,
        bestOneRepMax: Math.max(recentMax, olderMax),
        improvementPercentage: Math.round(improvementPercentage * 100) / 100,
        trend,
      };
    } catch (error) {
      this.logger.error(`Error in getStrengthTrends: ${(error as Error).message}`);
      return {
        currentOneRepMax: 0,
        bestOneRepMax: 0,
        improvementPercentage: 0,
        trend: 'STABLE',
      };
    }
  }

  private calculateMaxOneRepMax(sets: any[]): number {
    let max = 0;
    for (const set of sets) {
      if (set.weight && set.reps) {
        const oneRepMax = set.weight * (1 + set.reps / 30);
        if (oneRepMax > max) max = oneRepMax;
      }
    }
    return Math.round(max * 100) / 100;
  }

  private async getVolumeTrends(userId: string): Promise<VolumeTrend> {
    try {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);

      const [weeklyVolume, monthlyVolume, workoutCount, totalSets] = await Promise.all([
        this.getVolumeInRange(userId, weekAgo, now),
        this.getVolumeInRange(userId, monthAgo, now),
        this.getWorkoutCountInRange(userId, monthAgo, now),
        this.getTotalSetsInRange(userId, monthAgo, now),
      ]);

      return {
        weeklyVolume,
        monthlyVolume,
        averageSetsPerWorkout: workoutCount > 0 ? Math.round(totalSets / workoutCount) : 0,
      };
    } catch (error) {
      this.logger.error(`Error in getVolumeTrends: ${(error as Error).message}`);
      return {
        weeklyVolume: 0,
        monthlyVolume: 0,
        averageSetsPerWorkout: 0,
      };
    }
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

    const { data: sets } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps')
      .in('workout_exercise_id', exercises.map((e: any) => e.id))
      .is('deleted_at', null);

    if (!sets) return 0;

    return sets.reduce((total: number, set: any) => {
      return total + (set.weight ? set.weight * set.reps : 0);
    }, 0);
  }

  private async getWorkoutCountInRange(userId: string, start: Date, end: Date): Promise<number> {
    const { count } = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .is('deleted_at', null);

    return count || 0;
  }

  private async getTotalSetsInRange(userId: string, start: Date, end: Date): Promise<number> {
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

    const { count } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('id', { count: 'exact', head: true })
      .in('workout_exercise_id', exercises.map((e: any) => e.id))
      .is('deleted_at', null);

    return count || 0;
  }

  private async getConsistencyMetrics(userId: string): Promise<ConsistencyMetrics> {
    try {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);

      const [workoutsThisWeek, workoutsThisMonth] = await Promise.all([
        this.getWorkoutCountInRange(userId, weekAgo, now),
        this.getWorkoutCountInRange(userId, monthAgo, now),
      ]);

      const { data: allSessions } = await this.supabaseService
        .getClient()
        .from('workout_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('completed_at', { ascending: false });

      let currentStreak = 0;
      let longestStreak = 0;

      if (allSessions && allSessions.length > 0) {
        const dates = [...new Set(
          allSessions.map((s: any) => new Date(s.completed_at).toISOString().split('T')[0])
        )].sort().reverse();

        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let checkDate = new Date(today);

        while (dates.includes(checkDate.toISOString().split('T')[0])) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
        currentStreak = streak;

        let maxStreak = 0;
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1] as string);
          const curr = new Date(dates[i] as string);
          const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
          } else {
            streak = 1;
          }
        }
        longestStreak = Math.max(maxStreak, streak);
      }

      return {
        currentStreak,
        longestStreak,
        workoutsThisWeek,
        workoutsThisMonth,
        averageWorkoutsPerWeek: workoutsThisMonth > 0 ? Math.round((workoutsThisMonth / 30) * 7 * 10) / 10 : 0,
      };
    } catch (error) {
      this.logger.error(`Error in getConsistencyMetrics: ${(error as Error).message}`);
      return {
        currentStreak: 0,
        longestStreak: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        averageWorkoutsPerWeek: 0,
      };
    }
  }
}
