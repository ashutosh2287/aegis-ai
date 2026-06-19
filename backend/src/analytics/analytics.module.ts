import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DashboardService } from './dashboard.service';
import { RecommendationService } from './recommendation.service';
import { GoalProjectionService } from './services/goal-projection.service';
import { StrengthForecastCalculator } from './services/strength-forecast-calculator';
import { VolumeForecastCalculator } from './services/volume-forecast-calculator';
import { FrequencyForecastCalculator } from './services/frequency-forecast-calculator';
import { TrendAnalysisService } from './services/trend-analysis.service';
import { GoalAchievementEstimator } from './services/goal-achievement-estimator';
import { GoalRecommendationEngine } from './services/goal-recommendation-engine';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    DashboardService,
    RecommendationService,
    GoalProjectionService,
    StrengthForecastCalculator,
    VolumeForecastCalculator,
    FrequencyForecastCalculator,
    TrendAnalysisService,
    GoalAchievementEstimator,
    GoalRecommendationEngine,
  ],
})
export class AnalyticsModule {}