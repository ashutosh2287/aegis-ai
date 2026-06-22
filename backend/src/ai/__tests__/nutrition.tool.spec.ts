import { Test, TestingModule } from '@nestjs/testing';
import { NutritionTool } from '../tools/nutrition.tool';
import { ProfileTool } from '../tools/profile.tool';

describe('NutritionTool', () => {
  let tool: NutritionTool;

  const mockProfileTool = {
    getUserProfile: jest.fn().mockResolvedValue({
      id: 'user-1',
      weight: 75,
      height: 175,
      age: 25,
      gender: 'male',
      primaryGoal: 'muscle_gain',
      goals: ['muscle_gain'],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionTool,
        {
          provide: ProfileTool,
          useValue: mockProfileTool,
        },
      ],
    }).compile();

    tool = module.get<NutritionTool>(NutritionTool);
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('calculateBMR', () => {
    it('should calculate BMR for males using Mifflin-St Jeor', () => {
      const result = tool.calculateBMR({
        weight: 75,
        height: 175,
        age: 25,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'muscle_gain',
        dietaryPreference: 'non_vegetarian',
      });

      // 10 * 75 + 6.25 * 175 - 5 * 25 + 5 = 750 + 1093.75 - 125 + 5 = 1723.75
      expect(result).toBeCloseTo(1723.75, 0);
    });

    it('should calculate BMR for females using Mifflin-St Jeor', () => {
      const result = tool.calculateBMR({
        weight: 60,
        height: 165,
        age: 30,
        gender: 'female',
        activityLevel: 'moderate',
        goal: 'fat_loss',
        dietaryPreference: 'vegetarian',
      });

      // 10 * 60 + 6.25 * 165 - 5 * 30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(result).toBeCloseTo(1320.25, 0);
    });
  });

  describe('calculateTDEE', () => {
    it('should apply correct activity multiplier', () => {
      const bmr = 1723.75;

      expect(tool.calculateTDEE(bmr, 'sedentary')).toBeCloseTo(1723.75 * 1.2, 0);
      expect(tool.calculateTDEE(bmr, 'light')).toBeCloseTo(1723.75 * 1.375, 0);
      expect(tool.calculateTDEE(bmr, 'moderate')).toBeCloseTo(1723.75 * 1.55, 0);
      expect(tool.calculateTDEE(bmr, 'active')).toBeCloseTo(1723.75 * 1.725, 0);
      expect(tool.calculateTDEE(bmr, 'very_active')).toBeCloseTo(1723.75 * 1.9, 0);
    });
  });

  describe('calculateGoalCalories', () => {
    it('should create deficit for fat loss', () => {
      const result = tool.calculateGoalCalories(2700, 'fat_loss');
      expect(result).toBe(2200);
    });

    it('should create surplus for muscle gain', () => {
      const result = tool.calculateGoalCalories(2700, 'muscle_gain');
      expect(result).toBe(3000);
    });

    it('should return maintenance for general fitness', () => {
      const result = tool.calculateGoalCalories(2700, 'general_fitness');
      expect(result).toBe(2700);
    });
  });

  describe('calculateMacros', () => {
    it('should calculate macros for muscle gain', () => {
      const result = tool.calculateMacros(3000, 'muscle_gain', 75);

      expect(result.protein).toBe(150); // 75 * 2.0
      expect(result.protein).toBeGreaterThan(0);
      expect(result.carbohydrates).toBeGreaterThan(0);
      expect(result.fat).toBeGreaterThan(0);

      const totalCalories = result.protein * 4 + result.carbohydrates * 4 + result.fat * 9;
      expect(totalCalories).toBeCloseTo(3000, -2);
    });

    it('should calculate macros for fat loss', () => {
      const result = tool.calculateMacros(2200, 'fat_loss', 75);

      expect(result.protein).toBe(165); // 75 * 2.2
      expect(result.protein).toBeGreaterThan(0);
      expect(result.carbohydrates).toBeGreaterThan(0);
      expect(result.fat).toBeGreaterThan(0);
    });
  });

  describe('getNutritionContext', () => {
    it('should return nutrition context from user profile', async () => {
      const result = await tool.getNutritionContext('user-1');

      expect(result.weight).toBe(75);
      expect(result.height).toBe(175);
      expect(result.age).toBe(25);
      expect(result.gender).toBe('male');
      expect(result.goal).toBe('muscle_gain');
    });

    it('should use provided activity level', async () => {
      const result = await tool.getNutritionContext('user-1', 'active');

      expect(result.activityLevel).toBe('active');
    });

    it('should use provided dietary preference', async () => {
      const result = await tool.getNutritionContext('user-1', undefined, 'vegetarian');

      expect(result.dietaryPreference).toBe('vegetarian');
    });
  });
});
