import { Test, TestingModule } from '@nestjs/testing';
import { AIController } from '../ai.controller';
import { AIService } from '../ai.service';
import { AiChatDto } from '../dto/ai-chat.dto';
import { WorkoutRequestDto } from '../dto/workout-request.dto';
import { NutritionRequestDto } from '../dto/nutrition-request.dto';
import { AnalysisRequestDto } from '../dto/analysis-request.dto';

describe('AIController', () => {
  let controller: AIController;
  let service: AIService;

  const mockAIService = {
    chat: jest.fn().mockResolvedValue({ message: 'Test response' }),
    generateWorkout: jest.fn().mockResolvedValue({ summary: 'Workout plan', weeklySplit: { days: [] }, notes: [] }),
    generateNutrition: jest.fn().mockResolvedValue({ summary: 'Nutrition plan', dailyCalories: 2500, goalCalories: 2800, macros: { protein: 165, carbohydrates: 339, fat: 84 }, mealPlan: {} }),
    analyzeProgress: jest.fn().mockResolvedValue({ summary: 'Analysis', workoutConsistency: 'Good', volumeProgression: 'Stable', strengthProgression: 'Improving', goalProgress: 'On track', issues: [], recommendations: [], nextActions: [] }),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy', provider: 'openai', model: 'gpt-4o-mini' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [
        {
          provide: AIService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    controller = module.get<AIController>(AIController);
    service = module.get<AIService>(AIService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should call aiService.chat with user id and dto', async () => {
      const req = { user: { id: 'user-1' } } as any;
      const dto: AiChatDto = { message: 'Hello coach' };

      const result = await controller.chat(req, dto);

      expect(service.chat).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ message: 'Test response' });
    });
  });

  describe('generateWorkout', () => {
    it('should call aiService.generateWorkout with user id and dto', async () => {
      const req = { user: { id: 'user-1' } } as any;
      const dto: WorkoutRequestDto = { goal: 'muscle_gain', daysPerWeek: 4 };

      const result = await controller.generateWorkout(req, dto);

      expect(service.generateWorkout).toHaveBeenCalledWith('user-1', dto);
      expect(result).toHaveProperty('summary');
    });
  });

  describe('generateNutrition', () => {
    it('should call aiService.generateNutrition with user id and dto', async () => {
      const req = { user: { id: 'user-1' } } as any;
      const dto: NutritionRequestDto = { dietaryPreference: 'non_vegetarian' };

      const result = await controller.generateNutrition(req, dto);

      expect(service.generateNutrition).toHaveBeenCalledWith('user-1', dto);
      expect(result).toHaveProperty('dailyCalories');
    });
  });

  describe('analyzeProgress', () => {
    it('should call aiService.analyzeProgress with user id and dto', async () => {
      const req = { user: { id: 'user-1' } } as any;
      const dto: AnalysisRequestDto = { period: 'month' };

      const result = await controller.analyzeProgress(req, dto);

      expect(service.analyzeProgress).toHaveBeenCalledWith('user-1', dto);
      expect(result).toHaveProperty('summary');
    });
  });

  describe('healthCheck', () => {
    it('should call aiService.healthCheck', async () => {
      const result = await controller.healthCheck();

      expect(service.healthCheck).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'healthy');
    });
  });
});
