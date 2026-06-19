import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../analytics.controller';
import { AnalyticsService } from '../analytics.service';
import { DashboardService } from '../dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;
  let dashboardService: DashboardService;

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
    getPlateauDetection: jest.fn(),
  };

  const mockDashboardService = {
    getDashboardData: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    dashboardService = module.get<DashboardService>(DashboardService);
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
        workoutConsistency: {
          currentStreak: 5,
          longestStreak: 10,
          workoutsThisWeek: 3,
          workoutsThisMonth: 12,
          averageWorkoutsPerWeek: 4.0,
          adherencePercentage: 65.5,
          totalWorkoutDays: 20,
        },
        weeklyVolume: { totalVolume: 300, totalSets: 15, totalReps: 60 },
        monthlyVolume: { totalVolume: 1200, totalSets: 60, totalReps: 240 },
        personalRecords: [],
      };
      mockDashboardService.getDashboardData.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard(mockRequest);

      expect(dashboardService.getDashboardData).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockDashboard);
    });
  });

  describe('getWeeklyVolume', () => {
    it('should return weekly volume data', async () => {
      const mockUser = { id: 'user-id' };
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockWeeklyVolume = { totalVolume: 300, totalSets: 15, totalReps: 60 };
      mockAnalyticsService.getWeeklyVolume.mockResolvedValue(mockWeeklyVolume);

      const result = await controller.getWeeklyVolume(mockRequest);

      expect(analyticsService.getWeeklyVolume).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockWeeklyVolume);
    });
  });

  describe('getMonthlyVolume', () => {
    it('should return monthly volume data', async () => {
      const mockUser = { id: 'user-id' };
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockMonthlyVolume = { totalVolume: 1200, totalSets: 60, totalReps: 240 };
      mockAnalyticsService.getMonthlyVolume.mockResolvedValue(mockMonthlyVolume);

      const result = await controller.getMonthlyVolume(mockRequest);

      expect(analyticsService.getMonthlyVolume).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockMonthlyVolume);
    });
  });

  describe('getExerciseVolume', () => {
    it('should return exercise volume data', async () => {
      const mockUser = { id: 'user-id' };
      const mockExerciseId = 'exercise-id';
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockExerciseVolume = { totalVolume: 500, totalSets: 25, totalReps: 100 };
      mockAnalyticsService.getExerciseVolume.mockResolvedValue(mockExerciseVolume);

      const result = await controller.getExerciseVolume(mockExerciseId, mockRequest);

      expect(analyticsService.getExerciseVolume).toHaveBeenCalledWith('user-id', mockExerciseId);
      expect(result).toEqual(mockExerciseVolume);
    });
  });

  describe('getSessionVolume', () => {
    it('should return session volume data', async () => {
      const mockUser = { id: 'user-id' };
      const mockSessionId = 'session-id';
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockSessionVolume = { totalVolume: 400, totalSets: 20, totalReps: 80 };
      mockAnalyticsService.getSessionVolume.mockResolvedValue(mockSessionVolume);

      const result = await controller.getSessionVolume(mockSessionId, mockRequest);

      expect(analyticsService.getSessionVolume).toHaveBeenCalledWith(mockSessionId, 'user-id');
      expect(result).toEqual(mockSessionVolume);
    });
  });

  describe('getExerciseProgression', () => {
    it('should return exercise progression data', async () => {
      const mockUser = { id: 'user-id' };
      const mockExerciseId = 'exercise-id';
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockExerciseProgression = {
        exerciseId: mockExerciseId,
        currentOneRepMax: 100,
        bestOneRepMax: 120,
        improvementPercentage: 20,
        trend: 'UPWARD',
        totalWorkouts: 10,
      };
      mockAnalyticsService.getExerciseProgression.mockResolvedValue(mockExerciseProgression);

      const result = await controller.getExerciseProgression(mockExerciseId, mockRequest);

      expect(analyticsService.getExerciseProgression).toHaveBeenCalledWith('user-id', mockExerciseId);
      expect(result).toEqual(mockExerciseProgression);
    });
  });

  describe('getExerciseTrend', () => {
    it('should return exercise trend data', async () => {
      const mockUser = { id: 'user-id' };
      const mockExerciseId = 'exercise-id';
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockExerciseTrend = {
        exerciseId: mockExerciseId,
        history: [
          { date: '2023-01-01', oneRepMax: 80 },
          { date: '2023-01-02', oneRepMax: 85 },
        ],
      };
      mockAnalyticsService.getStrengthTrend.mockResolvedValue(mockExerciseTrend);

      const result = await controller.getExerciseTrend(mockExerciseId, mockRequest);

      expect(analyticsService.getStrengthTrend).toHaveBeenCalledWith('user-id', mockExerciseId);
      expect(result).toEqual(mockExerciseTrend);
    });
  });

  describe('getExercisePersonalRecords', () => {
    it('should return exercise personal records', async () => {
      const mockUser = { id: 'user-id' };
      const mockExerciseId = 'exercise-id';
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockExercisePersonalRecords = [
        { type: 'HEAVIEST_WEIGHT', value: 100, achievedAt: new Date(), exerciseId: mockExerciseId, sessionId: 'session-id' },
      ];
      mockAnalyticsService.getExercisePersonalRecords.mockResolvedValue(mockExercisePersonalRecords);

      const result = await controller.getExercisePersonalRecords(mockExerciseId, mockRequest);

      expect(analyticsService.getExercisePersonalRecords).toHaveBeenCalledWith('user-id', mockExerciseId);
      expect(result).toEqual(mockExercisePersonalRecords);
    });
  });

  describe('getPersonalRecords', () => {
    it('should return personal records', async () => {
      const mockUser = { id: 'user-id' };
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockPersonalRecords = [
        { type: 'HEAVIEST_WEIGHT', value: 100, achievedAt: new Date(), exerciseId: 'ex1', sessionId: 'sess1' },
        { type: 'MOST_REPS', value: 20, achievedAt: new Date(), exerciseId: 'ex2', sessionId: 'sess2' },
      ];
      mockAnalyticsService.getPersonalRecords.mockResolvedValue(mockPersonalRecords);

      const result = await controller.getPersonalRecords(mockRequest);

      expect(analyticsService.getPersonalRecords).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockPersonalRecords);
    });
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
});