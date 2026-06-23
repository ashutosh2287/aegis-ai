import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from '../ai.service';
import { ToolRegistry } from '../tools/tool-registry.service';
import { AiChatDto } from '../dto/ai-chat.dto';
import { WorkoutRequestDto } from '../dto/workout-request.dto';
import { NutritionRequestDto } from '../dto/nutrition-request.dto';
import { AnalysisRequestDto } from '../dto/analysis-request.dto';
import { AI_PROVIDER } from '../providers/provider.factory';
import { AIProvider } from '../interfaces/ai-provider.interface';
import { ModelRouter } from '../providers/model-router';
import { ProfileTool } from '../tools/profile.tool';
import { WorkoutTool } from '../tools/workout.tool';
import { ExerciseTool } from '../tools/exercise.tool';
import { AnalyticsTool } from '../tools/analytics.tool';
import { NutritionTool } from '../tools/nutrition.tool';

const mockCompletionResponse = {
  content: 'Test AI response',
  finishReason: 'stop',
  usage: {
    promptTokens: 100,
    completionTokens: 50,
    totalTokens: 150,
  },
};

const mockToolCallResponse = {
  content: null,
  toolCalls: [
    {
      id: 'call_123',
      type: 'function' as const,
      function: {
        name: 'getUserProfile',
        arguments: JSON.stringify({ userId: 'user-1' }),
      },
    },
  ],
  finishReason: 'tool_calls',
  usage: {
    promptTokens: 100,
    completionTokens: 20,
    totalTokens: 120,
  },
};

const mockFinalResponseAfterTool = {
  content: 'Based on your profile, here is my recommendation...',
  finishReason: 'stop',
  usage: {
    promptTokens: 200,
    completionTokens: 100,
    totalTokens: 300,
  },
};

const mockWorkoutJsonResponse = {
  content: JSON.stringify({
    summary: 'Test workout plan',
    weeklySplit: {
      days: [
        {
          day: 'Monday',
          focus: 'Chest & Triceps',
          exercises: [
            {
              name: 'Bench Press',
              muscleGroups: ['chest', 'triceps'],
              sets: 4,
              reps: '8-12',
              restSeconds: 90,
              notes: 'Focus on form',
            },
          ],
        },
      ],
    },
    notes: ['Progressive overload each week'],
  }),
  finishReason: 'stop',
  usage: { promptTokens: 100, completionTokens: 100, totalTokens: 200 },
};

const mockNutritionJsonResponse = {
  content: JSON.stringify({
    summary: 'Test nutrition plan',
    dailyCalories: 2500,
    goalCalories: 2800,
    macros: { protein: 165, carbohydrates: 339, fat: 84 },
    mealPlan: {
      breakfast: { name: 'Oats', description: 'Oatmeal with berries', calories: 500, protein: 20, carbohydrates: 70, fat: 12 },
      lunch: { name: 'Chicken Rice', description: 'Grilled chicken with rice', calories: 700, protein: 45, carbohydrates: 80, fat: 15 },
      dinner: { name: 'Salmon Veggies', description: 'Baked salmon with vegetables', calories: 600, protein: 40, carbohydrates: 30, fat: 25 },
      snacks: { name: 'Protein Shake', description: 'Whey protein with banana', calories: 300, protein: 30, carbohydrates: 40, fat: 5 },
    },
  }),
  finishReason: 'stop',
  usage: { promptTokens: 100, completionTokens: 100, totalTokens: 200 },
};

const mockAnalysisJsonResponse = {
  content: JSON.stringify({
    summary: 'Great progress this month',
    workoutConsistency: 'You trained 12 out of 30 days',
    volumeProgression: 'Volume increased by 15%',
    strengthProgression: 'Strength trending upward',
    goalProgress: 'On track for muscle gain',
    issues: ['Missing leg day frequently'],
    recommendations: ['Add a dedicated leg session'],
    nextActions: ['Schedule leg day on Wednesday'],
  }),
  finishReason: 'stop',
  usage: { promptTokens: 100, completionTokens: 100, totalTokens: 200 },
};

