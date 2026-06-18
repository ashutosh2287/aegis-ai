import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AnalyticsService } from "./analytics.service";

import { PersonalRecordType } from "./enums/personal-record-type.enum";
import { DashboardResponseDto } from "./dto/dashboard-response.dto";

interface DashboardSet {
  weight: number | null;
  reps: number;
  createdAt: string;
  workout_exercises: {
    exercise_id: string;
  };
}

interface DashboardSession {
  id: string;
  completed_at: string;
  startedAt: string;
  durationSeconds: number | null;
  workout_exercises: {
    id: string;
    exercise_id: string;
  }[];
}

interface ExerciseIdRow {
  exercise_id: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    // Use Supabase client
    const supabase = this.supabaseService.getClient();

    // Get workout consistency data (streaks, weekly/monthly workouts, total workout days)
    const workoutConsistency =
      await this.analyticsService.getWorkoutConsistency(userId);

    // Get weekly and monthly volume
    const weeklyVolumeData =
      await this.analyticsService.getWeeklyVolume(userId);
    const monthlyVolumeData =
      await this.analyticsService.getMonthlyVolume(userId);

    // Get personal records and format them
    const personalRecords =
      await this.analyticsService.getPersonalRecords(userId);

    // Format personal records for dashboard
    const formattedPersonalRecords: DashboardResponseDto["personalRecords"] = {
      heaviestWeight: null,
      mostReps: null,
      highestVolume: null,
      longestSession: null,
    };

    for (const record of personalRecords) {
      switch (record.type) {
        case PersonalRecordType.HEAVIEST_WEIGHT:
          formattedPersonalRecords.heaviestWeight = record.value;
          break;
        case PersonalRecordType.MOST_REPS:
          formattedPersonalRecords.mostReps = record.value;
          break;
        case PersonalRecordType.HIGHEST_VOLUME:
          formattedPersonalRecords.highestVolume = record.value;
          break;
        case PersonalRecordType.LONGEST_SESSION:
          formattedPersonalRecords.longestSession = record.value;
          break;
        // MOST_SETS is not included in dashboard personalRecords
      }
    }

    // Get tracked exercises (distinct exercise IDs the user has worked on)
    const trackedExercises = await this.getTrackedExercises(userId);

    // Calculate overall strength improvement percentage
    const overallImprovementPercentage =
      await this.calculateOverallStrengthImprovement(userId);

    // Get recent sessions
    const recentSessions = await this.getRecentSessions(userId, 5); // Get 5 most recent sessions

    // Generate timestamp
    const generatedAt = new Date().toISOString();

