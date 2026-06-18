import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { AnalyticsService } from '../analytics.service';

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
  });
});