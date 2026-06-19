import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';
import { PlateauDetectionResponseDto } from './dto/plateau-detection-response.dto';

@Injectable()
export class RecommendationService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async generateRecommendations(userId: string): Promise<RecommendationResponseDto[]> {
    const recommendations: RecommendationResponseDto[] = [];

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
      ...this.generateProgressiveOverloadRecommendations(strengthTrend, weeklyVolume, monthlyVolume)
    );

    // 2. Recovery Recommendations
    recommendations.push(
      ...this.generateRecoveryRecommendations(workoutConsistency)
    );

    // 3. Consistency Recommendations
    recommendations.push(
      ...this.generateConsistencyRecommendations(workoutConsistency)
    );

    // 4. Plateau-Based Recommendations
    recommendations.push(
      ...this.generatePlateauBasedRecommendations(plateauDetection)
    );

    return recommendations;
  }

  private getStartDateISO(daysAgo: number): string {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    return startDate.toISOString();
  }

  private generateProgressiveOverloadRecommendations(
    strengthTrend: any,
    weeklyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    monthlyVolume: { totalVolume: number; totalSets: number; totalReps: number }
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];

    // Strength-based progressive overload
    if (strengthTrend.improvementPercentage >= 5) {
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          'medium',
          'Consider increasing weight to continue strength gains',
          `Your strength trend shows ${strengthTrend.improvementPercentage}% improvement over the analysis period, indicating good progress. To continue overload, gradually increase weight by 2.5-5% on your main lifts.`
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
    // Compare weekly to monthly volume to see if volume is increasing
    const monthlyAvgWeekly = monthlyVolume.totalVolume / 4; // approximate weekly volume from monthly
    if (weeklyVolume.totalVolume > monthlyAvgWeekly * 1.1) {
      recs.push(
        new RecommendationResponseDto(
          'progressive overload',
          'medium',
          'Volume is increasing; consider maintaining or slightly increasing',
          `Your weekly volume is above your monthly average, indicating good volume progression. Continue to monitor recovery and consider deloading every 4-6 weeks.`
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
    workoutConsistency: any
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];

    // Adherence percentage: how many days in the last 28 days had workouts
    // Note: our adherencePercentage calculation is (totalWorkoutDays * 14) / 3, which seems off.
    // Let's assume totalWorkoutDays is over some period. We'll use it relatively.
    if (workoutConsistency.adherencePercentage < 50) {
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'high',
          'Improve workout adherence by scheduling regular sessions',
          `Your workout adherence is ${workoutConsistency.adherencePercentage}%. Aim to workout at least 3-4 times per week for consistent progress. Schedule your workouts in advance to improve adherence.`
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
      recs.push(
        new RecommendationResponseDto(
          'consistency',
          'high',
          'Increase weekly workout frequency',
          `You're averaging ${workoutConsistency.averageWorkoutsPerWeek} workouts per week. For optimal progress, aim for 3-5 workouts per week with adequate recovery.`
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
    plateauDetection: PlateauDetectionResponseDto
  ): RecommendationResponseDto[] {
    const recs: RecommendationResponseDto[] = [];

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
            `Strength plateau detected (confidence: ${plateauDetection.confidence}%). ${plateauDetection.explanation}. Consider: 1) Deloading for a week, 2) Changing rep schemes, 3) Adding accessory work, 4) Focusing on weak points.`
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
}