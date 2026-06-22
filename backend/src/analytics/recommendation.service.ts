import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';
import { PlateauDetectionResponseDto } from './dto/plateau-detection-response.dto';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async generateRecommendations(userId: string): Promise<RecommendationResponseDto[]> {
    const recommendations: RecommendationResponseDto[] = [];

    // Fetch user goals from profile
    const userGoals = await this.getUserGoals(userId);

    // Fetch necessary data in parallel
    const [
      strengthTrend,
      weeklyVolume,
      monthlyVolume,
      workoutConsistency,
      plateauDetection
    ] = await Promise.all([
      this.analyticsService.getOverallStrengthTrend(
        userId,
        this.getStartDateISO(21), // last 21 days for strength trend
        new Date().toISOString()
      ),
      this.analyticsService.getWeeklyVolume(userId),
      this.analyticsService.getMonthlyVolume(userId),
      this.analyticsService.getWorkoutConsistency(userId),
      this.analyticsService.getPlateauDetection(userId, 21) // last 21 days for plateau
    ]);

    // 1. Progressive Overload Recommendations
    recommendations.push(
      ...this.generateProgressiveOverloadRecommendations(strengthTrend, weeklyVolume, monthlyVolume, userGoals)
    );

    // 2. Recovery Recommendations
    recommendations.push(
      ...this.generateRecoveryRecommendations(workoutConsistency)
    );

    // 3. Consistency Recommendations
    recommendations.push(
      ...this.generateConsistencyRecommendations(workoutConsistency, userGoals)
    );

    // 4. Plateau-Based Recommendations
    recommendations.push(
      ...this.generatePlateauBasedRecommendations(plateauDetection, userGoals)
    );

    // 5. Goal-specific recommendations
    recommendations.push(
      ...this.generateGoalSpecificRecommendations(userGoals, weeklyVolume, workoutConsistency)
    );

    return recommendations;
  }

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

  private getStartDateISO(daysAgo: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    return startDate.toISOString();
  }

  private generateProgressiveOverloadRecommendations(
    strengthTrend: any,
    weeklyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    monthlyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    userGoals: string[]
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];
    const isStrengthFocused = this.hasGoal(userGoals, 'Gain Strength');
    const isMuscleFocused = this.hasGoal(userGoals, 'Build Muscle');

    // Strength-based progressive overload
    if (strengthTrend.improvementPercentage >= 5) {
      const priority = isStrengthFocused ? 'high' : 'medium';
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          priority,
          'Consider increasing weight to continue strength gains',
          `Your strength trend shows ${strengthTrend.improvementPercentage}% improvement over the analysis period, indicating good progress.${isStrengthFocused ? ' As you\'re focused on gaining strength, this is particularly important.' : ''} To continue overload, gradually increase weight by 2.5-5% on your main lifts.`
        )
      );
    } else if (strengthTrend.improvementPercentage > 0 && strengthTrend.improvementPercentage < 5) {
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          'high',
          'Increase weight to stimulate further strength gains',
          `Your strength improvement is modest (${strengthTrend.improvementPercentage}%). To ensure progressive overload, increase weight by 5-10% on compound lifts while maintaining proper form.`
        )
      );
    } else if (strengthTrend.improvementPercentage <= 0) {
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          'high',
          'Focus on progressive overload to break strength plateau',
          `Your strength trend shows ${strengthTrend.improvementPercentage}% change. To stimulate strength gains, ensure you're progressively overloading by increasing weight, reps, or sets over time. Consider deloading if needed then ramping up intensity.`
        )
      );
    }

    // Volume-based progressive overload
    const monthlyAvgWeekly = monthlyVolume.totalVolume / 4;
    if (weeklyVolume.totalVolume > monthlyAvgWeekly * 1.1) {
      const priority = isMuscleFocused ? 'high' : 'medium';
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          priority,
          'Volume is increasing; consider maintaining or slightly increasing',
          `Your weekly volume is above your monthly average, indicating good volume progression.${isMuscleFocused ? ' Great for muscle building — keep pushing volume.' : ''} Continue to monitor recovery and consider deloading every 4-6 weeks.`
        )
      );
    } else if (weeklyVolume.totalVolume < monthlyAvgWeekly * 0.9) {
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          'medium',
          'Consider increasing training volume',
          `Your weekly volume is below your monthly average. To ensure progressive overload, consider gradually increasing volume by adding sets, reps, or exercises.`
        )
      );
    }

    return recs;
  }

  private generateRecoveryRecommendations(
    workoutConsistency: any
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];

    // Check for excessive training frequency (too many workouts without rest)
    if (workoutConsistency.workoutsThisWeek >= 6) {
      recs.push(
        new RecommendationResponseDto(
          'recovery',
          'high',
          'Reduce training frequency to allow for recovery',
          `You've trained ${workoutConsistency.workoutsThisWeek} times this week, which may be excessive. Ensure you have at least 1-2 full rest days per week for optimal recovery and muscle growth.`
        )
      );
    } else if (workoutConsistency.workoutsThisWeek <= 2) {
      recs.push(
        new RecommendationResponseDto(
          'recovery',
          'low',
          'Current frequency allows ample recovery',
          `With ${workoutConsistency.workoutsThisWeek} workouts this week, you have plenty of time for recovery. Focus on workout quality and progressive overload.`
        )
      );
    }

    // Check current streak for insufficient recovery
    if (workoutConsistency.currentStreak >= 7) {
      recs.push(
        new RecommendationResponseDto(
          'recovery',
          'high',
          'Consider taking a rest day to prevent overtraining',
          `You've trained for ${workoutConsistency.currentStreak} consecutive days. While consistency is great, ensure you're getting adequate rest to prevent overtraining and injury.`
        )
      );
    } else if (workoutConsistency.currentStreak === 0) {
      recs.push(
        new RecommendationResponseDto(
          'recovery',
          'medium',
          'Start a workout streak to build consistency',
          `You're currently not on a workout streak. Consider starting with 2-3 workouts this week to build consistency while allowing for recovery days.`
        )
      );
    }

    return recs;
  }

  private generateConsistencyRecommendations(
    workoutConsistency: any,
    userGoals: string[]
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];
    const isConditioning = this.hasGoal(userGoals, 'Conditioning');

    // Adherence percentage: how many days in the last 28 days had workouts
    if (workoutConsistency.adherencePercentage < 50) {
      const priority = isConditioning ? 'high' : 'high';
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          priority,
          'Improve workout adherence by scheduling regular sessions',
          `Your workout adherence is ${workoutConsistency.adherencePercentage}%.${isConditioning ? ' For conditioning goals, consistency is critical — try to train at least 4-5 times per week.' : ' Aim to workout at least 3-4 times per week for consistent progress.'} Schedule your workouts in advance to improve adherence.`
        )
      );
    } else if (workoutConsistency.adherencePercentage >= 50 && workoutConsistency.adherencePercentage < 75) {
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'medium',
          'Maintain and slightly improve workout frequency',
          `Your workout adherence is ${workoutConsistency.adherencePercentage}%. Consider adding one more workout per week to reach optimal frequency of 4-5 times per week.`
        )
      );
    } else {
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'low',
          'Excellent workout adherence maintained',
          `Your workout adherence is ${workoutConsistency.adherencePercentage}%, which is excellent. Continue your current routine and focus on progressive overload.`
        )
      );
    }

    // Frequency improvement based on average workouts per week
    if (workoutConsistency.averageWorkoutsPerWeek < 3) {
      const targetFreq = isConditioning ? '4-5' : '3-5';
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'high',
          'Increase weekly workout frequency',
          `You're averaging ${workoutConsistency.averageWorkoutsPerWeek} workouts per week.${isConditioning ? ' For conditioning goals, aim for 4-5 workouts per week.' : ` For optimal progress, aim for ${targetFreq} workouts per week with adequate recovery.`}`
        )
      );
    } else if (workoutConsistency.averageWorkoutsPerWeek >= 3 && workoutConsistency.averageWorkoutsPerWeek < 5) {
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'medium',
          'Current frequency is good; consider slight increase',
          `You're averaging ${workoutConsistency.averageWorkoutsPerWeek} workouts per week, which is within the optimal range. Consider increasing to 4-5 if recovery allows.`
        )
      );
    } else {
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'low',
          'High workout frequency maintained',
          `You're averaging ${workoutConsistency.averageWorkoutsPerWeek} workouts per week. Ensure this frequency is sustainable and allows for adequate recovery.`
        )
      );
    }

    return recs;
  }

  private generatePlateauBasedRecommendations(
    plateauDetection: PlateauDetectionResponseDto,
    userGoals: string[]
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];
    const isLoseWeight = this.hasGoal(userGoals, 'Lose Weight');
    const isGainStrength = this.hasGoal(userGoals, 'Gain Strength');

    if (!plateauDetection.plateauDetected) {
      recs.push(
        new RecommendationResponseDto(
          'plateau-based',
          'low',
          'No plateau detected; continue current progressive overload strategy',
          `No plateau detected in strength, volume, or consistency. Continue to apply progressive overload principles and monitor your progress regularly.`
        )
      );
      return recs;
    }

    switch (plateauDetection.plateauType) {
      case 'strength':
        recs.push(
          new RecommendationResponseDto(
            'plateau-based',
            'high',
            'Implement strength plateau breaking strategies',
            `Strength plateau detected (confidence: ${plateauDetection.confidence}%). ${plateauDetection.explanation}.${isGainStrength ? ' Since gaining strength is a key goal, consider deloading for a week, then re-ramping with 5-10% heavier loads.' : ' Consider: 1) Deloading for a week, 2) Changing rep schemes, 3) Adding accessory work, 4) Focusing on weak points.'}`
          )
        );
        break;
      case 'volume':
        recs.push(
          new RecommendationResponseDto(
            'plateau-based',
            'high',
            'Implement volume plateau breaking strategies',
            `Volume plateau detected (confidence: ${plateauDetection.confidence}%). ${plateauDetection.explanation}. Consider: 1) Increasing training frequency, 2) Adding more sets to existing exercises, 3) Reducing rest times, 4) Incorporating intensity techniques like drop sets.`
          )
        );
        break;
      case 'consistency':
        recs.push(
          new RecommendationResponseDto(
            'plateau-based',
            'high',
            'Improve workout consistency to break plateau',
            `Consistency plateau detected (confidence: ${plateauDetection.confidence}%). ${plateauDetection.explanation}. Consider: 1) Setting fixed workout days/times, 2) Preparing workout gear in advance, 3) Finding an accountability partner, 4) Starting with shorter workouts to build habit.`
          )
        );
        break;
      default:
        break;
    }

    return recs;
  }

  private generateGoalSpecificRecommendations(
    userGoals: string[],
    weeklyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    workoutConsistency: any
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];

    if (userGoals.includes('Lose Weight')) {
      recs.push(
        new RecommendationResponseDto(
          'conditioning',
          'high',
          'Add cardiovascular and conditioning work to support weight loss',
          `Your goal is to lose weight. In addition to resistance training, consider adding 2-3 sessions of cardiovascular exercise per week (HIIT, cycling, rowing, or brisk walking). Aim for 150+ minutes of moderate-intensity cardio weekly. Combine with a slight caloric deficit for best results.`
        )
      );
    }

    if (userGoals.includes('Conditioning')) {
      recs.push(
        new RecommendationResponseDto(
          'conditioning',
          'high',
          'Focus on metabolic conditioning and circuit training',
          `Your goal is conditioning. Consider incorporating circuit-style workouts with minimal rest between exercises, supersets, and high-intensity interval training. Aim for workouts that elevate your heart rate for sustained periods. Track your recovery between sessions carefully.`
        )
      );
    }

    if (userGoals.includes('Sport')) {
      recs.push(
        new RecommendationResponseDto(
          'sport-specific',
          'medium',
          'Consider sport-specific training and periodization',
          `Your goal is sport performance. Focus on exercises that translate directly to your sport: explosive movements (power cleans, box jumps), agility drills, and sport-specific skill work. Consider periodizing your training to peak during your competitive season.`
        )
      );
    }

    if (userGoals.includes('Fundamentals')) {
      recs.push(
        new RecommendationResponseDto(
          'fundamentals',
          'medium',
          'Focus on mastering fundamental movement patterns',
          `Your goal is to build fundamentals. Prioritize mastering the squat, hinge, push, pull, and carry patterns. Focus on form over load — use lighter weights to perfect technique before progressing. Consistent practice of these basics will build a strong foundation for future training.`
        )
      );
    }

    return recs;
  }
}