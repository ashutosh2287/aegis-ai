import { Injectable } from '@nestjs/common';
import { StrengthProjectionDto } from '../dto/strength-projection.dto';
import { VolumeProjectionDto } from '../dto/volume-projection.dto';
import { FrequencyProjectionDto } from '../dto/frequency-projection.dto';
import { GoalProjectionDto } from '../dto/goal-projection.dto';
import { StrengthForecastCalculator } from './strength-forecast-calculator';
import { VolumeForecastCalculator } from './volume-forecast-calculator';
import { FrequencyForecastCalculator } from './frequency-forecast-calculator';
import { GoalAchievementEstimator } from './goal-achievement-estimator';
import { GoalAchievementEstimateDto } from '../dto/goal-achievement-estimate.dto';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GoalProjectionService {
  constructor(
    private strengthForecastCalculator: StrengthForecastCalculator,
    private volumeForecastCalculator: VolumeForecastCalculator,
    private frequencyForecastCalculator: FrequencyForecastCalculator,
    private goalAchievementEstimator: GoalAchievementEstimator,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Get all goal projections for a user
   * @param userId The user's ID
   * @returns Array of goal projections
   */
  async getGoalProjections(userId: string): Promise<GoalProjectionDto[]> {
    const goals: GoalProjectionDto[] = [];

    try {
      const { data: profile, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('primary_goal, target_days_per_week')
        .eq('id', userId)
        .single();

      if (error || !profile) return goals;

      const userGoals: string[] = profile.primary_goal ? [profile.primary_goal] : [];
      const targetFrequency = profile.target_days_per_week ?? 4;

      if (userGoals.includes('Gain Strength') || userGoals.includes('Build Muscle')) {
        goals.push(
          new GoalProjectionDto({
            goalId: `strength-${userId}`,
            exerciseId: 'compound-lifts',
            exerciseName: 'Compound Lifts',
            goalType: 'strength',
            targetValue: 100,
            currentValue: 0,
            progressPercentage: 0,
            status: 'on_track',
            projectedCompletionDate: null,
            startDate: new Date().toISOString(),
            deadline: null,
            daysRemaining: null,
            weeklyRate: 0,
            requiredWeeklyRate: null,
          }),
        );
      }

      if (userGoals.includes('Build Muscle') || userGoals.includes('Lose Weight')) {
        goals.push(
          new GoalProjectionDto({
            goalId: `volume-${userId}`,
            exerciseId: 'weekly-volume',
            exerciseName: 'Weekly Training Volume',
            goalType: 'volume',
            targetValue: 5000,
            currentValue: 0,
            progressPercentage: 0,
            status: 'on_track',
            projectedCompletionDate: null,
            startDate: new Date().toISOString(),
            deadline: null,
            daysRemaining: null,
            weeklyRate: 0,
            requiredWeeklyRate: null,
          }),
        );
      }

      goals.push(
        new GoalProjectionDto({
          goalId: `frequency-${userId}`,
          exerciseId: 'workout-frequency',
          exerciseName: 'Weekly Workout Frequency',
          goalType: 'frequency',
          targetValue: targetFrequency,
          currentValue: 0,
          progressPercentage: 0,
          status: 'on_track',
          projectedCompletionDate: null,
          startDate: new Date().toISOString(),
          deadline: null,
          daysRemaining: null,
          weeklyRate: 0,
          requiredWeeklyRate: null,
        }),
      );
    } catch {
      return goals;
    }

    return goals;
  }

  /**
   * Get strength projection for user
   * @param userId The user's ID
   * @param exerciseId Optional: specific exercise
   * @returns Strength projection
   */
  async getStrengthProjection(userId: string, exerciseId?: string): Promise<StrengthProjectionDto> {
    return this.strengthForecastCalculator.calculateProjection(userId, exerciseId);
  }

  /**
   * Get volume projection for user
   * @param userId The user's ID
   * @returns Volume projection
   */
  async getVolumeProjection(userId: string): Promise<VolumeProjectionDto> {
    return this.volumeForecastCalculator.calculateProjection(userId);
  }

  /**
   * Get frequency projection for user
   * @param userId The user's ID
   * @returns Frequency projection
   */
  async getFrequencyProjection(userId: string): Promise<FrequencyProjectionDto> {
    return this.frequencyForecastCalculator.calculateProjection(userId);
  }

  /**
   * Estimate goal achievement date for a specific goal
   * @param userId The user's ID
   * @param goalType: 'strength' | 'volume' | 'frequency'
   * @param targetValue: target value to achieve
   * @param currentValue: current value
   * @param weeklyProgress: average weekly progress
   * @returns Goal achievement estimate
   */
  async estimateGoalAchievement(
    userId: string,
    goalType: 'strength' | 'volume' | 'frequency',
    targetValue: number,
    currentValue: number,
    weeklyProgress: number,
  ): Promise<GoalAchievementEstimateDto> {
    return this.goalAchievementEstimator.estimateAchievementDate(
      userId,
      goalType,
      targetValue,
      currentValue,
      weeklyProgress,
    );
  }
}