describe('AIService', () => {
  let service: AIService;
  let provider: AIProvider;
  let toolRegistry: ToolRegistry;

  const mockProvider: AIProvider = {
    complete: jest.fn() as AIProvider['complete'],
    getName: jest.fn().mockReturnValue('openai'),
    getModel: jest.fn().mockReturnValue('gpt-4o-mini'),
  };

  const mockToolRegistry = {
    getToolDefinitions: jest.fn().mockReturnValue([
      {
        type: 'function',
        function: {
          name: 'getUserProfile',
          description: 'Get user profile',
          parameters: { type: 'object', properties: { userId: { type: 'string' } }, required: ['userId'] },
        },
      },
    ]),
    executeTool: jest.fn().mockResolvedValue({
      toolCallId: '',
      name: 'getUserProfile',
      content: JSON.stringify({ id: 'user-1', age: 25 }),
      latencyMs: 50,
    }),
  };

  const mockModelRouter = {
    getModelForEndpoint: jest.fn().mockReturnValue('qwen3:8b'),
    getModels: jest.fn().mockReturnValue({
      chat: 'qwen3:8b',
      workout: 'qwen3:4b',
      nutrition: 'qwen3:4b',
      analysis: 'qwen3:4b',
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        { provide: AI_PROVIDER, useValue: mockProvider },
        { provide: ModelRouter, useValue: mockModelRouter },
        { provide: ToolRegistry, useValue: mockToolRegistry },
        { provide: ProfileTool, useValue: { getUserProfile: jest.fn().mockResolvedValue({ id: 'user-1', age: 25, gender: 'male', weight: 75, height: 180, goals: ['muscle_gain'], experienceLevel: 'intermediate', equipment: ['barbell'], primaryGoal: 'muscle_gain' }) } },
        { provide: WorkoutTool, useValue: { getWorkoutHistory: jest.fn().mockResolvedValue({ recentWorkouts: [], trainingFrequency: 3, volumeMetrics: { weeklyVolume: 0, monthlyVolume: 0, averageVolumePerWorkout: 0, totalWorkouts: 10 } }) } },
        { provide: ExerciseTool, useValue: { getExerciseLibrary: jest.fn().mockResolvedValue([]) } },
        { provide: AnalyticsTool, useValue: { getAnalytics: jest.fn().mockResolvedValue({ strengthTrends: { currentOneRepMax: 100, bestOneRepMax: 100, improvementPercentage: 5, trend: 'UPWARD' }, volumeTrends: { weeklyVolume: 5000, monthlyVolume: 20000, averageSetsPerWorkout: 20 }, consistency: { currentStreak: 5, longestStreak: 14, workoutsThisWeek: 3, workoutsThisMonth: 12, averageWorkoutsPerWeek: 3 } }) } },
        { provide: NutritionTool, useValue: { getNutritionContext: jest.fn().mockResolvedValue({ weight: 75, height: 180, age: 25, gender: 'male', activityLevel: 'moderate', goal: 'muscle_gain', dietaryPreference: 'non_vegetarian' }) } },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    provider = module.get<AIProvider>(AI_PROVIDER);
    toolRegistry = module.get<ToolRegistry>(ToolRegistry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return healthy when API call succeeds', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockCompletionResponse);
      const result = await service.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.provider).toBe('openai');
      expect(result.model).toBe('qwen3:8b');
    });

    it('should return unhealthy when API call fails', async () => {
      (mockProvider.complete as jest.Mock).mockRejectedValue(new Error('API Error'));
      const result = await service.healthCheck();
      expect(result.status).toBe('unhealthy');
    });
  });

  describe('chat', () => {
    it('should return response when model finishes without tool calls', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockCompletionResponse);
      mockToolRegistry.getToolDefinitions.mockReturnValue([]);

      const dto: AiChatDto = { message: 'Hello coach' };
      const result = await service.chat('user-1', dto);

      expect(result.message).toBe('Test AI response');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.provider).toBe('openai');
    });

    it('should execute tool calls and continue the conversation', async () => {
      (mockProvider.complete as jest.Mock)
        .mockResolvedValueOnce(mockToolCallResponse)
        .mockResolvedValueOnce(mockFinalResponseAfterTool);

      const dto: AiChatDto = { message: 'What is my profile?' };
      const result = await service.chat('user-1', dto);

      expect(result.message).toBe('Based on your profile, here is my recommendation...');
      expect(mockToolRegistry.executeTool).toHaveBeenCalledWith('getUserProfile', { userId: 'user-1' });
      expect(mockProvider.complete).toHaveBeenCalledTimes(2);
    });

    it('should pass conversation history to messages', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockCompletionResponse);

      const dto: AiChatDto = {
        message: 'Follow up question',
        history: [
          { role: 'user', content: 'Previous question' },
          { role: 'assistant', content: 'Previous answer' },
        ],
      };
      await service.chat('user-1', dto);

      const callArgs = (mockProvider.complete as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages.length).toBeGreaterThan(2);
    });
  });

  describe('generateWorkout', () => {
    it('should return parsed workout JSON response', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockWorkoutJsonResponse);

      const dto: WorkoutRequestDto = { goal: 'muscle_gain', daysPerWeek: 4 };
      const result = await service.generateWorkout('user-1', dto);

      expect(result.summary).toBe('Test workout plan');
      expect(result.weeklySplit.days.length).toBe(1);
      expect(result.weeklySplit.days[0].day).toBe('Monday');
    });

    it('should handle unstructured response gracefully', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue({
        content: 'Here is a workout plan...',
        finishReason: 'stop',
      });

      const dto: WorkoutRequestDto = { goal: 'muscle_gain' };
      const result = await service.generateWorkout('user-1', dto);

      expect(result.summary).toBe('Here is a workout plan...');
      expect(result.weeklySplit.days).toEqual([]);
      expect(result.notes).toContain('AI returned unstructured response. Please try again.');
    });

    it('should fetch profile and exercises directly without tool calls', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValueOnce(mockWorkoutJsonResponse);

      const dto: WorkoutRequestDto = { goal: 'muscle_gain', daysPerWeek: 4 };
      const result = await service.generateWorkout('user-1', dto);

      expect(result.summary).toBe('Test workout plan');
      expect(mockProvider.complete).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateNutrition', () => {
    it('should return parsed nutrition JSON response', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockNutritionJsonResponse);

      const dto: NutritionRequestDto = { dietaryPreference: 'non_vegetarian', activityLevel: 'moderate' };
      const result = await service.generateNutrition('user-1', dto);

      expect(result.summary).toBe('Test nutrition plan');
      expect(result.dailyCalories).toBe(2500);
      expect(result.goalCalories).toBe(2800);
      expect(result.macros.protein).toBe(165);
    });

    it('should handle unstructured nutrition response gracefully', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue({
        content: 'Here is your nutrition plan...',
        finishReason: 'stop',
      });

      const dto: NutritionRequestDto = {};
      const result = await service.generateNutrition('user-1', dto);

      expect(result.summary).toBe('Here is your nutrition plan...');
      expect(result.mealPlan).toBeDefined();
    });
  });

  describe('analyzeProgress', () => {
    it('should return parsed analysis JSON response', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockAnalysisJsonResponse);

      const dto: AnalysisRequestDto = { period: 'month', focus: 'overall' };
      const result = await service.analyzeProgress('user-1', dto);

      expect(result.summary).toBe('Great progress this month');
      expect(result.issues).toContain('Missing leg day frequently');
      expect(result.recommendations).toContain('Add a dedicated leg session');
    });

    it('should fetch analytics directly without tool calls', async () => {
      (mockProvider.complete as jest.Mock)
        .mockResolvedValueOnce(mockAnalysisJsonResponse);

      const dto: AnalysisRequestDto = { period: 'month' };
      const result = await service.analyzeProgress('user-1', dto);

      expect(result.summary).toBe('Great progress this month');
      expect(mockProvider.complete).toHaveBeenCalledTimes(1);
    });

    it('should default period to month when not provided', async () => {
      (mockProvider.complete as jest.Mock).mockResolvedValue(mockAnalysisJsonResponse);

      const dto: AnalysisRequestDto = {};
      const result = await service.analyzeProgress('user-1', dto);

      expect(result.summary).toBeDefined();
    });
  });
});
