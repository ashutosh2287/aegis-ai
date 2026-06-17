import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../analytics.controller';
import { AnalyticsService } from '../analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;

  const mockAnalyticsService = {
    getDashboard: jest.fn(),
    getWeeklyVolume: jest.fn(),
    getMonthlyVolume: jest.fn(),
    getExerciseVolume: jest.fn(),
    getSessionVolume: jest.fn(),
    getExerciseProgression: jest.fn(),
    getStrengthTrend: jest.fn(),
    getPersonalRecords: jest.fn(),
    getExercisePersonalRecords: jest.fn(),
    getWorkoutConsistency: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getWorkoutConsistency', () => {
    it('should return workout consistency data', async () => {
      const mockUser = { id: 'user-id' };
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockConsistency = {
        currentStreak: 5,
        longestStreak: 10,
        workoutsThisWeek: 3,
        workoutsThisMonth: 12,
        averageWorkoutsPerWeek: 4.0,
        adherencePercentage: 65.5,
        totalWorkoutDays: 20,
      };
      mockAnalyticsService.getWorkoutConsistency.mockResolvedValue(mockConsistency);

      const result = await controller.getWorkoutConsistency(mockRequest);

      expect(analyticsService.getWorkoutConsistency).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockConsistency);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      const mockUser = { id: 'user-id' };
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockDashboard = {
        totalWorkouts: 10,
        totalVolume: 5000,
        weeklyVolume: 300,
        monthlyVolume: 1200,
        personalRecords: [],
      };
      mockAnalyticsService.getDashboard.mockReturnValue(mockDashboard);

      const result = await controller.getDashboard(mockRequest);

      expect(result).toEqual(mockDashboard);
    });
  });
});