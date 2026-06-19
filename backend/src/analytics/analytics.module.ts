import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DashboardService } from './dashboard.service';
import { RecommendationService } from './recommendation.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, DashboardService, RecommendationService]
})
export class AnalyticsModule {}