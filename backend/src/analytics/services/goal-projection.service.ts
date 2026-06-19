import { Injectable } from '@nestjs/common';
import { StrengthProjectionDto } from '../dto/strength-projection.dto';
import { VolumeProjectionDto } from '../dto/volume-projection.dto';
import { FrequencyProjectionDto } from '../dto/frequency-projection.dto';
import { StrengthForecastCalculator } from './strength-forecast-calculator';
import { VolumeForecastCalculator } from './volume-forecast-calculator';
import { FrequencyForecastCalculator } from './frequency-forecast-calculator';
import { GoalAchievementEstimator } from './goal-achievement-estimator';
import { GoalAchievementEstimateDto } from '../dto/goal-achievement-estimate.dto';

@Injectable()
export class GoalProjectionService {
  constructor(
    private strengthForecastCalculator: StrengthForecastCalculator,
    private volumeForecastCalculator: VolumeForecastCalculator,
    private frequencyForecastCalculator: FrequencyForecastCalculator,
    private goalAchievementEstimator: GoalAchievementEstimator,
  ) {}

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