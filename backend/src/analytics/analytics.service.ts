import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PersonalRecord } from './interfaces/personal-record.interface';
import { PersonalRecordType } from './enums/personal-record-type.enum';
import { StrengthProgression, StrengthTrendResponse, StrengthTrendHistoryItem } from './interfaces/strength-progression.interface';
import { WorkoutConsistency } from './interfaces/workout-consistency.interface';

@Injectable()
export class AnalyticsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getDashboard() {
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      weeklyVolume: 0,
      monthlyVolume: 0,
      personalRecords: []
    };
  }

  private calculateOneRepMax(weight: number | null, reps: number): number {
    if (weight === null || weight === 0 || reps <= 0) {
      return 0;
    }
    const oneRepMax = weight * (1 + reps / 30);
    return Math.round(oneRepMax * 100) / 100; // Round to 2 decimal places
  }

  async getExerciseProgression(userId: string, exerciseId: string): Promise<StrengthProgression> {
    // Fetch all sets for the given exercise and user, with necessary joins
    const setsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, completed_at)')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null');

    const sets = Array.isArray(setsRes.data) ? setsRes.data : [];

    if (setsRes.error) {
      // If there's an error, return default values
      return {
        exerciseId,
        currentOneRepMax: 0,
        bestOneRepMax: 0,
        improvementPercentage: 0,
        trend: 'STABLE',
        totalWorkouts: 0,
      };
    }

    // If no data, return default values
    if (sets.length === 0) {
      return {
        exerciseId,
        currentOneRepMax: 0,
        bestOneRepMax: 0,
        improvementPercentage: 0,
        trend: 'STABLE',
        totalWorkouts: 0,
      };
    }

    // Calculate 1RM for each set and collect dates for workout counting
    const oneRepMaxValues: number[] = [];
    const workoutDates: Set<string> = new Set();

    for (const set of sets) {
      const oneRepMax = this.calculateOneRepMax(set.weight, set.reps);
      if (oneRepMax > 0) {
        oneRepMaxValues.push(oneRepMax);
      }
      // Extract date from createdAt (assuming ISO string)
      const date = set.created_at.split('T')[0];
      workoutDates.add(date);
    }

    if (oneRepMaxValues.length === 0) {
      return {
        exerciseId,
        currentOneRepMax: 0,
        bestOneRepMax: 0,
        improvementPercentage: 0,
        trend: 'STABLE',
        totalWorkouts: workoutDates.size,
      };
    }

    // Sort by date to get chronological order (we need earliest and most recent)
    // We'll sort the sets by createdAt
    const sortedSets = sets.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Calculate 1RM for each set in chronological order
    const chronologicalOneRepMax: number[] = [];
    for (const set of sortedSets) {
      const oneRepMax = this.calculateOneRepMax(set.weight, set.reps);
      if (oneRepMax > 0) {
        chronologicalOneRepMax.push(oneRepMax);
      }
    }

    const currentOneRepMax = chronologicalOneRepMax[chronologicalOneRepMax.length - 1]; // most recent
    const bestOneRepMax = Math.max(...oneRepMaxValues); // highest ever
    const earliestOneRepMax = chronologicalOneRepMax[0]; // earliest

    let improvementPercentage = 0;
    if (earliestOneRepMax > 0) {
      improvementPercentage = ((currentOneRepMax - earliestOneRepMax) / earliestOneRepMax) * 100;
    }

    // Round improvementPercentage to 2 decimal places
    improvementPercentage = Math.round(improvementPercentage * 100) / 100;

    let trend: 'UPWARD' | 'DOWNWARD' | 'STABLE' = 'STABLE';
    if (improvementPercentage > 5) {
      trend = 'UPWARD';
    } else if (improvementPercentage < -5) {
      trend = 'DOWNWARD';
    }

    return {
      exerciseId,
      currentOneRepMax,
      bestOneRepMax,
      improvementPercentage,
      trend,
      totalWorkouts: workoutDates.size,
    };
  }

  async getBestOneRepMax(userId: string, exerciseId: string): Promise<number> {
    const setsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null');

    const sets = Array.isArray(setsRes.data) ? setsRes.data : [];

    if (setsRes.error) {
      return 0;
    }

    // If no data, return 0
    if (sets.length === 0) {
      return 0;
    }

    let maxOneRepMax = 0;
    for (const set of sets) {
      const oneRepMax = this.calculateOneRepMax(set.weight, set.reps);
      if (oneRepMax > maxOneRepMax) {
        maxOneRepMax = oneRepMax;
      }
    }

    return maxOneRepMax;
  }

  async getStrengthTrend(userId: string, exerciseId: string): Promise<StrengthTrendResponse> {
    // Fetch sets grouped by date (we'll get the best 1RM per day for simplicity)
    const setsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps, createdAt')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null')
      .order('createdAt', { ascending: true });

    const sets = Array.isArray(setsRes.data) ? setsRes.data : [];

    if (setsRes.error) {
      return {
        exerciseId,
        history: [],
      };
    }

    // If no data, return empty history
    if (sets.length === 0) {
      return {
        exerciseId,
        history: [],
      };
    }

    // Group by date and compute the max 1RM for each day
    const dailyMaxMap = new Map<string, number>();

    for (const set of sets) {
      const date = set.created_at.split('T')[0];
      const oneRepMax = this.calculateOneRepMax(set.weight, set.reps);
      if (oneRepMax > 0) {
        const currentMax = dailyMaxMap.get(date) ?? 0;
        if (oneRepMax > currentMax) {
          dailyMaxMap.set(date, oneRepMax);
        }
      }
    }

    // Convert map to array of history items sorted by date
    const history: StrengthTrendHistoryItem[] = Array.from(dailyMaxMap.entries())
      .map(([date, oneRepMax]) => ({
        date,
        oneRepMax: Math.round(oneRepMax * 100) / 100, // round to 2 decimal places
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      exerciseId,
      history,
    };
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const personalRecords: PersonalRecord[] = [];

    // HEAVIEST_WEIGHT
    const heaviestWeightRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null')
      .order('weight', { ascending: false })
      .limit(1);

    if (!heaviestWeightRes.error && heaviestWeightRes.data.length > 0) {
      const record = heaviestWeightRes.data[0];
      const achievedAt = record.created_at;
      personalRecords.push({
        type: PersonalRecordType.HEAVIEST_WEIGHT,
        value: record.weight,
        achievedAt,
        exerciseId: record.workout_exercises.exercise_id,
        sessionId: record.workout_exercises.workout_sessions.id,
      });
    }

    // MOST_REPS
    const mostRepsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('reps, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .order('reps', { ascending: false })
      .limit(1);

    if (!mostRepsRes.error && mostRepsRes.data.length > 0) {
      const record = mostRepsRes.data[0];
      const achievedAt = record.created_at;
      personalRecords.push({
        type: PersonalRecordType.MOST_REPS,
        value: record.reps,
        achievedAt,
        exerciseId: record.workout_exercises.exercise_id,
        sessionId: record.workout_exercises.workout_sessions.id,
      });
    }

    // HIGHEST_VOLUME
    const highestVolumeRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null');

    if (!highestVolumeRes.error && highestVolumeRes.data.length > 0) {
      let maxVolume = 0;
      let maxVolumeRecord = null;

      for (const record of highestVolumeRes.data) {
        const volume = record.weight * record.reps;
        if (volume > maxVolume) {
          maxVolume = volume;
          maxVolumeRecord = record;
        }
      }

      if (maxVolumeRecord) {
        const achievedAt = maxVolumeRecord.created_at;
        personalRecords.push({
          type: PersonalRecordType.HIGHEST_VOLUME,
          value: maxVolume,
          achievedAt,
          exerciseId: maxVolumeRecord.workout_exercises.exercise_id,
          sessionId: maxVolumeRecord.workout_exercises.workout_sessions.id,
        });
      }
    }

    // LONGEST_SESSION
    const longestSessionRes = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id, startedAt, completed_at, durationSeconds')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .is('completed_at', 'not null')
      .order('durationSeconds', { ascending: false })
      .limit(1);

    if (!longestSessionRes.error && longestSessionRes.data.length > 0) {
      const session = longestSessionRes.data[0];
      const duration = session.durationSeconds !== null ? session.durationSeconds :
        (new Date(session.completed_at).getTime() - new Date(session.startedAt).getTime()) / 1000;
      personalRecords.push({
        type: PersonalRecordType.LONGEST_SESSION,
        value: duration,
        achievedAt: session.completed_at,
        sessionId: session.id,
      });
    }

    // MOST_SETS
    const mostSetsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('id, workout_exercise_id, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null);

    if (!mostSetsRes.error && mostSetsRes.data.length > 0) {
      // Group sets by workoutExerciseId in TypeScript
      const setsByExerciseId = new Map();

      for (const set of mostSetsRes.data) {
        const workoutExerciseId = set.workout_exercise_id;
        if (!setsByExerciseId.has(workoutExerciseId)) {
          setsByExerciseId.set(workoutExerciseId, []);
        }
        setsByExerciseId.get(workoutExerciseId).push(set);
      }

      // Find the exerciseId with the most sets
      let maxSets = 0;
      let maxSetsExerciseId = null;
      let maxSetsRecord = null; // To store a representative set for this exerciseId

      for (const [workoutExerciseId, sets] of setsByExerciseId.entries()) {
        if (sets.length > maxSets) {
          maxSets = sets.length;
          maxSetsExerciseId = workoutExerciseId;
          // Use the first set as representative (we could use the most recent if needed)
          maxSetsRecord = sets[0];
        }
      }

      if (maxSetsRecord) {
        const achievedAt = maxSetsRecord.created_at;
        personalRecords.push({
          type: PersonalRecordType.MOST_SETS,
          value: maxSets,
          achievedAt,
          exerciseId: maxSetsRecord.workout_exercises.exercise_id,
          sessionId: maxSetsRecord.workout_exercises.workout_sessions.id,
        });
      }
    }

    return personalRecords;
  }

  async getExercisePersonalRecords(userId: string, exerciseId: string): Promise<PersonalRecord[]> {
    const personalRecords: PersonalRecord[] = [];

    // First, validate that the exercise belongs to the user (via workout ownership)
    const exerciseValidation = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', exerciseId)
      .single();

    if (exerciseValidation.error) {
      if (exerciseValidation.error.code === 'PGRST116') {
        throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch exercise: ${exerciseValidation.error.message}`);
    }

    if (!exerciseValidation.data) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    const workoutId = exerciseValidation.data.workout_id;

    // Validate workout belongs to user
    const workoutValidation = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workoutValidation.error) {
      if (workoutValidation.error.code === 'PGRST116') {
        throw new NotFoundException(`Workout with ID ${workoutId} not found or does not belong to user`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workoutValidation.error.message}`);
    }

    if (!workoutValidation.data) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found or does not belong to user`);
    }

    // HEAVIEST_WEIGHT for this exercise
    const heaviestWeightRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null')
      .order('weight', { ascending: false })
      .limit(1);

    if (!heaviestWeightRes.error && heaviestWeightRes.data.length > 0) {
      const record = heaviestWeightRes.data[0];
      const achievedAt = record.created_at;
      personalRecords.push({
        type: PersonalRecordType.HEAVIEST_WEIGHT,
        value: record.weight,
        achievedAt,
        exerciseId: record.workout_exercises.exercise_id,
        sessionId: record.workout_exercises.workout_sessions.id,
      });
    }

    // MOST_REPS for this exercise
    const mostRepsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('reps, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .order('reps', { ascending: false })
      .limit(1);

    if (!mostRepsRes.error && mostRepsRes.data.length > 0) {
      const record = mostRepsRes.data[0];
      const achievedAt = record.created_at;
      personalRecords.push({
        type: PersonalRecordType.MOST_REPS,
        value: record.reps,
        achievedAt,
        exerciseId: record.workout_exercises.exercise_id,
        sessionId: record.workout_exercises.workout_sessions.id,
      });
    }

    // HIGHEST_VOLUME for this exercise
    const highestVolumeRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('weight, reps, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null)
      .is('weight', 'not null');

    if (!highestVolumeRes.error && highestVolumeRes.data.length > 0) {
      let maxVolume = 0;
      let maxVolumeRecord = null;

      for (const record of highestVolumeRes.data) {
        const volume = record.weight * record.reps;
        if (volume > maxVolume) {
          maxVolume = volume;
          maxVolumeRecord = record;
        }
      }

      if (maxVolumeRecord) {
        const achievedAt = maxVolumeRecord.created_at;
        personalRecords.push({
          type: PersonalRecordType.HIGHEST_VOLUME,
          value: maxVolume,
          achievedAt,
          exerciseId: maxVolumeRecord.workout_exercises.exercise_id,
          sessionId: maxVolumeRecord.workout_exercises.workout_sessions.id,
        });
      }
    }

    // LONGEST_SESSION for this exercise (session that contains this exercise and has the longest duration)
    const longestSessionRes = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id, startedAt, completed_at, durationSeconds')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .is('completed_at', 'not null')
      .in('id', this.supabaseService
        .getClient()
        .from('workout_exercises')
        .select('workout_id')
        .eq('exercise_id', exerciseId)
      )
      .order('durationSeconds', { ascending: false })
      .limit(1);

    if (!longestSessionRes.error && longestSessionRes.data.length > 0) {
      const session = longestSessionRes.data[0];
      const duration = session.durationSeconds !== null ? session.durationSeconds :
        (new Date(session.completed_at).getTime() - new Date(session.startedAt).getTime()) / 1000;
      personalRecords.push({
        type: PersonalRecordType.LONGEST_SESSION,
        value: duration,
        achievedAt: session.completed_at,
        sessionId: session.id,
      });
    }

    // MOST_SETS for this exercise (in any session)
    const mostSetsRes = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('id, workout_exercise_id, createdAt, workout_exercises!inner(id, exercise_id), workout_exercises.workout_sessions!inner(id, user_id, completed_at, startedAt)')
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workout_sessions.user_id', userId)
      .is('workout_sets.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_sessions.deleted_at', null);

    if (!mostSetsRes.error && mostSetsRes.data.length > 0) {
      // Since we're filtering by a specific exerciseId, all sets should belong to the same workout_exercise_id
      // But let's still group by workout_exercise_id to be safe (though it should be just one group)
      const setsByExerciseId = new Map();

      for (const set of mostSetsRes.data) {
        const workoutExerciseId = set.workout_exercise_id;
        if (!setsByExerciseId.has(workoutExerciseId)) {
          setsByExerciseId.set(workoutExerciseId, []);
        }
        setsByExerciseId.get(workoutExerciseId).push(set);
      }

      // Find the exerciseId with the most sets (should be just one in this filtered query)
      let maxSets = 0;
      let maxSetsRecord = null; // To store a representative set for this exerciseId

      for (const [workoutExerciseId, sets] of setsByExerciseId.entries()) {
        if (sets.length > maxSets) {
          maxSets = sets.length;
          maxSetsRecord = sets[0]; // Use the first set as representative
        }
      }

      if (maxSetsRecord) {
        const achievedAt = maxSetsRecord.created_at;
        personalRecords.push({
          type: PersonalRecordType.MOST_SETS,
          value: maxSets,
          achievedAt,
          exerciseId: maxSetsRecord.workout_exercises.exercise_id,
          sessionId: maxSetsRecord.workout_exercises.workout_sessions.id,
        });
      }
    }

    return personalRecords;
  }

  async getSessionVolume(sessionId: string, userId: string) {
    // Validate session and get workoutId
    const session = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id, workout_id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (session.error) {
      if (session.error.code === 'PGRST116') {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch session: ${session.error.message}`);
    }

    if (!session.data) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    const workoutId = session.data.workout_id;

    // Get all workoutExercises for this workout
    const exercises = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id')
      .eq('workout_id', workoutId);

    if (exercises.error) {
      throw new InternalServerErrorException(`Failed to fetch workout exercises: ${exercises.error.message}`);
    }

    const exerciseIds = exercises.data.map((e: any) => e.id);

    if (exerciseIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all sets for these exerciseIds
    const sets = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('reps, weight')
      .in('workout_exercise_id', exerciseIds)
      .is('deleted_at', null);

    if (sets.error) {
      throw new InternalServerErrorException(`Failed to fetch workout sets: ${sets.error.message}`);
    }

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    sets.data.forEach((set: any) => {
      if (set.weight !== null) {
        totalVolume += set.weight * set.reps;
      }
      totalSets++;
      totalReps += set.reps;
    });

    return { totalVolume, totalSets, totalReps };
  }

  async getExerciseVolume(userId: string, exerciseId: string) {
    // Validate that the exercise belongs to the user via workout ownership
    // Get the workout_exercise to get workout_id
    const exercise = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', exerciseId)
      .single();

    if (exercise.error) {
      if (exercise.error.code === 'PGRST116') {
        throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch exercise: ${exercise.error.message}`);
    }

    if (!exercise.data) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    const workoutId = exercise.data.workout_id;

    // Validate workout belongs to user
    const workout = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workout.error) {
      if (workout.error.code === 'PGRST116') {
        throw new NotFoundException(`Workout with ID ${workoutId} not found or does not belong to user`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workout.error.message}`);
    }

    if (!workout.data) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found or does not belong to user`);
    }

    // Get all workout ids for the user
    const userWorkouts = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (userWorkouts.error) {
      throw new InternalServerErrorException(`Failed to fetch user workouts: ${userWorkouts.error.message}`);
    }

    const userWorkoutIds = userWorkouts.data.map((w: any) => w.id);

    if (userWorkoutIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all workout_exercises for this exercise in the user's workouts
    const userExercises = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id')
      .eq('exercise_id', exerciseId)
      .in('workout_id', userWorkoutIds);

    if (userExercises.error) {
      throw new InternalServerErrorException(`Failed to fetch user exercises: ${userExercises.error.message}`);
    }

    const userExerciseIds = userExercises.data.map((e: any) => e.id);

    if (userExerciseIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all sets for these exerciseIds
    const sets = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('reps, weight')
      .in('workout_exercise_id', userExerciseIds)
      .is('deleted_at', null);

    if (sets.error) {
      throw new InternalServerErrorException(`Failed to fetch workout sets: ${sets.error.message}`);
    }

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    sets.data.forEach((set: any) => {
      if (set.weight !== null) {
        totalVolume += set.weight * set.reps;
      }
      totalSets++;
      totalReps += set.reps;
    });

    return { totalVolume, totalSets, totalReps };
  }

  async getWeeklyVolume(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // Last 7 days

    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    // Get sessions in the date range for the user
    const sessions = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('startedAt', startDateISO)
      .lte('startedAt', endDateISO)
      .is('deleted_at', null);

    if (sessions.error) {
      throw new InternalServerErrorException(`Failed to fetch sessions: ${sessions.error.message}`);
    }

    const sessionIds = sessions.data.map((s: any) => s.id);

    if (sessionIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all workoutExercises for these sessions
    // First, get workouts for these sessions
    const sessionWorkouts = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('workout_id')
      .in('id', sessionIds);

    if (sessionWorkouts.error) {
      throw new InternalServerErrorException(`Failed to fetch session workouts: ${sessionWorkouts.error.message}`);
    }

    const workoutIds = sessionWorkouts.data.map((s: any) => s.workout_id);

    if (workoutIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get workoutExercises for these workouts
    const exercises = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id')
      .in('workout_id', workoutIds);

    if (exercises.error) {
      throw new InternalServerErrorException(`Failed to fetch workout exercises: ${exercises.error.message}`);
    }

    const exerciseIds = exercises.data.map((e: any) => e.id);

    if (exerciseIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all sets for these exerciseIds
    const sets = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('reps, weight')
      .in('workout_exercise_id', exerciseIds)
      .is('deleted_at', null);

    if (sets.error) {
      throw new InternalServerErrorException(`Failed to fetch workout sets: ${sets.error.message}`);
    }

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    sets.data.forEach((set: any) => {
      if (set.weight !== null) {
        totalVolume += set.weight * set.reps;
      }
      totalSets++;
      totalReps += set.reps;
    });

    return { totalVolume, totalSets, totalReps };
  }

  async getMonthlyVolume(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Last 30 days

    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    // Get sessions in the date range for the user
    const sessions = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('startedAt', startDateISO)
      .lte('startedAt', endDateISO)
      .is('deleted_at', null);

    if (sessions.error) {
      throw new InternalServerErrorException(`Failed to fetch sessions: ${sessions.error.message}`);
    }

    const sessionIds = sessions.data.map((s: any) => s.id);

    if (sessionIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all workoutExercises for these sessions
    const sessionWorkouts = await this.supabaseService
      .getClient()
      .from('workout_sessions')
      .select('workout_id')
      .in('id', sessionIds);

    if (sessionWorkouts.error) {
      throw new InternalServerErrorException(`Failed to fetch session workouts: ${sessionWorkouts.error.message}`);
    }

    const workoutIds = sessionWorkouts.data.map((s: any) => s.workout_id);

    if (workoutIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get workoutExercises for these workouts
    const exercises = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id')
      .in('workout_id', workoutIds);

    if (exercises.error) {
      throw new InternalServerErrorException(`Failed to fetch workout exercises: ${exercises.error.message}`);
    }

    const exerciseIds = exercises.data.map((e: any) => e.id);

    if (exerciseIds.length === 0) {
      return { totalVolume: 0, totalSets: 0, totalReps: 0 };
    }

    // Get all sets for these exerciseIds
    const sets = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('reps, weight')
      .in('workout_exercise_id', exerciseIds)
      .is('deleted_at', null);

    if (sets.error) {
      throw new InternalServerErrorException(`Failed to fetch workout sets: ${sets.error.message}`);
    }

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    sets.data.forEach((set: any) => {
      if (set.weight !== null) {
        totalVolume += set.weight * set.reps;
      }
      totalSets++;
      totalReps += set.reps;
    });

    return { totalVolume, totalSets, totalReps };
  }
  async getWorkoutConsistency(userId: string): Promise<WorkoutConsistency> {
    const supabase = this.supabaseService.getClient();

    // Get all completed sessions for the user (for totalCompletedSessions, distinct dates, first workout date)
    const allSessionsRes = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .is('completed_at', 'not null')
      .is('deleted_at', 'null')
      .order('completed_at', { ascending: true });

    if (allSessionsRes.error) {
      throw new InternalServerErrorException(`Failed to fetch workout sessions: ${allSessionsRes.error.message}`);
    }

    const allSessions = Array.isArray(allSessionsRes.data) ? allSessionsRes.data : [];

    // Get sessions in the last 7 days (for workoutsThisWeek)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const recentSessionsRes = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', sevenDaysAgoISO)
      .is('completed_at', 'not null')
      .is('deleted_at', 'null');

    if (recentSessionsRes.error) {
      throw new InternalServerErrorException(`Failed to fetch recent workout sessions: ${recentSessionsRes.error.message}`);
    }

    const recentSessions = Array.isArray(recentSessionsRes.data) ? recentSessionsRes.data : [];

    // Get sessions in the last 30 days (for workoutsThisMonth and adherence)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const monthlySessionsRes = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', thirtyDaysAgoISO)
      .is('completed_at', 'not null')
      .is('deleted_at', 'null');

    if (monthlySessionsRes.error) {
      throw new InternalServerErrorException(`Failed to fetch monthly workout sessions: ${monthlySessionsRes.error.message}`);
    }

    const monthlySessions = Array.isArray(monthlySessionsRes.data) ? monthlySessionsRes.data : [];

    // totalCompletedSessions
    const totalCompletedSessions = allSessions.length;

    // Extract distinct dates from allSessions (for streaks and totalWorkoutDays)
    const datesSet = new Set<string>();
    allSessions.forEach((session: any) => {
      const dateStr = session.completed_at.split('T')[0];
      datesSet.add(dateStr);
    });
    const datesArray = Array.from(datesSet).sort(); // ascending

    // totalWorkoutDays
    const totalWorkoutDays = datesArray.length;

    // Compute current streak and longest streak
    let currentStreak = 0;
    let longestStreak = 0;

    if (datesArray.length > 0) {
      // Compute longest streak
      let currentStreakLength = 1;
      let prevDate = new Date(datesArray[0]);
      prevDate.setHours(0, 0, 0, 0);

      for (let i = 1; i < datesArray.length; i++) {
        const currentDate = new Date(datesArray[i]);
        currentDate.setHours(0, 0, 0, 0);
        const prevTime = prevDate.getTime();
        const currentTime = currentDate.getTime();
        const diffTime = currentTime - prevTime;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreakLength++;
        } else {
          if (currentStreakLength > longestStreak) {
            longestStreak = currentStreakLength;
          }
          currentStreakLength = 1;
        }
        prevDate = currentDate;
      }

      // Check the last streak
      if (currentStreakLength > longestStreak) {
        longestStreak = currentStreakLength;
      }

      // Compute current streak (from most recent workout day backwards)
      currentStreak = 0;
      const mostRecentDateStr = datesArray[datesArray.length - 1];
      let checkDate = new Date(mostRecentDateStr);
      checkDate.setHours(0, 0, 0, 0);
      while (true) {
        const checkDateStr = checkDate.toLocaleDateString('en-CA');
        if (datesSet.has(checkDateStr)) {
          currentStreak++;
          // Subtract one day
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // workoutsThisWeek: count of sessions in last 7 days
    const workoutsThisWeek = recentSessions.length;

    // workoutsThisMonth: count of sessions in last 30 days
    const workoutsThisMonth = monthlySessions.length;

    // averageWorkoutsPerWeek
    let averageWorkoutsPerWeek = 0;
    if (totalCompletedSessions > 0 && datesArray.length > 0) {
      const firstWorkoutDateStr = datesArray[0];
      const firstDate = new Date(firstWorkoutDateStr);
      firstDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - firstDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeksSinceFirstWorkout = Math.max(1, Math.ceil(diffDays / 7));
      averageWorkoutsPerWeek = totalCompletedSessions / weeksSinceFirstWorkout;
    }

    // adherencePercentage
    const expected = (30 / 7) * 5; // 21.42857...
    const actual = monthlySessions.length; // total sessions in last 30 days
    let adherencePercentage = 0;
    if (expected > 0) {
      adherencePercentage = (actual / expected) * 100;
      if (adherencePercentage > 100) {
        adherencePercentage = 100;
      }
    }
    // Round to 2 decimal places
    averageWorkoutsPerWeek = Math.round(averageWorkoutsPerWeek * 100) / 100;
    adherencePercentage = Math.round(adherencePercentage * 100) / 100;


    return {
      currentStreak,
      longestStreak,
      workoutsThisWeek,
      workoutsThisMonth,
      averageWorkoutsPerWeek,
      adherencePercentage,
      totalWorkoutDays,
    };
  }
}