    // Return dashboard data
    return {
      streaks: {
        current: workoutConsistency.currentStreak,
        longest: workoutConsistency.longestStreak,
      },
      workouts: {
        weekly: workoutConsistency.workoutsThisWeek,
        monthly: workoutConsistency.workoutsThisMonth,
        total: workoutConsistency.totalWorkoutDays,
      },
      trainingVolume: {
        weekly: weeklyVolumeData.totalVolume,
        monthly: monthlyVolumeData.totalVolume,
      },
      personalRecords: formattedPersonalRecords,
      strengthProgress: {
        overallImprovementPercentage: overallImprovementPercentage,
        trackedExercises: trackedExercises,
      },
      recentSessions: recentSessions,
      generatedAt: generatedAt,
    };
  }

  /**
   * Get distinct exercise IDs that the user has worked on
   */
  private async getTrackedExercises(userId: string): Promise<string[]> {
    const supabase = this.supabaseService.getClient();

    // Get distinct exercise IDs through workout_exercises and workout_sessions
    const { data, error } = await supabase
      .from("workout_exercises")
      .select("exercise_id")
      .eq("workout_sessions.user_id", userId)
      .is("workout_exercises.deleted_at", null)
      .is("workout_sessions.deleted_at", null);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch tracked exercises: ${error.message}`,
      );
    }

    // Extract unique exercise IDs
    const exerciseIds = Array.from(
      new Set(data.map((item: ExerciseIdRow) => item.exercise_id)),
    );
    return exerciseIds as string[];
  }

  /**
   * Calculate overall strength improvement percentage across all exercises
   */
  private async calculateOverallStrengthImprovement(
    userId: string,
  ): Promise<number> {
    const supabase = this.supabaseService.getClient();

    // Get all sets for the user with exercise information
    const { data: sets, error } = await supabase
      .from("workout_sets")
      .select(
        "weight, reps, createdAt, workout_exercises!inner(exercise_id, workout_exercises.workout_sessions!inner(user_id))",
      )
      .eq("workout_exercises.workout_sessions.user_id", userId)
      .is("workout_sets.deleted_at", null)
      .is("workout_exercises.deleted_at", null)
      .is("workout_sessions.deleted_at", null)
      .is("weight", "not null")
      .order("createdAt", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch workout sets for strength calculation: ${error.message}`,
      );
    }

    if (!sets || sets.length === 0) {
      return 0;
    }

    // Group sets by exercise ID and calculate improvement for each
    const exerciseSets: Record<string, DashboardSet[]> = {};

    for (const set of sets) {
      const exerciseId = set.workout_exercises.exercise_id;
      if (!exerciseSets[exerciseId]) {
        exerciseSets[exerciseId] = [];
      }
      exerciseSets[exerciseId].push(set);
    }

    const improvements: number[] = [];

    for (const exerciseId in exerciseSets) {
      const exerciseSetList = exerciseSets[exerciseId];
      if (exerciseSetList.length < 2) {
        // Need at least two sets to calculate improvement
        continue;
      }

      // Get earliest and most recent sets
      const earliestSet = exerciseSetList[0];
      const mostRecentSet = exerciseSetList[exerciseSetList.length - 1];

      // Calculate 1RM for both
      const earliestOneRepMax = this.calculateOneRepMax(
        earliestSet.weight,
        earliestSet.reps,
      );
      const mostRecentOneRepMax = this.calculateOneRepMax(
        mostRecentSet.weight,
        mostRecentSet.reps,
      );

      // Calculate improvement percentage if earliest 1RM > 0
      if (earliestOneRepMax > 0) {
        const improvementPercentage =
          ((mostRecentOneRepMax - earliestOneRepMax) / earliestOneRepMax) * 100;
        improvements.push(improvementPercentage);
      }
    }

    if (improvements.length === 0) {
      return 0;
    }

    // Calculate average improvement percentage
    const sum = improvements.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / improvements.length) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate one rep max from weight and reps
   */
  private calculateOneRepMax(weight: number | null, reps: number): number {
    if (weight === null || weight === 0 || reps <= 0) {
      return 0;
    }
    const oneRepMax = weight * (1 + reps / 30);
    return Math.round(oneRepMax * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get recent workout sessions with exercise counts
   */
  private async getRecentSessions(
    userId: string,
    limit: number = 5,
  ): Promise<
    Array<{
      id: string;
      date: string;
      duration: number;
      exerciseCount: number;
    }>
  > {
    const supabase = this.supabaseService.getClient();

    // Get recent sessions with workout and exercise counts
    const { data, error } = await supabase
      .from("workout_sessions")
      .select(
        `id, completed_at, startedAt, durationSeconds,
         workout_exercises!inner(id, exercise_id)`,
      )
      .eq("user_id", userId)
      .is("completed_at", "not null")
      .is("deleted_at", null)
      .order("completed_at", { descending: true })
      .limit(limit);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch recent sessions: ${error.message}`,
      );
    }

    // Format the sessions for the dashboard
    return (data || []).map((session: DashboardSession) => {
      // Calculate duration: use durationSeconds if available, otherwise calculate from timestamps
      const duration =
        session.durationSeconds !== null
          ? session.durationSeconds
          : Math.floor(
              (new Date(session.completed_at).getTime() -
                new Date(session.startedAt).getTime()) /
                1000,
            );

      // Count exercises in this session
      const exerciseCount = session.workout_exercises?.length || 0;

      return {
        id: session.id,
        date: session.completed_at, // Already an ISO string
        duration: duration,
        exerciseCount: exerciseCount,
      };
    });
  }
}
