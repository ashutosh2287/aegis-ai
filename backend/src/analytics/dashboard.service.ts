import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  async getDashboardData(userId: string): Promise<DashboardResponseDto> {
    try {
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
    } catch (error) {
      let message = 'Failed to generate dashboard data';
      let stack = undefined;
      if (error instanceof Error) {
        message = error.message;
        stack = error.stack;
      }
      this.logger.error(`Failed to generate dashboard data for user ${userId}: ${message}`, stack);
      throw new InternalServerErrorException('Failed to generate dashboard data');
    }
  }
}