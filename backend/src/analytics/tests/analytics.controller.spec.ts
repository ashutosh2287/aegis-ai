import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsController } from "../analytics.controller";
import { DashboardService } from "../dashboard.service";
import { AnalyticsService } from "../analytics.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

describe("AnalyticsController", () => {
  let controller: AnalyticsController;
  let dashboardService: DashboardService;
  let analyticsService: AnalyticsService;

  const mockDashboardService = {
    getDashboard: jest.fn(),
  };

  const mockAnalyticsService = {
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
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    dashboardService = module.get<DashboardService>(DashboardService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  describe("getWorkoutConsistency", () => {
    it("should return workout consistency data", async () => {
      const mockUser = { id: "user-id" };
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
      mockAnalyticsService.getWorkoutConsistency.mockResolvedValue(
        mockConsistency,
      );

      const result = await controller.getWorkoutConsistency(mockRequest);

      expect(analyticsService.getWorkoutConsistency).toHaveBeenCalledWith(
        "user-id",
      );
      expect(result).toEqual(mockConsistency);
    });
  });

  describe("getDashboard", () => {
    it("should return dashboard data", async () => {
      const mockUser = { id: "user-id" };
      const mockRequest = {
        user: mockUser,
      } as any;

      const mockDashboard = {
        streaks: {
          current: 5,
          longest: 10,
        },
        workouts: {
          weekly: 3,
          monthly: 12,
          total: 20,
        },
        trainingVolume: {
          weekly: 450,
          monthly: 1800,
        },
        personalRecords: {
          heaviestWeight: 100,
          mostReps: 20,
          highestVolume: 500,
          longestSession: 3600,
        },
        strengthProgress: {
          overallImprovementPercentage: 15.5,
          trackedExercises: ["exercise-1", "exercise-2"],
        },
        recentSessions: [
          {
            id: "session-1",
            date: "2026-06-17T10:00:00.000Z",
            duration: 3600,
            exerciseCount: 2,
          },
        ],
        generatedAt: "2026-06-18T10:00:00.000Z",
      };
      mockDashboardService.getDashboard.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard(mockRequest);

      expect(mockDashboardService.getDashboard).toHaveBeenCalledWith("user-id");
      expect(result).toEqual(mockDashboard);
    });
  });
});
