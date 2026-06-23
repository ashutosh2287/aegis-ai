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
      const client = this.supabaseService.getClient();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

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

      const setsRes = await client
        .from('workout_sets')
        .select('id, weight, reps, created_at, workout_exercise_id')
        .in('workout_exercise_id', exerciseIds)
        .is('deleted_at', null)
        .not('weight', 'is', null);

      const exerciseSessionMap = new Map<string, string>();
      for (const ex of exercises) {
        exerciseSessionMap.set((ex as any).id, (ex as any).workout_id);
      }

      const sessionCompletedMap = new Map<string, string>();
      for (const s of sessions) {
        sessionCompletedMap.set((s as any).id, (s as any).completed_at || '');
      }

      const allSets = (setsRes.data || []).map((set: any) => {
        const sessionId = exerciseSessionMap.get(set.workout_exercise_id) || '';
        const completedAt = sessionCompletedMap.get(sessionId) || '';
        return { ...set, completed_at: completedAt };
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

      // Fetch monthly data once and derive weekly from it
      const monthlyData = await this.getVolumeDataInRange(userId, monthAgo, now);
      const weeklyData = await this.getVolumeDataInRange(userId, weekAgo, now);

      const workoutCount = monthlyData.workoutCount;
      const totalSets = monthlyData.totalSets;

      return {
        weeklyVolume: weeklyData.volume,
        monthlyVolume: monthlyData.volume,
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

  private async getVolumeDataInRange(userId: string, start: Date, end: Date): Promise<{ volume: number; workoutCount: number; totalSets: number }> {
    const { data: sessions } = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('workout_id')
      .eq('user_id', userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .is('deleted_at', null);

    if (!sessions || sessions.length === 0) return { volume: 0, workoutCount: 0, totalSets: 0 };

    const workoutIds = [...new Set(sessions.map((s: any) => s.workout_id))];

    const { data: exercises } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id')
      .in('workout_id', workoutIds);

    if (!exercises || exercises.length === 0) return { volume: 0, workoutCount: sessions.length, totalSets: 0 };

    const exerciseIds = exercises.map((e: any) => e.id);

    const { data: sets } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps')
      .in('workout_exercise_id', exerciseIds)
      .is('deleted_at', null);

    if (!sets) return { volume: 0, workoutCount: sessions.length, totalSets: 0 };

    let volume = 0;
    let totalSets = 0;
    for (const set of sets) {
      if (set.weight) volume += set.weight * set.reps;
      totalSets++;
    }

    return { volume, workoutCount: sessions.length, totalSets };
  }

  private async getConsistencyMetrics(userId: string): Promise<ConsistencyMetrics> {
    try {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);

      const { data: allSessions } = await this.supabaseService
        .getClient()
        .from('workout_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('completed_at', { ascending: false });

      let workoutsThisWeek = 0;
      let workoutsThisMonth = 0;
      let currentStreak = 0;
      let longestStreak = 0;

      if (allSessions && allSessions.length > 0) {
        const dates = [...new Set(
          allSessions.map((s: any) => new Date(s.completed_at).toISOString().split('T')[0])
        )].sort().reverse();

        // Derive week/month counts from allSessions
        for (const session of allSessions) {
          if (!session.completed_at) continue;
          const completedDate = new Date(session.completed_at);
          if (completedDate >= weekAgo && completedDate <= now) workoutsThisWeek++;
          if (completedDate >= monthAgo && completedDate <= now) workoutsThisMonth++;
        }

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
