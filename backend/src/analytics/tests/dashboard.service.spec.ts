import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { AnalyticsService } from '../analytics.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Logger } from '@nestjs/common';

describe('DashboardService', () => {
  let service: DashboardService;
  let analyticsService: AnalyticsService;

  const mockUserId = 'test-user-id';

  const mockAnalyticsService = {
    getWorkoutConsistency: jest.fn(),
    getWeeklyVolume: jest.fn(),
    getMonthlyVolume: jest.fn(),
    getPersonalRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    it('should return aggregated data from analytics service', async () => {
      const mockWorkoutConsistency = { currentStreak: 5, longestStreak: 10, workoutsThisWeek: 3, workoutsThisMonth: 12, averageWorkoutsPerWeek: 2.5, adherencePercentage: 75, totalWorkoutDays: 20 };
      const mockWeeklyVolume = { totalVolume: 1000, totalSets: 50, totalReps: 200 };
      const mockMonthlyVolume = { totalVolume: 4000, totalSets: 200, totalReps: 800 };
      const mockPersonalRecords = [{ type: 'HEAVIEST_WEIGHT', value: 100, achievedAt: new Date(), exerciseId: 'ex1', sessionId: 'sess1' }];

      mockAnalyticsService.getWorkoutConsistency.mockResolvedValue(mockWorkoutConsistency);
      mockAnalyticsService.getWeeklyVolume.mockResolvedValue(mockWeeklyVolume);
      mockAnalyticsService.getMonthlyVolume.mockResolvedValue(mockMonthlyVolume);
      mockAnalyticsService.getPersonalRecords.mockResolvedValue(mockPersonalRecords);

      const result = await service.getDashboardData(mockUserId);

      expect(result).toEqual({
        workoutConsistency: mockWorkoutConsistency,
        weeklyVolume: mockWeeklyVolume,
        monthlyVolume: mockMonthlyVolume,
        personalRecords: mockPersonalRecords,
      });

      expect(mockAnalyticsService.getWorkoutConsistency).toHaveBeenCalledWith(mockUserId);
      expect(mockAnalyticsService.getWeeklyVolume).toHaveBeenCalledWith(mockUserId);
      expect(mockAnalyticsService.getMonthlyVolume).toHaveBeenCalledWith(mockUserId);
      expect(mockAnalyticsService.getPersonalRecords).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw InternalServerErrorException when analytics service fails', async () => {
      const errorMessage = 'Database connection failed';
      mockAnalyticsService.getWorkoutConsistency.mockRejectedValue(new Error(errorMessage));

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(InternalServerErrorException);
      await expect(service.getDashboardData(mockUserId)).rejects.toThrow('Failed to generate dashboard data');
    });

    it('should log error when dashboard generation fails', async () => {
      const errorMessage = 'Database connection failed';
      const error = new Error(errorMessage);
      mockAnalyticsService.getWorkoutConsistency.mockRejectedValue(error);

      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      try {
        await service.getDashboardData(mockUserId);
      } catch (e) {
        // Expected
      }

      expect(loggerErrorSpy).toHaveBeenCalled();
      loggerErrorSpy.mockRestore();
    });
  });
});