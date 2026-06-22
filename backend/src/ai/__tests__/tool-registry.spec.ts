import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistry } from '../tools/tool-registry.service';
import { ProfileTool } from '../tools/profile.tool';
import { WorkoutTool } from '../tools/workout.tool';
import { ExerciseTool } from '../tools/exercise.tool';
import { AnalyticsTool } from '../tools/analytics.tool';
import { NutritionTool } from '../tools/nutrition.tool';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  const mockProfileTool = {
    getUserProfile: jest.fn().mockResolvedValue({
      id: 'user-1',
      age: 25,
      gender: 'male',
      height: 175,
      weight: 75,
      goals: ['muscle_gain'],
      experienceLevel: 'intermediate',
      equipment: ['barbell', 'dumbbells'],
      targetDaysPerWeek: 4,
      trainingYears: 2,
      primaryGoal: 'muscle_gain',
      preferredUnits: 'metric',
    }),
  };

  const mockWorkoutTool = {
    getWorkoutHistory: jest.fn().mockResolvedValue({
      recentWorkouts: [],
      trainingFrequency: 3.5,
      volumeMetrics: { weeklyVolume: 15000, monthlyVolume: 60000, averageVolumePerWorkout: 5000, totalWorkouts: 12 },
    }),
  };

  const mockExerciseTool = {
    getExerciseLibrary: jest.fn().mockResolvedValue([
      { id: 'ex-1', name: 'Bench Press', description: 'Barbell bench press', muscleGroups: ['chest'], equipmentNeeded: ['barbell', 'bench'], movementPattern: 'push', difficulty: 'intermediate' },
    ]),
  };

  const mockAnalyticsTool = {
    getAnalytics: jest.fn().mockResolvedValue({
      strengthTrends: { currentOneRepMax: 100, bestOneRepMax: 105, improvementPercentage: 5, trend: 'UPWARD' },
      volumeTrends: { weeklyVolume: 15000, monthlyVolume: 60000, averageSetsPerWorkout: 20 },
      consistency: { currentStreak: 5, longestStreak: 14, workoutsThisWeek: 3, workoutsThisMonth: 12, averageWorkoutsPerWeek: 3.5 },
    }),
  };

  const mockNutritionTool = {
    getNutritionContext: jest.fn().mockResolvedValue({
      weight: 75, height: 175, age: 25, gender: 'male', activityLevel: 'moderate', goal: 'muscle_gain', dietaryPreference: 'non_vegetarian',
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolRegistry,
        { provide: ProfileTool, useValue: mockProfileTool },
        { provide: WorkoutTool, useValue: mockWorkoutTool },
        { provide: ExerciseTool, useValue: mockExerciseTool },
        { provide: AnalyticsTool, useValue: mockAnalyticsTool },
        { provide: NutritionTool, useValue: mockNutritionTool },
      ],
    }).compile();

    registry = module.get<ToolRegistry>(ToolRegistry);
  });

  it('should be defined', () => {
    expect(registry).toBeDefined();
  });

  describe('getToolDefinitions', () => {
    it('should return 5 tool definitions', () => {
      const tools = registry.getToolDefinitions();
      expect(tools).toHaveLength(5);
    });

    it('should return valid OpenAI function tool format', () => {
      const tools = registry.getToolDefinitions();
      for (const tool of tools) {
        expect(tool.type).toBe('function');
        expect(tool.function.name).toBeDefined();
        expect(tool.function.description).toBeDefined();
        expect(tool.function.parameters).toBeDefined();
      }
    });

    it('should include all required tool names', () => {
      const tools = registry.getToolDefinitions();
      const names = tools.map((t) => t.function.name);
      expect(names).toContain('getUserProfile');
      expect(names).toContain('getWorkoutHistory');
      expect(names).toContain('getExerciseLibrary');
      expect(names).toContain('getAnalytics');
      expect(names).toContain('getNutritionContext');
    });
  });

  describe('executeTool', () => {
    it('should execute getUserProfile and return JSON', async () => {
      const result = await registry.executeTool('getUserProfile', { userId: 'user-1' });
      expect(result.name).toBe('getUserProfile');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      const parsed = JSON.parse(result.content);
      expect(parsed.id).toBe('user-1');
      expect(parsed.age).toBe(25);
    });

    it('should execute getWorkoutHistory and return JSON', async () => {
      const result = await registry.executeTool('getWorkoutHistory', { userId: 'user-1' });
      expect(result.name).toBe('getWorkoutHistory');
      const parsed = JSON.parse(result.content);
      expect(parsed.trainingFrequency).toBe(3.5);
    });

    it('should execute getExerciseLibrary and return JSON', async () => {
      const result = await registry.executeTool('getExerciseLibrary', {});
      expect(result.name).toBe('getExerciseLibrary');
      const parsed = JSON.parse(result.content);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });

    it('should execute getAnalytics and return JSON', async () => {
      const result = await registry.executeTool('getAnalytics', { userId: 'user-1' });
      expect(result.name).toBe('getAnalytics');
      const parsed = JSON.parse(result.content);
      expect(parsed.strengthTrends.trend).toBe('UPWARD');
    });

    it('should execute getNutritionContext and return JSON', async () => {
      const result = await registry.executeTool('getNutritionContext', {
        userId: 'user-1',
        activityLevel: 'moderate',
        dietaryPreference: 'non_vegetarian',
      });
      expect(result.name).toBe('getNutritionContext');
      const parsed = JSON.parse(result.content);
      expect(parsed.weight).toBe(75);
    });

    it('should return error JSON when tool execution fails', async () => {
      mockProfileTool.getUserProfile.mockRejectedValueOnce(new Error('DB connection failed'));

      const result = await registry.executeTool('getUserProfile', { userId: 'user-1' });
      const parsed = JSON.parse(result.content);
      expect(parsed.error).toBe('DB connection failed');
    });

    it('should return error JSON for unknown tool', async () => {
      const result = await registry.executeTool('unknownTool', {});
      const parsed = JSON.parse(result.content);
      expect(parsed.error).toBe('Unknown tool: unknownTool');
    });
  });
});
