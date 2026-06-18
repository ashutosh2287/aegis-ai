import { Injectable } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async getDashboardData(userId: string): Promise<DashboardResponseDto> {
    const [
      workoutConsistency,
      weeklyVolume,
      monthlyVolume,
      personalRecords
    ] = await Promise.all([
      this.analyticsService.getWorkoutConsistency(userId),
      this.analyticsService.getWeeklyVolume(userId),
      this.analyticsService.getMonthlyVolume(userId),
      this.analyticsService.getPersonalRecords(userId)
    ]);

    return new DashboardResponseDto(
      workoutConsistency,
      weeklyVolume,
      monthlyVolume,
      personalRecords
    );
  }
}