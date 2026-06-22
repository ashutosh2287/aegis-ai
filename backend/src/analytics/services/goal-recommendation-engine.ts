import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ForecastRecommendationDto } from '../dto/forecast-recommendation.dto';

@Injectable()
export class GoalRecommendationEngine {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async getUserGoals(userId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('goals')
        .eq('id', userId)
        .single();

      if (error || !data) return [];
      return data.goals ?? [];
    } catch {
      return [];
    }
  }

  private hasGoal(goals: string[], ...goalNames: string[]): boolean {
    return goals.some(g => goalNames.includes(g));
  }

  /**
   * Generate actionable recommendations based on forecasts and trends
   * @param userId The user's ID
   * @returns Array of recommendations
   */
  async generateRecommendations(userId: string): Promise<ForecastRecommendationDto[]> {
    const userGoals = await this.getUserGoals(userId);

    const recommendations: ForecastRecommendationDto[] = [];

    // Goal-specific recommendations
    if (userGoals.includes('Lose Weight')) {
      recommendations.push(
        new ForecastRecommendationDto(
          'frequency',
          'high',
          'Increase cardiovascular training frequency for weight loss',
          { suggestedIncrease: 2, reason: 'Add 2 cardio sessions per week to create caloric deficit' }
        )
      );
      recommendations.push(
        new ForecastRecommendationDto(
          'volume',
          'medium',
          'Maintain resistance training volume while adding cardio',
          { suggestedIncrease: 0, reason: 'Preserve muscle mass during weight loss phase' }
        )
      );
    }

    if (userGoals.includes('Gain Strength')) {
      recommendations.push(
        new ForecastRecommendationDto(
          'strength',
          'high',
          'Increase intensity on compound lifts for strength gains',
          { suggestedIncrease: 5, reason: 'Progressive overload on main lifts is key for strength' }
        )
      );
    }

    if (userGoals.includes('Build Muscle')) {
      recommendations.push(
        new ForecastRecommendationDto(
          'volume',
          'high',
          'Increase weekly training volume for muscle hypertrophy',
          { suggestedIncrease: 15, reason: 'Higher volume (10-20 sets per muscle group) drives muscle growth' }
        )
      );
    }

    if (userGoals.includes('Conditioning')) {
      recommendations.push(
        new ForecastRecommendationDto(
          'frequency',
          'high',
          'Increase training frequency for conditioning goals',
          { suggestedIncrease: 1, reason: 'More frequent sessions improve cardiovascular fitness' }
        )
      );
      recommendations.push(
        new ForecastRecommendationDto(
          'volume',
          'medium',
          'Add high-rep, low-rest sets for metabolic conditioning',
          { suggestedIncrease: 10, reason: 'Circuit-style training improves conditioning' }
        )
      );
    }

    if (userGoals.includes('Fundamentals')) {
      recommendations.push(
        new ForecastRecommendationDto(
          'strength',
          'medium',
          'Focus on technique and form before increasing load',
          { suggestedIncrease: 0, reason: 'Master movement patterns to prevent injury and build foundation' }
        )
      );
    }

    if (userGoals.includes('Sport')) {
      recommendations.push(
        new ForecastRecommendationDto(
          'strength',
          'medium',
          'Add explosive and sport-specific power training',
          { suggestedIncrease: 10, reason: 'Power development translates to athletic performance' }
        )
      );
    }

    // Default recommendation if no goals matched or empty goals
    if (recommendations.length === 0) {
      recommendations.push(
        new ForecastRecommendationDto(
          'strength',
          'medium',
          'Set your fitness goals in onboarding for personalized recommendations',
          { suggestedIncrease: 10, reason: 'Goal-aware recommendations help optimize your training' }
        )
      );
    }

    return recommendations;
  }
}